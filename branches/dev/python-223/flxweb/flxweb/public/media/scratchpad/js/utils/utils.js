// pretty much everything in here needs to be executed within the context of 
// the annotationtool view. 
define([
  '../templates/templates',
  '../config/config'
], function (templates, GLOBAL_CONFIG) { 

  var utils = ({
        
    dataURItoBlob: function(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);
      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      // write the ArrayBuffer to a blob, and you're done
      return new Blob([ab],{type: mimeString});
    },

    /**
     * Prepare a new canvas by setting the drawing context
     */
    readyCanvas: function() {
      this.canvas = this.el;
      this.context = this.canvas.getContext('2d');
      this.context.imageSmoothingEnabled = true;
      this.context.translate(0.5, 0.5);
      // ----------------------------------------------------------------------------------------
      // Set HTML attributes
      this.$el.attr('id', this.model.get('id'));
      this.setSize(this.model.get('canvasWidth'), this.model.get('canvasHeight'));
    },

    /** Render the UI tools */
    renderUtils: function($target) {

      /** Set up spectrum color picker.  */
      function renderColorPicker ($target) {
        var context = this.context;
        var that = this;

        var sstyle = null;

        this.colorPicker = $target.find('.spectrum-color-picker');
        this.colorPicker.spectrum({
          showPaletteOnly: true,
          color : GLOBAL_CONFIG.COLOR.DEFAULT,
          palette: GLOBAL_CONFIG.PALETTE.DEFAULT, 
          replacerClassName :'icon-paintcan tool js-paintbucket',
          change : function(color) {
            sstyle =  color.toHexString(); 
            context.strokeStyle = sstyle;
            $(that.colorPicker).spectrum('hide');
          },
          hide : function(color) {
            context.strokeStyle = sstyle;
            that.trigger('color-picker-hide');   
          }
        });
        this.on('close menu.close', function() { $(that.colorPicker).spectrum('hide') });
        var spectrumReplacerEl = this.colorPicker[0].nextSibling;
        var divs = spectrumReplacerEl.querySelectorAll('div')
        for ( var d=0; d<divs.length; ++d ) divs[d].setAttribute('style', 'display:none;');
        spectrumReplacerEl.setAttribute('title', 'color');
      }

      var $template = $( _.template(templates.toolbox, { variable: 'data' })({}) );
      renderColorPicker.call(this, $template); 
      $target.append($template);


    },

    /**
     * Draw a 'soft' line on a canvas. This method will actually draw several lines with 
     * different transparancies and widths to make the illusion of a single soft line.
     *
     * @param {Object} ctx The 2d drawing context of a canvas
     * @param {Number} x1 starting x coordinate
     * @param {Number} y1 starting y coordinate
     * @param {Number} x2 ending x coordinate
     * @param {Number} y2 ending y coordinate
     * @param {Number} [lineWidth] width of line to draw
     * @param {String} [rgb] Hex color code (e.g. #1e1e1e) 
     * @param {Number} [alpha] alpha channel 
     */
    drawSoftLine: function (ctx, x1, y1, x2, y2, lineWidth, rgb, alpha) {
      var widths = [1   , 0.8 , 0.6 , 0.4 , 0.2  ];
      var alphas = [0.2 , 0.4 , 0.6 , 0.8 , 1    ];
      var _alpha;
      var previousAlpha = 0;
      if (!alpha) { alpha = 0.8; }
      if (!lineWidth) { lineWidth = ctx.lineWidth; }
      var firstLineWidth = lineWidth
      var deltaAlpha = null;
      var r,g,b;
      if (!rgb) { rgb = ctx.strokeStyle; }
      var hexColors = rgb.substring(1);
      r = Number('0x'+hexColors[0]+hexColors[1]);
      g = Number('0x'+hexColors[2]+hexColors[3]);
      b = Number('0x'+hexColors[4]+hexColors[5]);
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgb(0,0,0)';

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + deltaAlpha + ')';
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },

    /**
     * Draw a 'soft' line on a canvas. This method will actually draw several lines with 
     * different transparancies and widths to make the illusion of a single soft line.
     *
     * @param {Object} ctx The 2d drawing context of a canvas
     * @param {Number} x1 starting x coordinate
     * @param {Number} y1 starting y coordinate
     * @param {Number} x2 ending x coordinate
     * @param {Number} y2 ending y coordinate
     */
    drawLine: function (ctx, x1, y1, x2, y2) {

      var r,g,b;
      var lineWidth = ctx.lineWidth; 
      var rgb = ctx.strokeStyle;
      var hexColors = rgb.substring(1);
      var ALPHA = 1;

      r = Number('0x'+hexColors[0]+hexColors[1]);
      g = Number('0x'+hexColors[2]+hexColors[3]);
      b = Number('0x'+hexColors[4]+hexColors[5]);

      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.shadowBlur = 2;
      ctx.shadowColor = 'rgb('+r+','+g+','+b+')';

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + ALPHA + ')';
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

  });

  return utils;
});
