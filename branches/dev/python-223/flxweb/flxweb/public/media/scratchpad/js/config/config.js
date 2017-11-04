define(function () {

  var GLOBAL_CONFIG = {
    STROKE_WIDTH : {
      DEFAULT : 2, 
      THIN    : 2,
      MED     : 5,
      THICK   : 10,
      ERASER  : 25
    },
    COLOR : {
      DEFAULT : '#000000',
      ERASER  : '#FFFFFF'
    },
    PALETTE: {
      DEFAULT: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000cd", "#4b0082", "#9400d3"]]
    },
    FILE_NAME : {
      DOWNLOAD : 'scratchpad.png'
    },
    MIME_TYPE : {
      DEFAULT : 'image/png'
    }
  };

  return GLOBAL_CONFIG;

});
