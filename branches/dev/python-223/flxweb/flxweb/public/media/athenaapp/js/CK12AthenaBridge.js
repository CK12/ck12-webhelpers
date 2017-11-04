/**
 * Copyright 2007-2014 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Alexander Ressler
 * 
 * $Id$
 */

/**
 * This file acts as a generic event bridge for any new app used in athena.
 *
 * Trigger or bind to the following events:
 * 
 * setConfig 
 * getConfig
 * labModeChange 
 * See CK12AthenaBridge.eventNames for a complete list.
 *
 * Example -- Instantiating and binding to the labModeChange event:
 *
 *      var bridge = new CK12AthenaBridge(function(initialState){
 *          // Labs.js has been initialized with Athena Host
 *          // Do App specific init stuff in callback
 *      });
 *      bridge.on(bridge.eventNames.labModeChange, function(obj) {
 *          console.log("changed to mode: " + obj.mode);
 *      });
 *
 */

define([
    "jquery",
    "underscore",
    "backbone",
], function($, _, Backbone) {

    /**
     * @public - Initialize the connection with Athena.
     * @param {function} callback - executes after Labs.connect 
     */
    function initialize(callback) {
        var that = this;
        initializeAthenaLabs(function(error, initialState) {
            if (error !== null) {
                errorHandler(error);
            }
            bindEvents.call(that);
            if (typeof callback === "function") { 
                that.createLabEditor(function() {
                    callback(initialState);
                });
            }
        });
        return null;
    }

    /** 
     * @private - Assuming that the Labs object is loaded, initialize it and setup the labs host.
     */
    function initializeAthenaLabs(callback) {
        if (typeof callback !== "function") {
            throw new Error("initialize needs a function callback");
        }
        Labs.DefaultHostBuilder = function () {
            if (window.location.href.indexOf("PostMessageLabHost") !== -1) {
                return new Labs.PostMessageLabHost("test", parent, "*");
            } else {
                return new Labs.OfficeJSLabHost();
            }            
        };
        Labs.connect(callback);
        return null;
    }

    function labActivate() {
//        console.log("ACTIVATED!");
    }

    function labDeactivate() {
//        console.log("DEACTIVATED!");
    }

    /**
     * @private - Call during init to bind events and handlers to this bridge.
     *            WARNING: MAKE SURE THIS IS CALLED ONCE 
     */
    function bindEvents() {
        var that = this;
        /** @deprecated */
        this.on(CK12AthenaBridge.eventNames.setConfig, setConfig, this);
        /** @deprecated */
        this.on(CK12AthenaBridge.eventNames.getConfig, getConfig, this);
        /** @deprecated */
        this.on(CK12AthenaBridge.eventNames.updateConfig, updateConfig, this);
        /** @deprecated */
        this.on(CK12AthenaBridge.eventNames.getLabInstance, getLabInstance, this);

        // propagate the activate/deactivate events 
        this.on(CK12AthenaBridge.eventNames.activate, labActivate, this);
        this.on(CK12AthenaBridge.eventNames.deactivate, labDeactivate, this);
        //this.on("labModeChange", labModeChange); handle this in your controller...

        // when Labs detects the mode change event, proxy that data to this controller and trigger labModeChange.
        // LABS API HAS CHANGED RAPIDLY, I'm setting the modes to always be lowercase by default. 
        Labs.on(Labs.CommandType.ModeChanged, function() {
            var argv = arguments;
            if (typeof argv[0].mode.toLowerCase === "function") {
                argv[0].mode = argv[0].mode.toLowerCase();
            }
            // CLOSE THE LAB EDITOR IF IT'S OPEN!!!
            if (argv[0].mode === "view" && that.labEditor !== null) {
                that.closeLabEditor(function() {
                    that.trigger.apply(that, [CK12AthenaBridge.eventNames.labModeChange].concat([].splice.call(argv, 0)));
                });
            }
            else if (argv[0].mode === "edit" && that.labEditor === null) { // OPEN THE LAB EDITOR IF IT'S CLOSED!!!
                that.createLabEditor(function() {
                    that.trigger.apply(that, [CK12AthenaBridge.eventNames.labModeChange].concat([].splice.call(argv, 0)));
                });
            }
            else { // OTHERWISE JUST PROXY THE EVENT!!!
                that.trigger.apply(that, [CK12AthenaBridge.eventNames.labModeChange].concat([].splice.call(argv, 0)));
            }
        });

        // When a slide loads, the activate signal is sent. When a slide is removed, the deactivate signal is sent. 
        Labs.on(Labs.Core.EventTypes.Activate, function() { that.trigger(CK12AthenaBridge.eventNames.activate); });
        Labs.on(Labs.Core.EventTypes.Deactivate, function() { that.trigger(CK12AthenaBridge.eventNames.deactivate); });

        return null;
    }

    /**
     * @private - Handle serious errors in the Labsjs API
     * @param error - message from Labsjs method.
     * NOTE: Most errors are handled by Labs and don't filter down stream.
     */
    function errorHandler(error) {
        console.log(error);
        return null;
    }

    /**
     * @private - SET (overwrite) the current Lab configuration.
     * @param {object} configuration - object literal used to set labs configuration 
     * @param {function} callback - (optional) callback executed after configuration is set.
     * @param {object} context - (optional) the 'this' context with which to execute the callback. 
     */
    function setConfig(configuration, callback, context) {
        var buffer; //stack
        var that = this;
        if (typeof configuration !== "object") {
            throw new Error("setConfig: configuration should be an object literal.");
        }
        context = (typeof context === undefined) ? this : context;
        callback = (typeof callback === "function") ? callback : function(){return null;};

        // ATHENA REQUIRES THE CONFIGURATION OBJECT TO HAVE A KEY CALLED 'components', which is an Array.
        // I will format this for you. If you pass a plain object without 'components' as a key, then I will 
        // push that object onto an array and put that array on configuration.components.
        if (configuration.hasOwnProperty("components")) {
            if (!(configuration.components instanceof Array)) {
                buffer = [];
                buffer.push(configuration.components); 
                configuration.components = buffer;
            }
        }
        else {
            configuration.components = [].push(configuration);
        }
        // if labEditor isn't instantiated, then open one and close it right away.
        if (this.labEditor === null) {
            this.createLabEditor(function() {
                that.labEditor.setConfiguration(configuration, function() {
                    callback.apply(context, arguments);
                    console.log("calling done");
                    that.labEditor.done(function(){ return null;});
                });
            });
        }
        else {
            this.labEditor.setConfiguration(configuration, function(){
                callback.apply(context, arguments);
            });
        }
        return null;
    }

    /**
     * @method 
     * given a string, correctly format the data object for Labsjs.
     */
    function setURI(embedURI, app_name) {
        this.setConfig({
            components: [
                {
                    type: Labs.Components.ActivityComponentType, // required
                    name: app_name,
                    values: {},
                    data: {URI:embedURI},
                    secure: false
                }
            ]
        });
    }

    /**
     * @private - UPDATE (merge) the current Lab configuration. Does a get then a set.
     * @param {object} configuration - object literal used to set labs configuration 
     * @param {function} callback - (optional) callback executed after configuration is set.
     * @param {object} context - (optional) the 'this' context with which to execute the callback. 
     */
    function updateConfig(configuration, callback, context) {
        var buffer;
        var currentConfig;
        var that = this;
        if (typeof configuration !== "object") {
            throw new Error("setConfig: configuration should be an object literal.");
        }
        context = (typeof context === undefined) ? this : context;
        
        this.trigger(CK12AthenaBridge.eventNames.getConfig, function(config) {
            currentConfig = config;
            $.extend(currentConfig, configuration);
            this.trigger(CK12AthenaBridge.eventNames.setConfig, currentConfig);
        }, this);
    }

    /**
     * @private
     * Handle ERROR case in this method. Otherwise, splice out the actual config object and 
     * pass it to the callback function.
     * @param {function} callback - (optional) callback executed after configuration is set.
     * @param {object} context - (optional) the 'this' context to call the callback with. 
     */
    function getConfig(callback, context) {
        var that = this;
        if (typeof callback !== "function") {
            throw new Error("getConfig: callback should be a function");
        }
        else {
            // special case: labEditor was closed
            if (this.labEditor === null) {
                this.createLabEditor(function(labEditor) {
                    labEditor.getConfiguration(function() {
                        if (arguments[0] !== null) { // error occurred 
                            errorHandler(arguments[0]);
                        }
                        // Don't pass the error arg to the callback.
                        callback.apply(context, [].splice.call(arguments, 1));
                        labEditor.done(function(){}); // close it
                    });
                });
            }
            else {
                this.labEditor.getConfiguration(function() {
                    if (arguments[0] !== null) { // error occurred 
                        errorHandler(arguments[0]);
                    }
                    // Don't pass the error arg to the callback.
                    callback.apply(context, [].splice.call(arguments, 1));
                });
            }
        }
        return null;
    }

    function getURI(callback) {
        this.getLabInstance(function(labInstance) {
            if (labInstance === null) {
                callback(null);
            }
            else {
                callback(labInstance.components[0].component.data.URI);
            }
        });
    }


    /**
     * @private - closes the labEditor if open and calls the Labs.takeLab API
     * @param {function} callback<LabInstance> - callback is a function and its passed the labInstance.
     */
    function getLabInstance(callback) {
        var that = this;
        callback = (typeof callback === "function") ? callback : function() {};
        /** @ignore */
        function _getLabInstance(callback) {
            if (that.labInstance !== null) {
                callback(that.labInstance);
            }
            else {
                Labs.takeLab(function(error, labInstance) {
                    if (error !== null) {
                        errorHandler(error);
                    }
                    that.labInstance = labInstance;
                    callback(labInstance);
                });
            }
        }
        if (this.labEditor !== null) {
            this.closeLabEditor(function() {
                _getLabInstance(callback);
            });
        }
        else {
            _getLabInstance(callback);
        }
        return null;
    }

    // =========================== CONSTRUCTOR, PROTOTYPES, STATIC ==================================

    /**
     * @constructor - Event pipe that integrates with Athena.
     */
    function CK12AthenaBridge() {
        _.extend(this, Backbone.Events);
        this.labEditor = null; // we need to have only 1 instance of this, otherwise labs.js complains (editLab API)
        this.labInstance = null; // we need to have only 1 instance of this too. Created via takeLab API.
        this.labs = Labs;
        return this;
    }

    /**
     * @static - Let's keep track of all the event names that we will handle in this object.
     *           If any Labsjs API changes, then change this object if necessary. 
     */
    CK12AthenaBridge.eventNames = {
        labModeChange   : "labModeChange",
        getConfig       : "getConfig",
        setConfig       : "setConfig",
        updateConfig    : "updateConfig",
        getLabInstance  : "getLabInstance",
        activate        : "activate",
        deactivate      : "deactivate"
        
    };

    CK12AthenaBridge.prototype.eventNames = CK12AthenaBridge.eventNames; //and put it in the prototype

    /**
     * @method - Create one instance of the labEditor and store it on the bridge object.
     * @param {function} callback<labEditor> - (optional) execute callback after creation of the labEditor.
     */
    CK12AthenaBridge.prototype.createLabEditor = function(callback) {
        var that = this;
        callback = (typeof callback === "function") ? callback : function(){};
        if (this.labEditor !== null) {
            return (function() {
                callback(that.labEditor);
                return that.labEditor;
            })();
        }
        else {
            Labs.editLab(function(error, labEditor) {
                if (error !== null) {
                    errorHandler(error);
                    that.labEditor = null;
                }
                else {
                    that.labEditor = labEditor;  
                }
                callback(that.labEditor);
            });
            return null;
        }
    };

    /**
     * @method - Check to see if a labEditor is instantiated and call .done() on it
     * @param {function} callback - callback to be executed when the labEditor closes.
     */
    CK12AthenaBridge.prototype.closeLabEditor = function(callback) {
        if (typeof callback !== "function") {
            callback = function(){return null;};
        }
        if (this.labEditor !== null) {
            this.labEditor.done(callback);
            this.labEditor = null;
        }
        return null;
    };

    /**
     * @method - Check to see if a labInstance is instantiated and call .done() on it
     * @param {function} callback - callback to be executed when the labEditor closes.
     */
    CK12AthenaBridge.prototype.closeLabInstance = function(callback) {
        if (typeof callback !== "function") {
            callback = function(){return null;};
        }
        if (this.labInstance !== null) {
            this.labInstance.done(callback);
            this.labInstance = null;
        }
        return null;
    };

    CK12AthenaBridge.prototype.getConfig = getConfig; 
    CK12AthenaBridge.prototype.setConfig = setConfig; 
    CK12AthenaBridge.prototype.setURI = setURI; 
    CK12AthenaBridge.prototype.updateConfig = updateConfig; 
    CK12AthenaBridge.prototype.getLabInstance = getLabInstance; 
    CK12AthenaBridge.prototype.initialize = initialize; 
    CK12AthenaBridge.prototype.getURI = getURI; 

    return CK12AthenaBridge;
});
