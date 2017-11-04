/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Shanmuga Bala
 * 
 * $Id$
 */

(function ($) {

    var Scratchpad;
    var spobject;
    var markerImage;
    var eraserImage;
    var resetImage;
    var parentPositionLeft = 0;
    var parentPositionTop = 0;
    var totalLoadResources = 3
    var curLoadResNum;

    function supports_canvas() {
        return !!document.createElement('canvas').getContext;
    }

    function supports_canvas_text() {
        if (!supports_canvas()) {
            return false;
        }
        var dummy_canvas = document.createElement('canvas');
        var context = dummy_canvas.getContext('2d');
        return typeof context.fillText == 'function';
    }

    $.fn.scratchpad = function (options) {
        markerImage = new Image();
        eraserImage = new Image();
        resetImage = new Image();
        padBackgroundImage = new Image();
        curLoadResNum = 0;

        if (!supports_canvas_text()) {
            return;
        }

        this.settings = $.extend({
            canvasWidth: 1000,
            canvasHeight: 713,
        }, options);

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.settings.canvasWidth);
        canvas.setAttribute('height', this.settings.canvasHeight);
        canvas.setAttribute('id', 'canvas');
        canvas.style.position = 'absolute';

        background = document.createElement('img');
        background.setAttribute('src', '../images/bg_whiteboard-transparent.png'); 
        background.setAttribute('width', this.settings.canvasWidth);
        background.setAttribute('height', this.settings.canvasHeight);
        background.style.position = 'absolute';

        bgdiv = document.createElement('div');
        bgdiv.setAttribute('id', 'scratchpadbg');
       
        bgdiv.appendChild(background);   
        $(this)[0].appendChild(bgdiv);
        $(this)[0].appendChild(canvas);

        var parentDiv = $(this);
        var offset = parentDiv.offset();
        parentPositionLeft = offset.left - parentDiv.position().left;
        parentPositionTop = offset.top - parentDiv.position().top;
        spobject = new Scratchpad(document.getElementById('canvas'), options);
        return;

    };

    $.fn.deleteScratchpad = function () {
        var canvas = $(this).children("canvas");
        var canvasbg = $(this).children("#scratchpadbg"); 
        canvas.remove();
        canvasbg.remove();
   };

    function Scratchpad(el, opts) {
        sp = this;
        this.el = el;
        this.canvas = $(el);
        this.context = el.getContext('2d');

        //Initialize scratchpad settings
        this.settings = $.extend({
            canvasWidth: 1000,
            canvasHeight: 713,
            drawingAreaX: 43,
            drawingAreaY: 50,
            drawingAreaWidth: 911,
            drawingAreaHeight: 610,
            markerSize: 3,
            color1: "#000",
            color2: "#006400",
            color3: "#9400D3",
            color4: "#FF0000",
            color5: "#cb3594",
            color6: "#CCFF00",
            selectedColor: "#000",
            eraserSize: 15,
        }, opts);

        //In-Build settings. won't change.
        var settingsInBuild = {
            eraser: "#FFFFFF",
            toolsStartX: this.settings.drawingAreaWidth - 20,
            toolsStartY: this.settings.drawingAreaY + 20,
            pencilImageWidth: 93,
            pencilImageHeight: 46,
            toolSpace: 35,
            eraserImageHeight: 40,
            eraserImageWidth: 73,
        };

        eraserImage.onload = function () {
            sp.resourceLoaded();
        }
        eraserImage.src = "../images/img_eraser.png";

        markerImage.onload = function () {
            sp.resourceLoaded();
        }
        markerImage.src = "../images/img_marker.png";

        resetImage.onload = function () {
            sp.resourceLoaded();
        }
        resetImage.src = "../images/img_reset.png";

        $.extend(this.settings, settingsInBuild);
        this.redrawTools()
        this.painting = false;
        this.size = this.settings.markerSize;
        this.actions = [];
        this.action = [];
        this.canvas.bind('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', this.onEvent);

    }

    Scratchpad.prototype.resourceLoaded = function () {
        if (++curLoadResNum >= totalLoadResources) {
            this.redraw();
        }
    }

    Scratchpad.prototype.set = function (key, value) {
        this[key] = value;
        return this.canvas.trigger("scratchpad.change" + key, value);
    };
    Scratchpad.prototype.startPainting = function () {
        this.painting = true;
        return this.action = {
            color: this.settings.selectedColor,
            size: parseFloat((this.settings.selectedColor == this.settings.eraser) ? this.settings.eraserSize : this.size),
            events: []
        };
    };

    Scratchpad.prototype.stopPainting = function () {
        if (this.action) {
            this.actions.push(this.action);
        }
        this.painting = false;
        this.action = null;
        return this.redraw();
    };

    Scratchpad.prototype.onEvent = function (e) {
        if (e.originalEvent && e.originalEvent.targetTouches) {
            e.pageX = e.originalEvent.targetTouches[0].pageX;
            e.pageY = e.originalEvent.targetTouches[0].pageY;
        }
        $.scratchpad.tools['marker'].onEvent.call(spobject, e);
        e.preventDefault();
        return false;
    };


    Scratchpad.prototype.redraw = function () {
        var scratchpad;
        //this.el.width = this.canvas.width();
        //this.context = this.el.getContext('2d');
        this.context.clearRect(this.settings.drawingAreaX, this.settings.drawingAreaY, this.settings.drawingAreaWidth, this.settings.drawingAreaHeight);      
        this.redrawTools()
        scratchpad = this;

        $.each(this.actions, function () {
            return $.scratchpad.tools['marker'].draw.call(scratchpad, this);
        });

        if (this.painting && this.action) {
            return $.scratchpad.tools['marker'].draw.call(scratchpad, this.action);
        }
    };

    Scratchpad.prototype.reset = function () {
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.settings.drawingAreaX, this.settings.drawingAreaY, this.settings.drawingAreaWidth, this.settings.drawingAreaHeight);
        this.context.clip();
        this.actions = [];
        this.action = [];
    }

    Scratchpad.prototype.redrawTools = function () {
       // this.context.drawImage(padBackgroundImage, 0, 0, this.settings.canvasWidth, this.settings.canvasHeight);

        // Keep the drawing in the drawing area
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.settings.drawingAreaX, this.settings.drawingAreaY, this.settings.drawingAreaWidth, this.settings.drawingAreaHeight);
        this.context.clip();

        var locX = 0;
        var locY = 0;
        locX = (this.settings.selectedColor == this.settings.color1) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY = this.settings.toolsStartY

        this.context.beginPath();
        this.context.moveTo(locX + 7, locY + 25);
        this.context.lineTo(locX + 20, locY + 16);
        this.context.lineTo(locX + 22, locY + 30);
        this.context.closePath();
        this.context.fillStyle = this.settings.color1;
        this.context.fill();
        if (this.settings.selectedColor == this.settings.color1) {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);

        } else {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);
        }

        locX = (this.settings.selectedColor == this.settings.color2) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace


        this.context.beginPath();
        this.context.moveTo(locX + 7, locY + 25);
        this.context.lineTo(locX + 20, locY + 16);
        this.context.lineTo(locX + 22, locY + 30);
        this.context.closePath();
        this.context.fillStyle = this.settings.color2;
        this.context.fill();
        if (this.settings.selectedColor == this.settings.color2) {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);

        } else {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);
        }

        locX = (this.settings.selectedColor == this.settings.color3) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace


        this.context.beginPath();
        this.context.moveTo(locX + 7, locY + 25);
        this.context.lineTo(locX + 20, locY + 16);
        this.context.lineTo(locX + 22, locY + 30);
        this.context.closePath();
        this.context.fillStyle = this.settings.color3;
        this.context.fill();
        if (this.settings.selectedColor == this.settings.color3) {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);

        } else {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);
        }

        locX = (this.settings.selectedColor == this.settings.color4) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace


        this.context.beginPath();
        this.context.moveTo(locX + 7, locY + 25);
        this.context.lineTo(locX + 20, locY + 16);
        this.context.lineTo(locX + 22, locY + 30);
        this.context.closePath();
        this.context.fillStyle = this.settings.color4;
        this.context.fill();
        if (this.settings.selectedColor == this.settings.color4) {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);

        } else {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);
        }

        locX = (this.settings.selectedColor == this.settings.color5) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace


        this.context.beginPath();
        this.context.moveTo(locX + 7, locY + 25);
        this.context.lineTo(locX + 20, locY + 16);
        this.context.lineTo(locX + 22, locY + 30);
        this.context.closePath();
        this.context.fillStyle = this.settings.color5;
        this.context.fill();
        if (this.settings.selectedColor == this.settings.color5) {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);

        } else {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);
        }

        locX = (this.settings.selectedColor == this.settings.color6) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace


        this.context.beginPath();
        this.context.moveTo(locX + 7, locY + 25);
        this.context.lineTo(locX + 20, locY + 16);
        this.context.lineTo(locX + 22, locY + 30);
        this.context.closePath();
        this.context.fillStyle = this.settings.color6;
        this.context.fill();
        if (this.settings.selectedColor == this.settings.color6) {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);

        } else {
            this.context.drawImage(markerImage, locX, locY, this.settings.pencilImageWidth, this.settings.pencilImageHeight);
        }

        locX = (this.settings.selectedColor == this.settings.eraser) ? this.settings.toolsStartX : this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace + 3

        if (this.settings.selectedColor == this.settings.eraser) {
            this.context.drawImage(eraserImage, locX, locY, this.settings.eraserImageWidth, this.settings.eraserImageHeight);

        } else {
            this.context.drawImage(eraserImage, locX, locY, this.settings.eraserImageWidth, this.settings.eraserImageHeight);
        }

        locX = this.settings.toolsStartX + 15;
        locY += this.settings.toolSpace + 3

        this.context.drawImage(resetImage, locX, locY, this.settings.eraserImageWidth, this.settings.eraserImageHeight);
    }

    Scratchpad.prototype.selectTools = function (e) {
        mouseX = e.pageX - this.canvas.offset().left;
        mouseY = e.pageY - this.canvas.offset().top;

        if (mouseX > this.settings.toolsStartX + 15 && mouseY > this.settings.toolsStartY && mouseY < this.settings.toolsStartY + 292) {
            if (mouseY > this.settings.toolsStartY + 10 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight - 9) {
                if (this.settings.selectedColor != this.settings.color1) {
                    this.settings.selectedColor = this.settings.color1;
                }
            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 2 - 18) {
                if (this.settings.selectedColor != this.settings.color2) {
                    this.settings.selectedColor = this.settings.color2;
                }

            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight * 2 - 13 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 3 - 27) {
                if (this.settings.selectedColor != this.settings.color3) {
                    this.settings.selectedColor = this.settings.color3;
                }

            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight * 3 - 23 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 4 - 36) {
                if (this.settings.selectedColor != this.settings.color4) {
                    this.settings.selectedColor = this.settings.color4;
                }
            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight * 4 - 33 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 5 - 50) {
                if (this.settings.selectedColor != this.settings.color5) {
                    this.settings.selectedColor = this.settings.color5;
                }
            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight * 5 - 43 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 6 - 60) {
                if (this.settings.selectedColor != this.settings.color6) {
                    this.settings.selectedColor = this.settings.color6;
                }
            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight * 6 - 56 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 7 - 75) {
                if (this.settings.selectedColor != this.settings.eraser) {
                    this.settings.selectedColor = this.settings.eraser;
                }
            } else if (mouseY > this.settings.toolsStartY + this.settings.pencilImageHeight * 7 - 65 && mouseY < this.settings.toolsStartY + this.settings.pencilImageHeight * 8 - 78) {
                this.reset();
            }

        }
    };

    $.scratchpad = {
        tools: {}
    };
    $.scratchpad.tools.marker = {
        onEvent: function (e) {
            //Do not change the order of events in switch case
            switch (e.type) {
            case 'mousedown':
                this.selectTools(e)
            case 'touchstart':
                this.startPainting();
                break;
            case 'mouseup':
            case 'mouseout':
            case 'mouseleave':
            case 'touchend':
            case 'touchcancel':
                this.stopPainting();
            }
            if (this.painting) {
                mouseX = e.pageX - this.canvas.offset().left;
                mouseY = e.pageY - this.canvas.offset().top;

                if (mouseX > this.settings.drawingAreaX && mouseX < this.settings.drawingAreaX + this.settings.drawingAreaWidth && mouseY > this.settings.drawingAreaY && mouseY < this.settings.drawingAreaY + this.settings.drawingAreaHeight && !(mouseX > this.settings.toolsStartX && mouseY > this.settings.toolsStartY && mouseY < this.settings.toolsStartY + 292)) {
                        this.action.events.push({
                                    position: {
                                                x: mouseX,
                                                y: mouseY
                                    },
		        });
                        return this.redraw();
                }

            }
        },
        draw: function (action) {
            var event, i, _len, points;
            if (action.events && action.events.length > 0) {
                 this.context.lineJoin = "round";
                 this.context.lineCap = "round";
                 points = action.events;
                 var p1 = points[0];
                 var p2 = points[1];
       
                 this.context.beginPath();

                 for (var i = 1, len = points.length; i < len; i++) {
                      var p1x = p1.position.x;
                      var p2x = p2.position.x;
                      if( i == 1 ) {
                           this.context.moveTo(p1x, p1.position.y);
                      }
                      // Draw a smooth curve between p1 and p2
                      this.context.quadraticCurveTo(p1x, p1.position.y, p1x + (p2x - p1x) / 2, p1.position.y + (p2.position.y - p1.position.y) / 2);
                      p1 = points[i];
                      p2 = points[i + 1];
                 }
                 this.context.lineWidth = action.size
                 this.context.strokeStyle = action.color;;
                 return this.context.stroke();
          }
       }
    };
})(jQuery);
