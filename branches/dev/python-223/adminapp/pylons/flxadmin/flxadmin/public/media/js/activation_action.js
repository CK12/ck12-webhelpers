ActivationAction = function(statTag, emailQueryStr, id_or_editSelf, scope){
  // statTag: specifies the status text is via what elm tag, eg. 'input' or null
  var 
    scope = scope || '',
    statViaInput = statTag == 'input',
    getemail = function(ai){
      return emailQueryStr == '.mailto'? 
        ai.parent().parent().children(emailQueryStr).text().trim() : 
        $.trim($(scope+' #email').val());
    },
    getID = function(ai){
        return emailQueryStr == '.mailto'? 
        ai.parent().parent().children(".id").text().trim() : 
        $.trim($(scope+' #UserId').text().trim());
    },
    get$actionstat = function(ai){
      var siblings = ai.siblings();
      return statViaInput? siblings.filter('input') : siblings.filter('.actionstat');
    },
    get$actionmsg = function(ai){
      return ai.siblings().filter('.actionmsg');
    },
    isInactive = function(as){
      var stat = statViaInput? as.val() : as.text();
      return stat.match(/\w*[d|D][i|e]/);
    },
    setStat = function(stat, as){
      statTag=='input'? as.val(stat) : as.text(stat);
    },
    apiAction = function(as){
      return isInactive(as)? 'activate' : 'deactivate';
    },
    apiActionDis = function(as){
      return isInactive(as)? 'activate' : 'disable';
    },
    updateActionitem = function(ai, as){
      ai.text(isInactive(as)? '[Activate]' : '[Deactivate]');
    },
    updateDisableitem = function(ai, as){
      ai.text(isInactive(as)? '[Enable]' : '[Disable]');
    };

  $('.actionitem').click(function(){
    var 
      $ai = $(this),
      $as = get$actionstat($ai),
      $am = get$actionmsg($ai),
      email = getemail($ai);
      previousState = $ai.parent().children('.actionstat').text();
      resetPasswordUrl = CK12.authUrl('update/member/forget/password/'+email);
    if (!email) return false;
    $.ajax({
      url: CK12.authUrl(apiAction($as)+'/member/'+encodeURIComponent(email)),
      success: function(data) {
        var 
          newStat = apiAction($as)+'d',
          msg = _(newStat).capitalize();
          
	        //Send email notification to the user for activation his account when the account is to be activated from disabled state
	        if(previousState == 'disabled' && newStat == 'deactivated'){
	            params = {}
	            params['activationEmail'] = 'activation';
	            $.ajax({url: resetPasswordUrl,
	                success: function(data){
	                    Fns.setActionMsg($am, 'success', msg);
	                    setStat(newStat, $as);
	                    updateActionitem($ai, $as);
	                },
	                data: params,
	                error: function(xhr, textStatus, errorThrown){
	                    Fns.setActionMsg($am, 'error', textStatus, errorThrown);
	                }
	            });
	        }else{
            Fns.setActionMsg($am, 'success', msg);
            setStat(newStat, $as);
            updateActionitem($ai, $as);
        }
      },
      error: function(xhr, textStatus, errorThrown){
        Fns.setActionMsg($am, 'error', textStatus, errorThrown);
      }
    });
  });
  
  $('.disableitem').click(function(){
    var 
      $ai = $(this),
      $as = get$actionstat($ai),
      $am = get$actionmsg($ai),
      email = getemail($ai);
      userid = getID($ai);
    $.ajax({
      url: CK12.authUrl(apiActionDis($as)+'/member/'+userid),
      success: function(data) {
        var 
          newStat = apiActionDis($as)+'d',
          msg = _(newStat).capitalize();
        Fns.setActionMsg($am, 'success', msg);
        setStat(newStat, $as);
        updateDisableitem($ai, $as);
        //Bug 14176 Removed [Active/Deactivate] links from admin app
        /*var 
          $oai = $ai.parent().children('.actionitem'),
          $oas = get$actionstat($oai);
        updateActionitem($oai, $oas);*/
      },
      error: function(xhr, textStatus, errorThrown){
        Fns.setActionMsg($am, 'error', textStatus, errorThrown);
      }
    });
  });

	//Bug 14176 Removed [Active/Deactivate] links from admin app
  /*// Display [Active/Deactivate] action links
  $(scope+' .actionitem').each(function(i, actionitem){
    var 
      userid = parseInt(id_or_editSelf, 10),
      id = $(actionitem).parent().parent().children('.id').text(),
      $ai = $(actionitem),
      $as = get$actionstat($ai);

    if (id_or_editSelf === 'True' || (userid > 0 && id == userid) ){
      $ai.hide();
    } else {
      updateActionitem($ai, $as);
    }
  });*/
  
  //Bug 14176 Added toggle [Enable] action link
  // Display [Disable] action links
  $(scope+' .disableitem').each(function(i, disableitem){
    var 
      userid = parseInt(id_or_editSelf, 10),
      id = $(disableitem).parent().parent().children('.id').text(),
      $ai = $(disableitem),
      $as = get$actionstat($ai);

    if (id_or_editSelf === 'True' || (userid > 0 && id == userid) ){
      $ai.hide();
    } else {
      updateDisableitem($ai, $as);
    }
  });

};
