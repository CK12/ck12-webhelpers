define([
  "./AnnotationTool"
], function (AnnotationTool) {

  // Globals and config here

  // shim for requestAnimationFrame with setTimeout fallback
  window.requestAnimationFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // replaced in build step
  AnnotationTool.version = '##VERSION##';

  window.Scratchpad = AnnotationTool;

  return AnnotationTool;

});
