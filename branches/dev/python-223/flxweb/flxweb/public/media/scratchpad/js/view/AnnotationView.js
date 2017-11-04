define([
  '../tools/tools',
  '../utils/utils',
  '../templates/templates',
  '../config/config'
], function(tools, utils, templates, GLOBAL_CONFIG) {

  /**
   * This is the main view for the HTML5 drawing canvas.
   *
   * @constructor AnnotationView
   */
  var AnnotationView = Backbone.View.extend({
    
    tagName:'canvas',
    className:'annotation-canvas',
   
    activeTool: null, 

    initialize: function (options) { },
    
    events: function() {
      // BIND MODEL LISTENERS
      this.listenTo(this.model, 'change:activeTool', this.setActiveTool);
      this.listenTo(this.model, 'change:strokeWidth', this.setStrokeWidth);
      this.listenTo(this.model, 'change:strokeStyle', this.setStrokeStyle);
      this.listenTo(this.model, 'change:background', this.setBackground);
      this.listenTo(this.model, 'change:eraser', this.setEraser);
      this.listenTo(this.model, 'change:canvasWidth', this.setSize);
      this.listenTo(this.model, 'change:canvasHeight', this.setSize);
      this.listenTo(this.model, 'change:size', this.setSize);
      // BIND TRIGGER LISTENERS this.on('clearCanvas', this.clearCanvas, this); this.on('getCurrentImage', this.getCurrentImage, this);
      this.on('clearCanvas', this.clearCanvas, this);
      this.on('render', this.render, this);
      this.on('renderUtils', this.renderUtils, this);
      // BIND VIEW EVENTS HERE
      var events = {};
      return events;
    },
    
    /**
     * Insert the HTML5 canvas object into the `target`
     * @memberof AnnotationView
     */
    render: function(target) {
      utils.readyCanvas.call(this); 
      this.model.set('target', $(target));
      var $target = this.model.get('target');
      if (!$target[0]) throw 'Must specify the target container element.';
      $target.find('.annotation-canvas-container').append(this.el);
      return null;
    },

    /**
     * @memberof AnnotationView
     */
    setSize: function() {
      var size = this.model.get('size');
      this.canvas.setAttribute('width', size[0]);
      this.canvas.setAttribute('height', size[1]);
      this.setStrokeWidth();
    },

    /**
     * @deprecated
     * @memberof AnnotationView
     */
    setEraser: function() {
      if (this.model.get('eraser') === 'on') {
        this.context.globalCompositeOperation = 'copy';
        this.context.strokeStyle = 'rgba(255,255,255,0)';
        $(this.colorPicker).spectrum('disable');
      }
      else {
        this.context.globalCompositeOperation = 'source-over';
        this.context.strokeStyle = 'rgba(0,0,0,1)';
        $(this.colorPicker).spectrum('enable');
        $(this.colorPicker).spectrum('set', 000000);
      }
      return null;
    },

   closeColorPicker: function(){
       $(this.colorPicker).spectrum('hide');
       return null;
   },

    /**
     * @memberof AnnotationView
     */
    setBackground: function() {
      this.$el.css({
        'background-image': 'url('+this.model.get('background')+')',
        'background-repeat': 'no-repeat'
      });
      return null;
    },

    /**
     * @memberof AnnotationView
     */
    setStrokeStyle: function() {
      this.context.strokeStyle = this.model.get('strokeStyle');
    },

    /**
     * @memberof AnnotationView
     */
    setStrokeWidth: function() {
      this.context.lineWidth = this.model.get('strokeWidth');
    },

    /**
     * @memberof AnnotationView
     */
    getCurrentImageData: function() {
      return this.context.getImageData(0,0, this.canvas.width, this.canvas.height);
    },

    /**
    * @memberof AnnotationView
    */
    getCanvasRef: function(){
      return this.canvas;
    },
    
    /**
     * @memberof AnnotationView
     */
    getCurrentImage: function(type) {
      if (type) return this.el.toDataURL(type);
      else return this.el.toDataURL(GLOBAL_CONFIG.MIME_TYPE.DEFAULT)
    },
  
    /**
     * @memberof AnnotationView
     */
    drawImage: function(img, x, y) {
      var that = this;
      if (typeof img === 'string') {
        var src = img;
        img = new Image();
        img.src = src;
      }
      img.onload =  function(){
        that.context.drawImage(img, x, y);
      };    
    },

    putImageData: function(img, x, y, dirtyX, dirtyY, dWidth, dHeight){
      this.context.putImageData(img, x, y, dirtyX, dirtyY, dWidth, dHeight);
    },

    getCurrentBlob: function() {
      var blob = utils.dataURItoBlob(this.getCurrentImage());
      this.model.set('currentBlob', blob);
      return blob;
    },

    setActiveTool: function(toolString) {
      if (!this.model.get('target')) throw 'An HTML target isn\'t set.';
      this.destroyCurrentTool();
      this.initializeTool(toolString);
    },
    
    renderUtils: function(){return utils.renderUtils.apply(this, arguments);},

    initializeTool: function(toolString) {
      var tool = (toolString.changed) ? toolString.changed.activeTool : toolString;
      tool = (typeof tool == 'string') ? tool.toLowerCase() : undefined;
      if (!tool) {throw new Error('you can\'t initialize that tool');}
      else {
        switch (tool) {
          case 'pencil':
            this.activeTool = new tools.Pencil(this);
            this.activeTool.initialize();
            break;
          default:
            throw (tool+' is not a valid tool name');
        }
      }
    },

    destroyCurrentTool: function() {
      if (this.currentTool && this.currentTool.destroy) {
        console.debug('finished destroying the current tool.');
        this[this.currentTool].destroy();
      } else {
        return -1;
      }
    },

    reCreateCanvas: function() {
      // IF THE CANVAS IS RESIZED, THEN USE THIS TO GET THE CONTENT BACK 
      var canvasElements = annotationTool.model.get('recordingObjects').canvasElements;
      var len = canvasElements.length;
      for (var i=0; i<len; i++) {
        this.paintCanvasObject(canvasElements[i]);
      }
    },

    
    /**
     * Perform an action on the canvas determined by `canvasObject`. Currently, the supported
     * actions are `moveTo` and `lineTo`.
     * @param {Object} canvasObject A single instance of an object representing an action
     *                 to be made on the canvas. 
     * @deprecated
     * @memberof AnnotationView
     */
    paintCanvasObject: function(canvasObject) {
      if (typeof(canvasObject) != 'object') {throw 'Expecting a canvas object.';}
      var name = canvasObject.name; 
      if (name == 'canvasMoveTo') {
        console.debug('canvas move to');
        this.context.moveTo(canvasObject.x, canvasObject.y);
      }
      else if (name == 'canvasLineTo') {
        console.debug('canvas line to');
        this.context.lineTo(canvasObject.x, canvasObject.y);
        this.context.stroke();
      }
    },
    
    clearCanvas: function () {
      this.context.clearRect(0, 0, this.el.width, this.el.height);
    },


    sendImg: function () {
      
      var postConfig = {
        resourceType: 'image',
        resourceName: 'user-image.png',
        resourceDesc: '',
        isAttachment: false,
        isPublic: true
      }
      var fd = new FormData();
      for (var i in postConfig) {
        if (postConfig.hasOwnProperty(i)) fd.append(i, postConfig[i]);
      }

      // append blob with file name
      fd.append('resourcePath', this.getCurrentBlob(), 'mycoolfile2.png');

      $.ajax({
        url: 'localhost',
        type: 'POST',
        data: fd,
        processData: false,
        dataType : "json",
        success: function(response) {
            console.debug(arguments);
        },
        error: function(jqXHR, textStatus, errorMessage) {
            console.debug(arguments);
        }
      });                

    }, 

    /**
     * Get the recorded objects from the model, clear the canvas, 
     * and paint the canvas using a requestAnimationFrame.
     * @deprecated
     * @memberof AnnotationView
     */
    playback: function() {
      
      this.clearCanvas();
      
      var recordingObjects = this.model.get('recordingObjects');
      var canvasElements = recordingObjects.canvasElements;
      var initialTime = recordingObjects.initialTime;
      var finalTime = recordingObjects.finalTime;
      var timeCounter = initialTime;
      var arrayCounter = 0;
      var arrayLen = canvasElements.length; 
      var offsetLeft = $(this.el).offset().left;
      var offsetTop = $(this.el).offset().top;
      var time = 0;

      function replay() { 
        var startTime = (window.performance.now) ? 
            (window.performance.now()) : Date.now();
        requestAnimationFrame(redrawCanvas);
        function redrawCanvas() {
          // end animation if the arrayCounter has reached the last element in the array
          if (arrayCounter == arrayLen) {
              console.debug('end animation');
              return null;
          }
          // otherwise continue...
          var now = (window.performance.now) ? 
              (window.performance.now() - startTime) : (Date.now() - startTime);
          var name = canvasElements[arrayCounter].name;
          time = now;
          var dt = canvasElements[arrayCounter].timeStamp - initialTime;
          if ((now - dt) > 0) {
            annotationTool.paintCanvasObject(canvasElements[arrayCounter]);
            arrayCounter++;
          }
          requestAnimationFrame(redrawCanvas);
        }
      }
      replay();
    },


    /**
     * @deprecated
     * @memberof AnnotationView
     */
    canvasGoAway: function(faster) {
      var counter = ((faster) ? 99:0);
      var that = this;
      function animateOverlay(t) {
        counter = counter+1;
        var val = counter / 100;
        $(that.el).css('-webkit-transform', 
          'matrix('+((1.0-val)*val)+','+(1.0-val)+','+(1.0-val)+','+((1.0-val)*val)+',0,0)'
        );
        if (counter>99) {
          return null;
        }
        window.requestAnimationFrame(animateOverlay);
      }
      window.requestAnimationFrame(animateOverlay);
    },
    
    /**
     * @deprecated
     * @memberof AnnotationView
     */
    canvasComeBack: function(faster) {
      var counter = ((faster) ? 99:0);
      var that = this;
      function animateOverlay(t) {
        counter = counter+1;
        var val = counter / 100;
        $(that.el).css('-webkit-transform', 
          'matrix('+((1.0)*val)+','+(1.0-val)+','+(1.0-val)+','+((1.0)*val)+',0,0)'
        );
        if (counter>99) {
          return null;
        }
        window.requestAnimationFrame(animateOverlay);
      }
      window.requestAnimationFrame(animateOverlay);
    },

    /**
     * Take a screenshot of the canvas and position the screenshot it over the 
     * annotationTool's target container
     * @memberof AnnotationView
     */
    canvasOverlayCurrent: function() {
      var screenshot = this.getCurrentImage();//annotationTool.canvas.toDataURL('image/png');
      annotationTool.fakeCanvas = document.createElement('img'); 
      annotationTool.fakeCanvas.setAttribute('src', screenshot);
      annotationTool.canvasGoAway(true);
      $(annotationTool.fakeCanvas).css(annotationTool.canvasStyle);
      annotationTool.target.insertBefore(annotationTool.fakeCanvas, $(annotationTool.target).children()[0]);
    }

  });

  return AnnotationView;
});
