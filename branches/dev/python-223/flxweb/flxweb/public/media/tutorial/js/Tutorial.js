define([
    "jquery"
], function ($) {

    /**
     * Implements an overlay and tutorial content for a given view. 
     * The tutorials are supplied in JSON format and must have `selector` and `content` properties.
     * The `selector` is a DOM selector; the tutorial object will overlay divs around the element
     * corresponding to the `selector`, which will appear to 'highlight' the element. The tutorial 
     * content will appear allongside the `selector`. 
     * @param {object} config An object specifying the tutorial content and details to display.
     * @param {array} config.tutorials An array of objects; each specifying a selector and content.
     * @param {boolean} [config.showOnNextSession=false] Show the tutorial when the user returns to the page 
     * @param {string} config.appName This determines the location in localStorage where to cache.
     * @param {string} [config.localStorageKey=ck12_tutorial] Don't modify this unless you know what you're doing.
     * @constructor Tutorial
     */
    function Tutorial (config) {

        var that = this;
        var DEFAULTS = {
            "tutorials" : [],
            "showOnNextSession" : false,
            "localStorageKey" : "ck12_tutorial",
            "appName" : null,
            "showNow" : true
        };
        var _slideNum = 0;

        try {
            var config = validateConfig(DEFAULTS, config);
        } catch ( error ) {
            console.error ( error ) ;
            return error;
        }


        var container = makeDiv("tutorial-container");
        var overlays = {
            "top"    : makeDiv("overlay top"),
            "right"  : makeDiv("overlay right"),
            "bottom" : makeDiv("overlay bottom"),
            "left"   : makeDiv("overlay left")
        };
        var buttons = {
            "continue" : makeDiv("button continue turquoise").html("Continue"),
            "exit"     : makeDiv("button dusty-grey exit").html("EXIT TOUR")
        };
        var content = makeDiv("content");

        this.elements = {
            container: container,
            overlays: overlays,
            buttons: buttons,
            content: content,
            testEl: makeDiv("show-for-small")
        };

        this._isRenderedDirty = false;

        this.tutorials = config.tutorials;

        //TODO: fallback to browser cookie
        if ( ! hasLocalStorage() ) {
            return null;
        }


        /**
         * Display the current tutorial slide and increment the slide Num
         * @deprecated
         *
         * @privileged
         * @method
         * @memberof Tutorial
         */
        this.play = function () {
            this.resize();
            return this;
        };

        /**
         * Display the current tutorial slide.
         * @callback
         * @privileged
         * @method
         * @memberof Tutorial
         */
        this.resize = function () { 
            if ( that.tutorials[_slideNum] === undefined ) { return false; }
            if ( that.tutorials[_slideNum].skipForSmall === true ) {
                ++_slideNum;
                return this.resize();
            }
            var selector;
            if ( that.isSmallView() && that.tutorials[_slideNum].smallViewSelector ) {
                selector = that.tutorials[_slideNum].smallViewSelector ;
            } else {
                selector = that.tutorials[_slideNum].selector ;
            }
            var selectorIsNone = (selector === "none")
            var $selector = selectorIsNone ?  $("<div>") : $(selector).first();

            var content = that.tutorials[_slideNum].content;

            var offsets = $selector.offset();
            var width = $selector.innerWidth();
            var height = $selector.innerHeight();

            var overlays = that.elements.overlays;
            // NOTE: overlays are using position: fixed 

            // TODO: handle X-axis scrolling
            window.scrollTo(0, offsets.top - 100); // we have a fixed header of 99px high...

            var sY = window.scrollY;
            //var sX = window.scrollX; // TODO.. scrolling in X should be disabled anyway

            // overlay the entire window...
            if ( selectorIsNone ) {
                overlays.top.removeAttr("style");
                overlays.top.css({ height: window.innerHeight + "px" });
                overlays.right.removeAttr("style");
                overlays.bottom.removeAttr("style");
                overlays.left.removeAttr("style");
            } else {
                overlays.top.css({ 
                    height: (offsets.top-sY + 2) + "px",
                    left: offsets.left + "px",
                    width: width + "px"
                });
                overlays.right.css({ 
                    width: (window.innerWidth - (offsets.left+width)) + "px" 
                });
                overlays.bottom.css({ 
                    height: (window.innerHeight - (offsets.top+height + sY)) + "px",
                    left: offsets.left + "px",
                    width: width + "px"
                });
                overlays.left.css({ 
                    width: offsets.left + "px" 
                });
            }

            that.elements.content.html(content);

            that.elements.container.removeClass("tutorial-"+(_slideNum));
            that.elements.container.addClass("tutorial-"+(_slideNum+1));

            if ( _slideNum === 0 ) {
                that.elements.buttons.exit.html("Skip");
            } else {
                that.elements.buttons.exit.html("EXIT TOUR");
            }
            if ( _slideNum === that.tutorials.length-1 ) {
                that.elements.buttons.continue.html("Done");
                that.elements.buttons.exit.removeClass("dusty-grey").addClass("turquoise");
            }
        
        };

        window.addEventListener("resize", this.resize);

        bindEvents.call(this);

        this.elements.buttons.continue.on("click", function () { 
            ++_slideNum;
            if ( _slideNum >= this.tutorials.length ) {
                this.exit();
            }
            this.resize();
        }.bind(this));

        // Insert a new record if one doesn't exist.
        if ( ! window.localStorage.getItem(config.localStorageKey) ) {
            window.localStorage.setItem( config.localStorageKey, JSON.stringify({ }) ); 
        }

        var json = window.localStorage.getItem(config.localStorageKey);
        try { 
            var localConfig = JSON.parse(json);
        } catch ( error ) {
            return void( console.error ( error ) ); 
        }

        // Check if appName is registered; create it if it's not.
        if ( ! localConfig[config.appName] ) {
            localConfig[config.appName] = {
                "showOnNextSession" : config.showOnNextSession
            };
            // Write current configuration to localStorage.
            window.localStorage.setItem( config.localStorageKey, JSON.stringify(localConfig) );
            if ( ! config.showNow ) { return false; }
            return this.render().play();
        } else {
            // copy new user settings over to localConfig
            localConfig[config.appName] = {
                "showOnNextSession" : config.showOnNextSession
            };
            // Write current configuration to localStorage.
            window.localStorage.setItem( config.localStorageKey, JSON.stringify(localConfig) );
        }
         
        if ( localConfig[config.appName].showOnNextSession ) {
            localConfig[config.appName].showOnNextSession = config.showOnNextSession;
            // Write current configuration to localStorage
            window.localStorage.setItem( config.localStorageKey, JSON.stringify(localConfig) );
            if ( config.showNow === true ) {
                return this.render().play();
            }
        } else {
            console.debug("skipping tutorial");
            window.removeEventListener("resize", this.resize);
            return null;
        }

    }

    Tutorial.prototype.isSmallView = function () {
        var el = this.elements.container[0].querySelector(".show-for-small");
        var style = window.getComputedStyle(el);
        return style.display !== "none";
    };

    /**
     * Remove all DOM objects. This tutorial is finished.
     * @method
     */
    Tutorial.prototype.exit = function () {
        this.elements.container.remove();
        for ( var el in this.elements.buttons ) {
            this.elements.buttons[el].remove();
        }
        for ( el in this.elements.overlays ) {
            this.elements.overlays[el].remove();
        }
        for ( el in this.elements.overlays ) {
            this.elements.overlays[el].remove();
        }
        this.elements.content.remove();
        $("body").removeClass("no-scroll");
        window.removeEventListener("resize", this.resize);
        return null;
    };

    /**
     * Assemble the tutorial DOM structure and append it to the BODY.
     */
    Tutorial.prototype.render = function () {
        if ( ! this._isRenderedDirty ) {
            for ( var div in this.elements.overlays ) {
                this.elements.container.append(this.elements.overlays[div]);
            }
            for ( div in this.elements.buttons ) {
                this.elements.container.append(this.elements.buttons[div]);
            }
            this.elements.container.append(this.elements.content);
            this.elements.container.append(this.elements.testEl);
            var $body = $("body");
            $body.append(this.elements.container);
            $body.addClass("no-scroll");
            this._isRenderedDirty = true;
        }
        return this;
    };


    /**
     * @memberof Tutorial
     * @private
     */
    function makeDiv (classList) {
        return $("<div>").addClass(classList);
    }

    /**
     * Validate the configuration object for this instance;
     * @memberof Tutorial
     * @param {object} defaults default configuration to extend with `config`
     * @param {object} config configuration object from user.
     * @param {string} [config] if `config` is a json string, then it will be parsed.
     * @private */
    function validateConfig (defaults, config) {
        if ( typeof config === "string" ) {
            try {
                var config = JSON.parse(config);
            } catch (error) {
                throw (error);
            }
        }

        var c = $.extend(true, defaults, config);

        if ( ! c.localStorageKey ) {
            throw "missing tutorial key";
        }
        if ( ! c.tutorials instanceof Array || c.tutorials.length === 0 ) {
            throw "no tutorials to display";
        }
        if ( ! c.appName ) {
            throw "Please supply tutorial appName in config";
        }
        if ( typeof c.showOnNextSession !== "boolean" ) {
            throw "expecting a boolean value, try again";
        }
        if ( typeof c.showNow !== "boolean" ) {
            throw "expecting a boolean value, try again";
        }
        for ( var i=0; i<c.tutorials.length; i++ ) {
            var t = c.tutorials[i];
            if ( ! ( t.selector && t.content ) ) {
                throw "malformed tutorial";
            } 
        }

        return c;
    }

    /**
     * Test for window.localStorage availability.
     */
    function hasLocalStorage(){
        var c = "X"
        try {
            localStorage.setItem(c, c);
            localStorage.removeItem(c);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Bind handlers to click events in the tutorial object.
     * @this Tutorial
     */
    function bindEvents () {
        var that = this;
        this.elements.buttons.exit.on("click", function () { that.exit(); });
    }

    return Tutorial;
});
