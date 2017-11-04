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
define([
    "jquery",
    "underscore",
    "backbone",
    "athenaapp/views/views",
    "common/utils/url",
    "common/utils/user",
    "practiceapp/services/practiceapp.services",
    "practiceapp/config/config",
    "athenaapp/CK12AthenaBridge",
    "common/views/modal.view",
    // polyfils
    "common/js/utils/window.location.js",
    "common/js/utils/Number.isNaN.js",
], function($, _, Backbone, Views, URLHelper, User, PracticeAppServices, Config, CK12AthenaBridge, ModalView /*, polyfils */ ) {

    /**
     * Main controller for the CK12 AthenaApp
     */
    function AthenaApp(appConfig){
        var _c               = this,          //reference to self
            appUrl           = new URLHelper(), //app URL
            appContext       = {},    //Application context to be shared across views
            activeView       = null;  //Currently active view
        var screenWarningDiv = null;

        _c.ck12AthenaBridge = appConfig.bridge;

        /**
         * Initialize Dexter for analytics
         */
        function initializeDexter() {
            var appID = appContext.config.app_name;
            _c.dexterjs = dexterjs({
                memberID: null,
                clientID: 71438528,
                mixins: {
                    appID: appID
                }
            });
            try {
                var page_view = {'URL': window.location.href};
                _c.dexterjs.logEvent('FBS_PAGE_VIEW', page_view);
            } catch(e){
                console.log("Error trying to send dexter event FBS_PAGE_VIEW: " + e);
            }
        }

        /**
         * @private - Function used to destry current view and switch to new view.
         * @param {Backbone.View} View - Pointer to a Backbone.View (like AppView).
         * @returns {Backbone.View} activeView
         */
        function switchView(View, options) {
            if (activeView !== null && "function" === typeof activeView.destroy){
                activeView.destroy();
            }
            activeView = new View($.extend(true, {
                "el": $("#athenaapp_container"),
                "controller": _c
            }, options));
            return activeView;
        }

        /**
         * Append the screen warning div only if it is pointing to null.
         * NOTE: This is handled in the JS because we don't want to have the HTML div for Play mode.
         */
        function appendScreenWarning() {
            if (!screenWarningDiv) {
                screenWarningDiv = document.createElement("div");
                screenWarningDiv.setAttribute("class", "screen-too-small");
                screenWarningDiv.appendChild(document.createTextNode("Please enlarge your window"));
                document.body.appendChild(screenWarningDiv);
            }
        }

        _c.setTitle = function() {}; //TODO: doesn't inherit from lmspracticeapp ... must be here
        _c.fixTitle = function(title) {
            $(".ck12-athena-header-wrapper .app-name").text(title);
        };

        _c.showMessage = function(msg) {
            /**
             *  Show a modal popup message
             *  @param msg (String) : Message text
             */
            return ModalView.alert(msg);
        };

        _c.launchEditView = function() {
            appendScreenWarning();
            switchView(Views.EditView);
            bindEditListeners(activeView);
        };

        function bindEditListeners(view) {
            view.on("setURI", function(embedURI) {
                console.log(embedURI);
                _c.ck12AthenaBridge.setURI(embedURI, _c.appContext.config.app_name);
            });
            view.on("editIframeClosed", function() {
                _c.ck12AthenaBridge.getConfig(function(config) {
                    // verify that we have actually set the config...
                    if (config !== null) {
                        _c.launchPlayView(); // EXIT
                    }
                });
            });
        }

        function bindPlayListeners(view) {
            view.on("playViewClose");
            _c.ck12AthenaBridge.closeLabInstance();
        }

        _c.launchPlayView = function() {
            _c.ck12AthenaBridge.getURI(function(URI) {
                switchView(Views.PlayView, {URI:URI});
                bindPlayListeners(activeView);
            });
        };

        /**
         * @callback - Handler for when user switches modes (edit | play)
         */
        function labModeChange(object) {
            if (object.mode === "edit") {
                _c.launchEditView();
            }
            else {
                _c.launchPlayView();
            }
            return null;
        }

        /** @private - determine which app configuration based on URL */
        function detectAppConfig() {
            var appConfig;
            var p = appUrl.pathname;
            if (p.match(/math/)) {
                return "athenaMathResources";
            }
            else if (p.match(/science/)) {
                return "athenaScienceResources";
            }
            else {
                return "athenaMathResources";
            }
        }

        /**
         * @private - Bind controller backbone event triggers / handlers.
         */
        function bindEvents() {
            _c.ck12AthenaBridge.on(_c.ck12AthenaBridge.eventNames.labModeChange, labModeChange);
        }

        /**
         * Show the alert banner just below the header
         */
         function showIndexAlertBanner() {
             $('#athena_banner_alert').css({'margin-top': '50px', 'margin-bottom':'-50px'});
             $('#athena_banner_alert').removeClass('hide');
         }

        /**
         * Set context, call the Labsjs API initialize method, Bind events
         */
        function init() {
            //Turn this controller into a backbone event bus. Buses are good.
            $.extend(_c, Backbone.Events);
            _c.appContext = appContext;
            _c.appUrl = appUrl;

            _c.appContext.user = User.createHollowUser();
            appContext.config = Config.getConfig(detectAppConfig());
            _c.fixTitle(appContext.config.app_display_name.replace("CK-12 ", ""));
            _c.appServices = new PracticeAppServices(appContext.config);
            bindEvents.call(_c);

            // LAUNCH
            if (appConfig.initialState.mode === 0) {
                _c.ck12AthenaBridge.getConfig(function(config) {
                    // verify that we have actually set the config...
                    if (config !== null) {
                        _c.launchPlayView();
                    }
                    else {
                        _c.launchEditView();
                        showIndexAlertBanner();
                    }
                });
            }
            else {
                _c.launchPlayView();
            }
            // DEXTER
            initializeDexter();
            _c.dexterjs.logEvent("ATHENA_APP_LAUNCH");
        }

        init();
    }

    return AthenaApp;
});
