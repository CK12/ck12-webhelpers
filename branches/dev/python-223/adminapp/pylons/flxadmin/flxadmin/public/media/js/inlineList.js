InlineList = function(args){
  args = $.extend({
    ajaxRoot: '', // eg. CK12.admUrl('artifacts_list')
    actionFns: [],  // action generation functions
    addMailtos: false,  // if emails will be made mailto's
    postLoad: null, // function to call after results loaded
    extraStyling: null, // function to apply extra styling
  }, args);


  $(document).ready(function(){
    var
    tbodySel = '.inline.table .tbody ',
    trSel = tbodySel+'.tr ',
    $tbody = $(tbodySel),

    updateResult = function(urlOrParams, callback){
      $.ajax({url: args.ajaxRoot,
        success: function(data) {
          var
            $data = $($.trim(data)),
            $list = $data.filter('.tr');

          $tbody.html($list);
          if (callback) callback();
          updateResultLinks();
          if (args.postLoad) args.postLoad();
          if (args.extraStyling) args.extraStyling();
        }
      });
    },

    updateResultLinks = function(){
      $.each(args.actionFns, function(i, f){ f(); }); // insert action links
    };

    updateResult();

  });
};