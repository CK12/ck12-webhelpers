/**
 * Copyright 2007-2015 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Neal Fennimore
 *
 * $Id$
 */

/* globals tinymce:false */

tinymce.PluginManager.add('ck12eventmanager', function(editor) {
    'use strict';

    /**
     * [eventNameSpace All cascaded events will be prepended with this: i.e. mce.elementbox:button:disable.
     *                 ** May want to make editor events namespaced as well ( editor.fire('mce.disable', { button: 'bold' }) )]
     * @type {String}
     */
    var eventNameSpace = 'mce.';

    /**
     * [pluginHandlers New events object on an editor usually extended from within a plugin]
     * @type {[type]}
     */
    var pluginHandlers = editor.events,
        elementbox = pluginHandlers.elementbox;

    /**
     * [eventsBlacklist Blacklist any default TinyMCE events and uses them to subscribe by their default event name without appending a namespace]
     * @type {Array}
     */
    var eventsBlacklist = [
        'activate',
        'beforeexeccommand',
        'beforerenderui',
        'beforesetcontent',
        'blur',
        'change',
        'deactivate',
        'execcommand',
        'focus',
        'getcontent',
        'hide',
        'init',
        'loadcontent',
        'nodechange',
        'objectresized',
        'objectresizestart',
        'objectselected',
        'postprocess',
        'preinit',
        'preprocess',
        'progressstate',
        'redo',
        'remove',
        'reset',
        'savecontent',
        'setattrib',
        'show',
        'submit',
        'undo'
    ];

    /**
     * [defaultEvents Default events used if eventsConfig buttons are marked with a boolean value]
     * @type {Object}
     */
    var defaultEvents = {
        disable: function() {
            this.disabled(true);
        },
        enable: function() {
            this.disabled(false);
        },
        active: function() {
            this.active(true);
        },
        inactive: function() {
            this.active(false);
        },
        show: function() {
            this.visible(true);
        },
        hide: function(){
            this.visible(false);
        }
    };

    /**
     * Main config file for organizing events using the buttons on the editor (tinymce.activeEditor.buttons)
     *
     *     MANUAL refers to anything that cannot have the postRender function extended and needs to
     *     have the event bound after the editor is initialized.
     *     MENU pertains to the dropdown menus
     *     BUTTON pertains to the toolbar button
     *
     *     prependEvent should be used to have an event fire first in the event firing sequence
     *     (this most notably should happen with nodechange events to have other custom events take precedence)
     *
     *  DEFAULT EVENTS:
     *     Events with a boolean value will try to inherit from defaultEvents if the event is there
     *         - Listener example: editor.on('mce.bold:menu:disable', defaultFn)
     *
     *  NON-DEFAULT EVENTS:
     *     Events with function will not inherit from defaultEvents, but will need a controller (ctrl)
     *         - Listener example: editor.on('mce.bold:menu:myCustomEvent', customFn)
     *
     *     Anything in the eventsBlackList will keep the TinyMCE event name but include the custom function
     *         - Listener example: editor.on('nodechange', customFn)
     *
     *     NOTE: At this point only one event fires properly in the same event type
     *
     * @type {Object}
     */
    var eventsConfig = {
        bold: {
            button: {
                disable: true,
                enable: true
            }
        },
        elementbox: {
            button: {
                nodechange: function(ctrl) {
                    elementbox.toolbar.handleDisable(ctrl, editor);
                },
                disable: true,
                enable: true
            }
        },
        blockquote: {
            button: {
                nodechange: function(ctrl) {
                    elementbox.toolbar.handleDisable(ctrl, editor);
                },
                disable: true,
                enable: true
            }
        },
        ck12table: {
            button: {
                nodechange: function(ctrl) {
                    elementbox.toolbar.handleDisable(ctrl, editor);
                },
                enable: true,
                disable: true,
                active: true,
                inactive: true
            }
        },
        styleselect: {
            button: {
                disable: true,
                enable: true
            }
        },
        ck12definitionlist: {
            button: {
                disable: true,
                enable: true
            }
        },
        ck12highlight: {
            button: {
                disable: true,
                enable: true
            }
        },
        ck12textcolor: {
            button: {
                disable: true,
                enable: true
            }
        },
        ck12indent:{
            button: {
                enable: true,
                disable: true
            }
        },
        ck12outdent:{
            button: {
                enable: true,
                disable: true
            }
        },
        ck12embed: {
            button: {
                enable: true,
                disable: true,
                active: true,
                inactive: true
            }
        },
        image: {
            button: {
                enable: true,
                disable: true,
                active: true,
                inactive: true
            }
        },
        italic: {
            button: {
                disable: true,
                enable: true
            }
        },
        link: {
            button: {
                disable: true,
                enable: true
            }
        },
        unlink: {
            button: {
                disable: true,
                enable: true
            }
        },
        strikethrough: {
            button: {
                disable: true,
                enable: true
            }
        },
        subscript: {
            button: {
                disable: true,
                enable: true
            }
        },
        superscript: {
            button: {
                disable: true,
                enable: true
            }
        },
        underline: {
            button: {
                disable: true,
                enable: true
            }
        },
        hr: {
            button: {
                disable: true,
                enable: true
            }
        },
        numlist: {
            button: {
                disable: true,
                enable: true
            }
        },
        bullist: {
            button: {
                disable: true,
                enable: true
            }
        },
        charmap: {
            button: {
                disable: true,
                enable: true
            }
        },
        matheditor: {
            button: {
                disable: true,
                enable: true,
                active: true,
                inactive: true
            }
        },
        fullscreen: {
            button: {
                disable: true,
                enable: true
            }
        },
        save: {
            button: {
                disable: true,
                enable: true
            }
        },
        pagebreak: {
            button: {
                disable: true,
                enable: true,
                active: true,
                inactive: true
            }
        }
    };

    /**
     * Any items in the eventsConfig with a manual key will be put here if the theme is not rendered
     * in time.
     * @type {Array}
     */
    var manualEventQueue = [];

    /**
     * Start everything
     * @return {none}
     */
    function init() {
        var buttons = editor.buttons,
            menuItems = editor.menuItems;

        initializeExtending(buttons, 'button');
        initializeExtending(menuItems, 'menuItem');
        bindEventsToEditor();

        if(manualEventQueue.length){
            poll(
                    isThemeRendered,
                    startManualQueue,
                    5000,
                    300
                );
        }
    }

    /**
     * Sorts through menu or button items on the editor and checks whether they exist in our eventsConfig
     * @param  {Object} editorUiCollection Menu or button items
     * @return {none}
     */
    function initializeExtending(editorUiCollection, uiType) {
        for (var uiButton in editorUiCollection) {
            if (editorUiCollection.hasOwnProperty(uiButton) && eventsConfig[uiButton] && !editorUiCollection[uiButton].manual) {
                createConfig(editorUiCollection, uiButton, uiType);
            }
        }
    }

    /**
     * Creates config to send through rest of functions
     * @param  {Object} editorUiCollection Menu or button items
     * @param  {Object} uiButton           button/plugin currently being worked on
     * @return {none}
     */
    function createConfig (editorUiCollection, uiButton, uiType) {
        var types = eventsConfig[uiButton],
            config;

        for (var type in types) {
            if ( types.hasOwnProperty(type) && type === uiType ) {

                config = {
                    type:             type,
                    typeEvents:       types[type],
                    uiElementName:    uiButton,
                    uiElement:        editorUiCollection[uiButton]
                };

                if(types.manual) {
                    isThemeRendered() ? bindManualEvents(config) : manualEventQueue.push(config);
                } else {
                    extendPostRender(config);
                }

            }
        }
    }

    /**
     * Extends old onPostRender (if exists) with new events. Otherwise creates new events
     * @param  {Object} opts
     * @return {none}
     */
    function extendPostRender(opts) {
        var oldPostRender = opts.uiElement.onPostRender || null;

        if (typeof oldPostRender === 'function') {
            opts.uiElement.onPostRender = function() {
                oldPostRender.call(this);
                eventHandler.call(this, opts);
            };
        } else if (oldPostRender === null) {
            opts.uiElement.onPostRender = function() {
                eventHandler.call(this, opts);
            };
        }
    }

    /**
     * Decides whether to make this a custom event or use a default event by going through events on specific ui elements
     *
     *               NOTE: The controller (ctrl) always has to called with 'this' value in the
     *               proceeding functions as the controller is registered in the onPostRender function
     *
     * @param  {Object} opts
     * @return {none}
     */
    function eventHandler(opts) {
        /* jshint validthis:true */
        var ctrl = this,
            buttonEvents = opts.typeEvents;

        for (var buttonEvent in buttonEvents) {
            if (buttonEvents.hasOwnProperty(buttonEvent)) {

                if (typeof buttonEvents[buttonEvent] === 'function') {
                    createEventListener.call(ctrl, buttonEvent, buttonEvents[buttonEvent], opts);

                    // We don't want to create a listener if disable: false
                } else if (buttonEvents[buttonEvent] && typeof buttonEvents[buttonEvent] === 'boolean') {
                    createDefaultEventListener.call(ctrl, buttonEvent, opts);
                }
            }
        }
    }

    /**
     * Creates a default event listen based on defaultEvents
     * @param  {String} eventName Name of the event
     * @param  {Object} opts
     * @return {none}
     */
    function createDefaultEventListener(eventName, opts) {
        /* jshint validthis:true */
        var ctrl = this,
            createdEventName = createEventName(eventName, opts),
            prependEvent = shouldPrependEvent(eventName, opts);

        if (defaultEvents[eventName]) {
            return (function() {
                function bindListener() {
                    editor.on(createdEventName, function() {
                        defaultEvents[eventName].call(ctrl);
                    }, prependEvent);
                }

                if (editor.initialized) {
                    bindListener();
                } else {
                    editor.on('init', bindListener);
                }
            })();

        } else {
            console.error('Not a default event', eventName);
        }
    }

    /**
     * Creates a listener that checks for TinyMCE default events and determines what kind of event to register
     * @param  {String}   eventName
     * @param  {Function} fn
     * @param  {Object}   opts
     * @return {none}
     */
    function createEventListener(eventName, fn, opts) {
        /* jshint validthis:true */
        var ctrl = this,
            isBlacklisted = eventsBlacklist.indexOf(eventName.toLowerCase()) > -1,
            customEvent = isBlacklisted ? eventName : createEventName(eventName, opts),
            prependEvent = shouldPrependEvent(eventName, opts);

        return (function() {
            function bindListener() {
                editor.on(customEvent, function() {
                    fn(ctrl);
                }, prependEvent);
            }

            if (editor.initialized) {
                bindListener();
            } else {
                editor.on('init', bindListener);
            }
        })();
    }

    /**
     * Use tinymces prepend on an event to have it fire first before other events.
     * This can cause bugs and other strange UI issues to occur.
     * @param  {string} eventName
     * @param  {object} opts
     * @return {Boolean}
     */
    function shouldPrependEvent(eventName, opts){
        return !!(opts.typeEvents.prependEvent && opts.typeEvents.prependEvent === eventName);
    }

    /**
     * Checks whether theme has a panel attached to it. It means the theme has already rendered
     * and we're able to get any items not on editor.buttons
     * @return {Boolean}
     */
    function isThemeRendered(){
        return !!editor.theme.panel;
    }

    /**
     * Begin binding elements after theme has rendered
     */
    function startManualQueue(){
        while(manualEventQueue.length){
            bindManualEvents( manualEventQueue.shift() );
        }
    }

    /**
     * Bind all events on a UI element after the theme has rendered.
     * @param  {Object} opts
     * @return {none}
     */
    function bindManualEvents(opts) {
        function bindEvents(ctrl) {
            var prependEvent;

            for ( var eventName in opts.typeEvents ){
                if(opts.typeEvents.hasOwnProperty(eventName)){
                    prependEvent = shouldPrependEvent(eventName, opts);

                    editor.on(createEventName(eventName, opts), function(){
                        defaultEvents[eventName].call(ctrl);
                    }, prependEvent);
                }
            }

        }
        getCtrl(opts, bindEvents);
    }


    /**
     * Get the Controller of a UI Element by finding it on the toolbar of the theme
     * @param  {Object}   opts
     * @param  {Function} cb
     * @return {none}
     */
    function getCtrl(opts, cb){
        var uiTypes    = editor[opts.type + 's'],
            name       = opts.uiElementName,
            toolbarItems,
            uiItemName,
            ctrl;

        if(!uiTypes[name]) { return; }

        toolbarItems = editor.theme.panel.find('toolbar *');

        uiItemName = uiTypes[name].icon;

        tinymce.each(toolbarItems, function(item) {
            if( (item.type === 'button' || item.type === 'listbox' || item.type === 'menubutton') && item.settings){
                if(item.settings.text && item.settings.text.toLowerCase() === uiItemName){
                    ctrl = item;
                    return;
                } else if ( item.settings.icon && item.settings.icon.toLowerCase() === uiItemName ) {
                    ctrl = item;
                    return;
                }
            }
        });

        if(ctrl){
            cb(ctrl);
        }
    }

    /**
     * Creates a namespaced event
     * @param  {String} eventName
     * @param  {Object} opts
     * @return {none}
     */
    function createEventName(eventName, opts) {
        return eventNameSpace + opts.uiElementName + ':' + opts.type + ':' + eventName;
    }

    /**
     * This checks events before deciding to cascade them to subgroup listeners
     * @param  {Object} data      Data passed in through event
     * @return {none}
     */
    function checkEvents(data) {
        var buttons = data.buttons || data.button,
            menuItems = data.menuItems || data.menuItem || data.menu;
        if (!buttons && !menuItems) { return console.error('No button/menu data passed on editor fire event'); }

        if (buttons) {
            cascadeEvents(data, buttons, 'button');
        }
        if (menuItems) {
            cascadeEvents(data, menuItems, 'menu');
        }
    }

    /**
     * This cascades events to other listeners (subgroups) with their intended target and effect
     *
     *   EXAMPLE:
     *     editor.fire('disable', { button: 'bold' });  -- FIRES OUT NEXT SEQUENCE --->
     *         editor.fire('mce.bold:button:disable'); Which ends in the bold button being disabled.
     *
     * @param  {Object} data Object with properties of 'button', 'buttons', or 'menu' that has either a single string or array
     *
     *   EXAMPLES:
     *     editor.fire('disable', { buttons: 'bold', menu: ['bold', 'blockquote', 'hr'] })
     *     editor.fire('disable', { button: ['bold', 'blockquote', 'hr' ] })
     *
     * @param  {Object} data          Data passed in through event
     * @param  {Object} uiItems       Items in a editor UI collection
     * @param  {String} type          Element type menu/button
     * @return {none}
     */
    function cascadeEvents(data, uiItems, type) {
        if (typeof uiItems === 'object' && uiItems.length) {
            for (var i = uiItems.length - 1; i >= 0; i--) {
                editor.fire(
                    createEventName(data.type, {
                                        uiElementName: uiItems[i],
                                        type: type
                                    })
                );
            }
        } else if (typeof uiItems === 'string') {
            editor.fire(
                createEventName(data.type, {
                                    uiElementName: uiItems,
                                    type: type
                                })
            );
        }
    }

    /**
     * Binds all events listed in defaultEvents to the editor
     * @return undefined
     */
    function bindEventsToEditor() {
        var events = Object.keys(defaultEvents);

        for (var i = events.length - 1; i >= 0; i--) {
            editor.on(events[i], checkEvents);
        }
    }

    function poll(fn, callback, timeout, interval) {
        var endTime = Number(new Date()) + (timeout || 2000);
        interval = interval || 100;

        (function p() {
            if(fn()) {
                callback();
            } else if (Number(new Date()) < endTime) {
                setTimeout(p, interval);
            } else {
                console.error('timed out for ' + fn + ': ' + arguments);
            }
        })();
    }

    init();
});
