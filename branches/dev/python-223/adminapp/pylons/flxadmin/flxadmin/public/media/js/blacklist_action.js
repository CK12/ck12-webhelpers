BlacklistAction = (function(statTag){
  // statTag: specifies the status text is via what elm tag, eg. 'input' or null
$(document).ready(function(){
  var 
    statViaInput = statTag == 'input',
    get$actionstat = function(ai){
      var siblings = ai.siblings();
      return statViaInput? siblings.filter('input') : siblings.filter('.actionstat');
    },
    get$actionmsg = function(ai){
      return ai.siblings().filter('.actionmsg');
    },
    unblacklisted = function(as){
      var stat = statViaInput? as.val() : as.text();
      return stat.match(/\w*[n|N]o/);
    },
    setStat = function(stat, as){
      statTag=='input'? as.val(stat) : as.text(stat);
    },
    apiAction = function(as){
      return unblacklisted(as)? 'update' : 'delete';
    },
    updateActionitem = function(ai, as){
      ai.text(unblacklisted(as)? '[Blacklist it]' : '[Remove Blacklist]');
    };

  $('.actionitem').click(function(){
    var 
      $ai = $(this),
      $as = get$actionstat($ai),
      $am = get$actionmsg($ai),
      id = $ai.parent().parent().children('.id').text();
    $.ajax({type: 'POST',
      data: {providerID: id},
      url: CK12.flxUrl(apiAction($as)+'/embeddedobjectprovider/blacklist'),
      success: function(data) {
        var
          newStat = unblacklisted($as)? 'Yes' : 'No',
          msg = newStat=='Yes'? 'Blacklisted': 'Blacklist Removed';
        Fns.setActionMsg($am, 'success', msg);
        setStat(newStat, $as);
        updateActionitem($ai, $as);
        $(".td.actionitemwrap.medx").removeClass("medx");
        $($ai).parent(".td.actionitemwrap").addClass("medx");
        alert("Please invalidate the resource cache for this action to take effect.");
      },
      error: function(xhr, textStatus, errorThrown){
        Fns.setActionMsg($am, 'error', textStatus, errorThrown);
      }
    });
  });

  // Display [Active/Deactivate] action links
  $('.actionitem').each(function(i, actionitem){
    var 
      $ai = $(actionitem),
      $as = get$actionstat($ai);
    updateActionitem($ai, $as);
  });

});
});