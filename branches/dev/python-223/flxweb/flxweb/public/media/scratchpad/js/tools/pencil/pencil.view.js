define([
  "../../utils/utils"
], function (utils) {

  var Pencil = function (annotationView) {
    /* handle any free form drawing  */

    var x0,y0;

    function draw (x,y) {
      //utils.drawSoftLine(annotationView.context, x0, y0, x, y); 
      utils.drawLine(annotationView.context, x0, y0, x, y); 
      annotationView.context.stroke();
      annotationView.context.closePath();
    }

    return ({
      initialize: function() {
        var that = this;
        var $target = annotationView.model.get("target"); 
        $target.bind("mousedown", function(){that.startMouseDraw.apply(that,arguments)}); 
        $target[0].addEventListener("touchstart", function(){that.startTouchDraw.apply(that,arguments)}); 
      },
  
      destroy: function() {
        var $target = annotationView.model.get("target"); 
        $target.unbind("mousedown", this.startMouseDraw);
        $target[0].removeEventListener("touchstart", this.startTouchDraw);
      },

      // main event handlers 
      // -------------------

      startMouseDraw: function(event) {
        event.preventDefault();
        var $target = annotationView.model.get("target"); 
        var offsetLeft = $(annotationView.el).offset().left;
        var offsetTop = $(annotationView.el).offset().top;
        x0 = event.pageX-offsetLeft;
        y0 = event.pageY-offsetTop; 
        var time = Date.now()
        //var recordingObjects = annotationView.model.get("recordingObjects");

        function mouseDraw (event) {
          var x = event.pageX-offsetLeft;
          var y = event.pageY-offsetTop ;
          var time = Date.now();
          draw(x,y)
          x0 = x;
          y0 = y;
         // recordingObjects.canvasElements.push(new recordingObjects.canvasLineTo(x,y,time));
        }

        annotationView.context.beginPath();
        annotationView.context.moveTo(x0,y0);
        //recordingObjects.canvasElements.push(new recordingObjects.canvasMoveTo(x,y,time));
        $target.bind("mousemove", mouseDraw);
        $target.bind("mouseup", function(){$target.unbind("mousemove", mouseDraw)});
      },

      startTouchDraw: function(event) {
        event.preventDefault();
        var $target = annotationView.model.get("target"); 
        var useOffset = annotationView.model.get("useOffset");
        var offsetLeft = $(annotationView.canvas).offset().left;
        var offsetTop = $(annotationView.canvas).offset().top;
        if (useOffset) {
            x0 = event.touches[0].pageX-offsetLeft;
            y0 = event.touches[0].pageY-offsetTop;
        } else {
            x0 = event.touches[0].clientX;
            y0 = event.touches[0].clientY;
        }
        var time = Date.now();
        //var recordingObjects = annotationView.model.get("recordingObjects");

        function touchDraw(event) {
          event.preventDefault ? event.preventDefault() : (event.returnValue = false);
          event.stopPropagation();
          if (event.target.className.search("js-paintbucket") === -1){
            var x, y;
            // console.log("1useOffset: " + useOffset + ", x=" + x + ", y=" + y + ", x0=" + x0 + ", y0=" + y0);
            if (useOffset) {
              offsetLeft = $(annotationView.canvas).offset().left;
              offsetTop = $(annotationView.canvas).offset().top;
              x = event.touches[0].pageX - offsetLeft;
              y = event.touches[0].pageY - offsetTop;
            } else {
              x = event.touches[0].clientX;
              y = event.touches[0].clientY;
            }
            var time = Date.now();
            draw(x,y)
            x0 = x;
            y0 = y;
            // console.log("2useOffset: " + useOffset + ", x=" + x + ", y=" + y + ", x0=" + x0 + ", y0=" + y0);
            // recordingObjects.canvasElements.push(new recordingObjects.canvasLineTo(x,y,time));
          }
        }

        annotationView.context.beginPath();
        annotationView.context.moveTo(x0,y0);
        //recordingObjects.canvasElements.push(new recordingObjects.canvasMoveTo(x,y,time));
        $target[0].addEventListener("touchmove", touchDraw);
        $target[0].addEventListener("touchend", function(){$target.unbind("touchmove",touchDraw)});
      }

    });
  }
  return Pencil;
});
