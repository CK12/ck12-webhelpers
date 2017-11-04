define([
  'jquery',
  '../views/plix.widget.view'
], function($, plixWidget) {

  function dressPlix() {
    var geogebraFrames = [];
    var arr = [].slice.call(document.querySelectorAll('[itemprop=video]'));
    var pxv = arr.filter(function(div) {
      var frame = div.querySelector('iframe');
      if(frame && (frame.src.indexOf('flx/show/interactive') !== -1)){
        if(frame.src.indexOf('assessment/tools/geometry-tool/') !== -1){
          return true;
        } else if(frame.src.indexOf('geogebra.org') !== -1){
          geogebraFrames.push(div);
        }
      }
    });
    pxv.forEach(function(pxDiv, index) {
      if(pxDiv.closest('.detailswrap')){
        return;
      }
      var iframe = pxDiv.querySelector('iframe');
      /*Handling case where element [itemprop=video] has child element [itemprop=video]*/
      if(!iframe){
        var log = "Incorrect tree structure --  [itemprop=video] has child element [itemprop=video]";
        console.log(log);
        if (window.trackJs){
          window.trackJs.track(log);
        }
        return;
      }
      var parent = iframe.parentElement;
      var jParent = $(parent);
      jParent.addClass('interactive-frame');
      //some other JS adds inlined padding that we need to remove first
      jParent.removeAttr("style");
      $(iframe).addClass('x-ck12-customembed').remove();
      new plixWidget({
        el: parent,
        plixFrame: iframe,
        count: index
      });
    });

    geogebraFrames.forEach(function(ggbDiv){
      var iframe = ggbDiv.querySelector('iframe');
      /*Handling case where element [itemprop=video] has child element [itemprop=video]*/
      if(!iframe){
        var log = "Incorrect tree structure --  [itemprop=video] has child element [itemprop=video]";
        console.log(log);
        if (window.trackJs){
          window.trackJs.track(log);
        }
        return;
      }
        var parent = iframe.parentElement;
        var jParent = $(parent);
        jParent.addClass('geogebra-frame');
        //some other JS adds inlined padding that we need to remove first
        jParent.removeAttr("style");
        $(iframe).addClass('x-ck12-customembed');

        var interactiveHeader = $("<div></div>");
        interactiveHeader.addClass("interactive-header");

        var interactiveHeaderIcon = $("<div></div>");
        interactiveHeaderIcon.addClass('interactive-header-icon');

        var interactiveIcon = $('<img src="/media/images/icon-interactive.png"></img>');
        //interactiveIcon.addClass('icon-lightbulb');
        interactiveHeaderIcon[0].appendChild(interactiveIcon[0]);

        var interactiveHeaderText = $("<div></div>");
        interactiveHeaderText[0].innerText = "INTERACTIVE";
        interactiveHeaderText.addClass('interactive-header-text');

        interactiveHeader[0].appendChild(interactiveHeaderIcon[0]);
        interactiveHeader[0].appendChild(interactiveHeaderText[0]);

        //this one forces plix to render in the center
        var plixContainer = $('<div></div>');
        plixContainer.addClass("plix-container");
        if ($(window).width() < 550) {
          var smallScreenWarning = $('<div></div>');
          smallScreenWarning.addClass('plix-small-screen');
          smallScreenWarning[0].innerText = "Your screen size is too narrow to render the interactive.";
          plixContainer[0].appendChild(smallScreenWarning[0]);
          //plixContainer[0].innerText = "Your screen size is too narrow to render PLIX";
          $(iframe).addClass('hide');
        } else {
          plixContainer[0].appendChild(iframe);
        }

        parent.appendChild(interactiveHeader[0]);
        parent.appendChild(plixContainer[0]);
    });
  }

  function init() {
    dressPlix();
  }
  return {
    init: init,
    dressPlix: dressPlix,
  };
});
