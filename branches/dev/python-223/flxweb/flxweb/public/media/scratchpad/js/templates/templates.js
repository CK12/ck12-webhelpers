// USE DOUBLE QUOTES FOR THE DEPENDENCY LIST!
define([
    "text!templates/scratchpad.html",
    "text!templates/toolbox.html"
], function(scratchpad, toolbox) {

  // TODO: can't have a line break in the function argument!!!!
  //
  // NOTE: don't change the name of the 'templates' var, and you need to 
  // be really strict with this file: 
  // keep all the naming conventions the same
  var templates = {
    scratchpad:scratchpad,
    toolbox:toolbox
  };
  return templates;

});
