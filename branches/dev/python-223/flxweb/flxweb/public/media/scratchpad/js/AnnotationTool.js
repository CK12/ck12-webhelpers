define([
  './view/AnnotationView',
  './model/AnnotationModel',
  './utils/utils',
  './templates/templates',
  './config/config'
],function (AnnotationView, AnnotationModel, utils, templates, GLOBAL_CONFIG) {

  /**
   * @constructor AnnotationTool
   * @param {object} options.target jquery_selector_or_object Should point to a DOM reference via 
   *                                query selector or an actual jquery object.
   */
  function AnnotationTool(options) {
    var that = this;
    var _model = new AnnotationModel(options);
    var _view = new AnnotationView({model:_model});

    this.utils = utils;
    this.$template = null;
    // saveState - save the canvas state (drawing)
    this.saveState = null;

    /** 
     * proxy to _model.get 
     * @memberof! AnnotationTool
     */
    this.get = function(parameter) {
      return _model.get(parameter);
    };

    /** 
     * proxy to _model.set 
     * @memberof! AnnotationTool
     */
    this.set = function(parameter, value) {
      return _model.set(parameter, value);
    };

    /** 
     * proxy to the _view trigger method for events 
     * @memberof! AnnotationTool
     */
    this.trigger = function() {
      _view.trigger.apply(_view, arguments);
    };

    /** 
    * @memberof! AnnotationTool
    */
    this.getCanvasRef = function(){
        return _view.getCanvasRef();
    };

    /** Safe way to close the color palette */
    this.safeClosePalette = function() {
      return _view.closeColorPicker();
    };

    /** return a ImageData object of canvas drawing */
    this.getImgData = function() {
      return _view.getCurrentImageData();
    };

    /** return a base64 representation of the current drawing */
    this.getImg = function(type) {
      return _view.getCurrentImage(type);
    };

    /**
     * Insert an image on the canvas background so that you can draw or 
     * annotate on top of it.
     * @memberof! AnnotationTool
     */
    this.drawImage = function(img, x, y) {
      _view.drawImage.apply(_view, arguments);
    };

    this.putImageData = function(img, x, y, dirtyX, dirtyY, dWidth, dHeight) {
      _view.putImageData.apply(_view, arguments);
    };

    /** 
     * turn on and off the eraser tool 
     * @deprecated
     */
    this.eraser = {
      on: function() {
        that.set('eraser', 'on');
      },
      off: function() {
        that.set('eraser', 'off');
      }
    }; 
    /**
     * Set up the base template and tool bar. This method triggers the `render` event on
     * the {AnnotationView} to initialize and render the drawing canvas.
     *
     * @memberof! AnnotationTool
     */
    this.render = function() {
      //this.set('target', $(jquery_selector_or_object));
      var $target = _model.get('target');
      var templateConfig = { };
      this.$template = $( _.template(templates.scratchpad, {variable: 'data'})(templateConfig) );
      if ( ! $target[0] ) throw 'Must specify the target container element.';
      $target.prepend(this.$template);
      this.trigger('render', this.$template);
      this.setActiveTool('pencil')
      var $tools = this.$template.find('.annotation-tools');
      this.renderUtils($tools);
      _bindUtilsEvents.call(this, $tools, _view, options);
      // look at the root element in the target, and fit the scratchpad to fill 100% width and 100% height of it.
      var tStyle = window.getComputedStyle($target.find('.annotation-tool-wrapper')[0]);
      this.set("size", [parseInt(tStyle.width), parseInt(tStyle.height)]);
      var $thin = $tools.find('[data-stroke="thin"]').click();
      this.colorPicker = _view.colorPicker;
    };

    if ( ! options.target ) {
      throw 'missing target';
    }
    
    _model.set('target', $(options.target));
    this.render();

  }

  /**
   * Set the target on which to overlay the tool.
   * @memberof AnnotationTool
   * @param - You can pass a css selector or jQuery object.
   */
  AnnotationTool.prototype.setTarget = function(jquery_selector_or_object) {
    this.set('target', jquery_selector_or_object);
  };

  /** 
   * @memberof AnnotationTool 
   */
  AnnotationTool.prototype.getTarget = function() {
    return this.get('target');
  };

  /** 
   * @method 
   * @memberof AnnotationTool 
   * @param {string} toolString - The name of the desiered tool to be used (e.g. 'pencil').
   */
  AnnotationTool.prototype.setActiveTool = function(toolString) {
    this.set('activeTool', toolString);
  }; 

  /** 
   * Clear any previously selected tools. Set to default thin pencil.
   * @memberof AnnotationTool 
   * @method 
   */
  AnnotationTool.prototype.resetActiveTools = function() {
    var $tools = this.$template.find('.annotation-tools');
    var $thin = $tools.find('[data-stroke="thin"]');
    var $med = $tools.find('[data-stroke="med"]');
    var $thick = $tools.find('[data-stroke="thick"]');
    var $eraser = $tools.find('.js-eraser');
    var $paintbucket = $tools.find('.js-paintbucket');
    [$thin, $med, $thick, $paintbucket, $eraser].forEach(function($el, idx, self) {
        $el.removeClass('selected');
      }); 
    $thin.click();
  }; 

  /** 
   * Set the current brush stroke size 
   * @memberof AnnotationTool 
   * @method
   */
  AnnotationTool.prototype.setStrokeWidth = function(width) {
    var w = String(width).replace('px', ''); 
    if (Number.isNaN(parseInt(w))) {
      throw 'Can not parse stroke width';
    } else {
      this.model.set('strokeWidth', w);
    }
    return null;
  };

  /** 
   * Set strok style of canvas brush
   * @memberof AnnotationTool 
   * @method 
   */
  AnnotationTool.prototype.setStrokeStyle = function(style) {
    this.set('strokeStyle', style);
  };

  /** 
   * Clear the canvas 
   * @memberof AnnotationTool 
   * @method 
   */
  AnnotationTool.prototype.clear = function() {
    this.trigger('clearCanvas');
  };
  
  
  /**
   * Sets the canvas background of the drawing.
   * @param {string} imgSrc Should be a data url or a url.
   * @memberof AnnotationTool 
   */
  AnnotationTool.prototype.setBackground = function(imgSrc) {
    this.set('background', imgSrc);
  };

  
  /**
   * Sets the target for the tools, (which should be specified by the template).
   * @memberof AnnotationTool 
   */
  AnnotationTool.prototype.renderUtils = function(jquery_selector_or_object) {
    this.set('toolsTarget', jquery_selector_or_object);
    this.trigger('renderUtils', jquery_selector_or_object);
  };

  /** 
   * User calls the `close` function.
   * Trigger close on the view and call `onclose`.
   * @memberof AnnotationTool 
   */
  AnnotationTool.prototype.close = function () {
    this.trigger('close');
    this.$template.addClass('hide');
    this.onclose();
  };


  /** 
   * User defines the onclose function.
   * @memberof AnnotationTool 
   */
  AnnotationTool.prototype.onclose = function () { };

  /**
   * Opens the scratchpad and triggers an event.
   */
  AnnotationTool.prototype.open = function () {
    this.trigger('open');
    this.resetActiveTools();
    this.$template.removeClass('hide');
    this.onopen();
  };

  /** 
   * User defines the onopen function.
   * @memberof AnnotationTool 
   */
  AnnotationTool.prototype.onopen = function () { };


  /**
   * Get the html tool elements and bind their callbacks.
   * TODO: the scratchpad canvas calls a preventDefault on the click event, and this
   * causes the click event to not be caught in an iPod when then user clicks on the 
   * tools; I have added touchstart event listeners to emulate the click events on the
   * tools.
   * @this AnnotationTool
   */
  function _bindUtilsEvents($tools, view, options) {
    var that = this;
    var $toolbox = $tools.find('.toolbox');
    var $mobClose = $tools.find('.js-close');

    var $thin = $tools.find('[data-stroke="thin"]');
    var $med = $tools.find('[data-stroke="med"]');
    var $thick = $tools.find('[data-stroke="thick"]');
    var $eraser = $tools.find('.js-eraser');
    var $paintbucket = $tools.find('.js-paintbucket');
    var $trashcan = $tools.find('.js-trashcan');
    var oldStyle = view.context.strokeStyle;
    var oldStroke = GLOBAL_CONFIG.STROKE_WIDTH.DEFAULT;
    var $scratchpadContainer = this.$template;
    var strokes = {
      'thin'  : GLOBAL_CONFIG.STROKE_WIDTH.THIN,
      'med'   : GLOBAL_CONFIG.STROKE_WIDTH.MED,
      'thick' : GLOBAL_CONFIG.STROKE_WIDTH.THICK
    };
    var $oldPen = $thin;

    $mobClose.click(mobCloseClick);
    for (var i = 0; i < $mobClose.length; i++) {
        $mobClose[i].addEventListener('touchstart', mobCloseClick);
    }

    // NOTE: this event is triggered from the utils.js
    view.on('color-picker-hide', function() {
      oldStyle = view.context.strokeStyle; // remember current style as oldStyle
      $oldPen.click(); 
    });

    // bind each pencil icon
    [$thin, $med, $thick].forEach(function($el, idx, self) {
      $el.click(function() { pencilClick($el); });
      $el[0].addEventListener('touchstart', function() { pencilClick($el); });
    });


    $eraser.click(eraserClick);
    $eraser[0].addEventListener('touchstart', eraserClick);

    $paintbucket.click(paintBucketClick);
    $paintbucket[0].addEventListener('touchstart', paintBucketClick);

    $trashcan.click(trashcanClear);
    $trashcan[0].addEventListener('touchstart', trashcanClear);

    // TODO: this is working well, but it has not yet been introduced in the feature set.
    // download img
    var download = document.getElementById('download');
    if ( download ) {
      download.addEventListener('click', downloadClick);
      download.addEventListener('touchstart', downloadClick);
    }

    // HANDLE SPECIFIC OPTIONS PASSED BY USER
    if ( options.handleResize ) {
      window.addEventListener('resize', resize);
    }

    // LOCAL FUNCTION DECLARATIONS
    function mobCloseClick (e) {
      e.preventDefault();
      e.stopPropagation();
      that.close();
    }
   
    // Case where user did not close the color picker.
    // Check for the class and if found do the cleanup.
    function checkPaintBucket(){
      if ($paintbucket.hasClass('sp-active')){
          that.safeClosePalette();
      }
    }

    function pencilClick ($el) {
      checkPaintBucket();
      $oldPen = $el;
      removeSelectionClass($oldPen);
      $el.addClass('selected');
      $scratchpadContainer.removeClass('eraser-active');
      view.context.strokeStyle = oldStyle; // replace current style with oldStyle
      view.context.globalCompositeOperation = "source-over";// set back to default
      oldStroke = strokes[$el.data('stroke')]; // remember drawing stroke
      that.set('strokeWidth', oldStroke);
    }

    function paintBucketClick () {
      removeSelectionClass();
      var $el = $(this);
      if ( $el.hasClass('sp-active') ) {
        $(this).addClass('selected');
      } else {
        $(this).removeClass('selected');
        $oldPen.click();
      }
      $scratchpadContainer.removeClass('eraser-active');
      that.set('strokeWidth', oldStroke); // replace old stroke 
      view.context.strokeStyle = oldStyle; // replace old style
    }

    function eraserClick() {
      // If the eraser is already selected, skip over this.
      if (!$(this).hasClass('selected')){
      checkPaintBucket();
      removeSelectionClass($(this));
      $(this).addClass('selected');
      $scratchpadContainer.addClass('eraser-active');
      oldStyle = view.context.strokeStyle; // remember current style as oldStyle
      view.context.globalCompositeOperation = "destination-out";// Only show drawing not covered by eraser
      view.context.strokeStyle = GLOBAL_CONFIG.COLOR.ERASER;
      that.set('strokeWidth', GLOBAL_CONFIG.STROKE_WIDTH.ERASER);
      }
    }

    function trashcanClear(){
      that.clear();
    }

    function downloadClick (event) {
      var base64img = that.getImg();
      var blobImage = that.utils.dataURItoBlob(base64img);
      var blobURL = window.URL.createObjectURL(blobImage);
      if (window.navigator.userAgent.match(/Trident/)) { // boo :(
        window.navigator.msSaveBlob(blobImage, GLOBAL_CONFIG.FILE_NAME.DOWNLOAD);
      } else {
        download.setAttribute('href', blobURL);
        download.setAttribute('download', GLOBAL_CONFIG.FILE_NAME.DOWNLOAD);
      }
    }
    
    
    function resize() {
      var tStyle = window.getComputedStyle(that.$template[0]);
      that.set("size", [parseInt(tStyle.width), parseInt(tStyle.height)]);
    }
 
    function removeSelectionClass(element) {
      var colorPicker = $(".sp-container"); 
      [$thin, $med, $thick, $paintbucket, $eraser].forEach(function($el, idx, self) {
        $el.removeClass('selected');
      });
      if (element && !element.hasClass("js-paintbucket") && colorPicker.is(":visible") ){
        colorPicker.addClass("sp-hidden");
      }
    }

  }


  return AnnotationTool;

});
