PublishAction = (function(statTag){
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
    unpublished = function(as){
      var stat = statViaInput? as.val() : as.text();
      return stat.match(/\w*[u|U]n/);
    },
    setStat = function(stat, as){
      statViaInput? as.val(stat) : as.text(stat);
    },
    apiAction = function(as){
      return unpublished(as)? 'publish' : 'unpublish';
    },
    updateActionitem = function(ai, as){
      ai.text(unpublished(as)? ' [Click to Publish]' : ' [Click to Unpublish]');
    };

    makeAPICall = function($ai,$as,params){
        var 
          $am = get$actionmsg($ai),
          id = $ai.parent().parent().children('.id').text();
          creatorID = $ai.parent().parent().children('.creatorid').text();
          params['impersonateMemberID'] = creatorID;
        hideOverlayPopup();
        $.ajax({
          url: CK12.flxUrl(apiAction($as)+'/revision/'+id),
          data: params,
          type:'POST',
          success: function(data) {
            var newStat = _(apiAction($as)+'ed').capitalize();
            Fns.setActionMsg($am, 'success', newStat);
            setStat(newStat, $as);
            updateActionitem($ai, $as);
         },
         error: function(xhr, textStatus, errorThrown){
            Fns.setActionMsg($am, 'error', textStatus, errorThrown);
         }
       });
    }
    
    showDialog = function(){
    	$('#published_request_information').val('');
    	var maskHeight = $(document).height();
		var maskWidth = $(window).width();
	
		//Set heigth and width to mask to fill up the whole screen
		$('#mask').css({'width':maskWidth,'height':maskHeight});
		
		//transition effect		
		$('#mask').fadeIn(1000);	
		$('#mask').fadeTo("slow",0.8);	
	
		//Get the window height and width
		var winH = $(window).height();
		var winW = $(window).width();
              
		//Set the popup window to center
		$('#dialog').css('top',  winH/2-$('#dialog').height()/2);
		$('#dialog').css('left', winW/2-$('#dialog').width()/2);
	
		//transition effect
		$('#dialog').fadeIn(2000); 
    }
    
	var currentRow;
	
	$('.actionitem').click(function(e) {
		//Cancel the link behavior
		e.preventDefault();
		var $ai = $(this),
 			$as = get$actionstat($ai);
  		if (apiAction($as) == 'unpublish'){
  			params = {};
  			makeAPICall($ai,$as,params);
  		}else{
  			currentRow = $ai;
  			showDialog();
  		}
	});
	
	$('#publish_artifact').click(function(e){
		params = {};
		authorizedBy = $.trim($('#autorizedBy_txt').val());
		published_request_information = $.trim($('#published_request_information').val());
		if (authorizedBy == '' || published_request_information == ''){
			alert('All fields are required');
			return false;
		}
		else if (/(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9]+(?:-*[A-Z0-9]+)*\.)+[A-Z]{2,6}$/i.test(authorizedBy) == false){
			alert('Invalid email address for Authorized By field');
			return false;
		}
		params['autorizedBy'] = authorizedBy;
		params['publishedComments'] = published_request_information;
		makeAPICall(currentRow,get$actionstat(currentRow),params);
	})
	
	hideOverlayPopup = function(){
		$('#mask').hide();
		$('.overlay_form').hide();
	}
	
	//if close button is clicked
	$('.overlay_form .close').click(function (e) {
		//Cancel the link behavior
		e.preventDefault();
		hideOverlayPopup();
	});		
	
	//if mask is clicked
	$('#mask').click(function () {
		$(this).hide();
		$('.overlay_form').hide();
	});			

	$(window).resize(function () {
	 
 		var box = $('#boxes .overlay_form');
 
        //Get the screen height and width
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();
      
        //Set height and width to mask to fill up the whole screen
        $('#mask').css({'width':maskWidth,'height':maskHeight});
               
        //Get the window height and width
        var winH = $(window).height();
        var winW = $(window).width();

        //Set the popup window to center
        box.css('top',  winH/2 - box.height()/2);
        box.css('left', winW/2 - box.width()/2);
	 
	});

  // Display [Publish/Unpublish] action links
  $('.actionitem').each(function(i, actionitem){
    var 
      $ai = $(actionitem),
      $as = get$actionstat($ai);
    updateActionitem($ai, $as);
  });

});
});
