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
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'text!common/templates/uikitModal.html'
    ],
    function ($, _, backbone, modalTemplate) {

        'use strict';

        function addEvent(el, button, that) {
            el.addEventListener('click', function (e) {
                button.onclick.call(that, e);
            });
        }

        /**
         * Wrap the template configuration in an object, compile and return the template
         * @returns {function} - Compilied underscore template.
         * @private
         */
        function _renderTemplate(config) {
            return _.template(modalTemplate, config, {
                variable: 'data'
            });
        }

        /**
         * Append user defined buttons to the modal. Intended to be called with the context of the view.
         * @private
         */
        function _addButtons() {
            var button, el, i, len, that = this;
            for (i = 0, len = this.options.buttons.length; i < len; i++) {
                button = this.options.buttons[i];
                el = document.createElement('div');
                if (button.id) {
                    el.setAttribute('id', button.id);
                }
                if (button.className) {
                    el.setAttribute('class', 'button ' + button.className);
                } else {
                    el.setAttribute('class', 'button');
                }
                if (button.text) {
                    el.innerHTML = button.text;
                }
                if (typeof button.onclick === 'function') {
                    addEvent(el, button, that);
                }
                this.$template.find('.modal-uikit .modal-actions').append(el);
            }
            return null;
        }

        /**
         *  Append the view to the document. Intended to be called with the context of the view.
         *  @private
         */
        function _render() {
            // now that the this.$template is ready, set the backbone el
            var yMiddle, scrollTop, marginTop, $modalBody = this.$modalBody;

            document.body.appendChild(this.el);
            // disallow background scrolling (overflow-y hidden)
            $(document.body).addClass('noscroll');
            // now calculate the amount of y-offset that we need to move the modal.
            yMiddle = window.innerHeight / 2.0; // get the middle of the screen
            scrollTop = window.scrollY || window.pageYOffset; // get how much the user has scrolled down the page
            if (this.calculateTopPosition){
                if (yMiddle - $modalBody.outerHeight() / 2.0 > 0) {
                    marginTop = scrollTop + (yMiddle - $modalBody.outerHeight() / 2.0);
                } else {
                    marginTop = scrollTop + 50;
                }
                $modalBody.css({
                    'margin-top': marginTop + 'px'
                });
            }
            if (this.options.css) {
                $modalBody.css(this.options.css);
            }
            return null;
        }

        /**
         * @constructor
         * @params {Object} - Configure the behavior of this generic modal view.
         *                   Example config object:
         *                  {
         *                      partial: (string / jQuery object) any additional HTML.
         *                      contentPartial: (string / jQuery object) additional HTML appended inside .content.
         *                      initialize: (function) function call to be executed before render.
         *                      showOnOpen: (bool) if true, render is called immeadiately.
         *                      css: (object) A css object applied via jQuery.css(css) in the render method.
         *                      onclose: (function) callback for when modal closes.
         *                      onopen: (function) callback for when modal opens.
         *                      headerText: (string) innerHTML to be added to the modal's header.
         *                      contentText: (string) innerHTML to be added to the content body.
         *                      // note: the following IDs are optional.
         *                      modalID: (string) DOM ID for modal
         *                      headerID: (string) DOM ID for modal header
         *                      closeID: (string) DOM ID for close button.
         *                      contentID: (string) DOM ID for content div.
         *
         *                      // Pass additional buttons below the content div.
         *                      // Buttons are implemented as divs w/button CSS class.
         *                      buttons (array of objects): [
         *                          {
         *                              id: (string) DOM ID for button
         *                              className: (string) extra class to be added to button
         *                              text: (string) innerHTML content for button
         *                              onclick: (function) callback function for click event
         *                          }
         *                      ]
         *                  }
         */
        var ModalView = backbone.View.extend({
            initialize: function () {
                this.$template = $(_renderTemplate(this.options));
                this.setElement(this.$template[0]);
                this.$modalBody = this.$el.find('.modal-uikit');

                if (this.options.contentPartial) {
                    this.$template.find('.content').append(this.options.contentPartial);
                }
                if (this.options.partial) {
                    this.$template.find('.modal-uikit').append(this.options.partial);
                }
                if (this.options.buttons !== undefined) {
                    _addButtons.call(this);
                }
                if (this.options.calculateTopPosition !== undefined){
                    this.calculateTopPosition = this.options.calculateTopPosition === true;
                }else{
                    this.calculateTopPosition = true;
                }

                if (this.options.headerPartial) {
                    this.$template.find('.header').append(this.options.headerPartial);
                }
                if (this.options.width) {
                    this.$template.find('.modal-uikit-view').css('width', this.options.width);
                }
                // run initialize from options
                if (typeof this.options.initialize === 'function') {
                    this.options.initialize.call(this);
                }
                if (typeof this.options.onclose === 'function') {
                    this.on('close', this.options.onclose, this);
                }
                if (typeof this.options.onopen === 'function') {
                    this.on('open', this.options.onopen, this);
                }
                if (this.options.showOnOpen === true) {
                    this.open();
                }


                return null;
            },

            /** @method - proxy to render */
            open: function () {
                _render.call(this);
                this.trigger('open');
                return null;
            },

            /** @method - backbone event bindings.
             *            Automatically called by backbone, DO NOT CHANGE.
             */
            events: function () {
                var events = {};
                events['click .close'] = 'close';
                return events;
            },

            /** @callback - closes the modal view and unbinds everything */
            close: function () {
                this.trigger('close');
                this.remove();
                $(document.body).removeClass('noscroll');
                return null;
            },

            /** */
            addClass: function (className) {
                this.$template.find('.modal-uikit').addClass(className);
            }
        }, {
            /**
             * ModalView.alert
             * Shows an alert message in a responsive modal dialog
             * @param {string} msg: Message text to be shown on the modal
             */
            alert: function (msg, callback, hideCloseButton) {
                hideCloseButton = hideCloseButton || false;

                var alertModal = new ModalView({
                    'showOnOpen': true,
                    'calculateTopPosition': true,
                    'contentPartial': msg,
                    'buttons': [
                        {
                            'text': 'OK',
                            'onclick': function () {
                                this.close();
                                if (callback) {
                                    callback();
                                }
                            },
                            'className': 'turquoise'
                        }
                    ]
                });
                alertModal.addClass('modal-uikit-alert');
                if(hideCloseButton)
                    alertModal.$template.find('.close').css('display', 'none');
                return alertModal;
            },
            confirm: function (callback, contentMsg, headerMsg, elem) {
                var confirmModal = new ModalView({
                    'showOnOpen': true,
                    'calculateTopPosition': true,
                    'contentPartial': contentMsg,
                    'headerPartial': headerMsg,
                    'buttons': [
                        {
                            'text': 'OK',
                            'onclick': function () {
                                callback(elem);
                                this.close();
                            },
                            'className': 'turquoise modal-uikit-ok'
                        },
                        {
                            'text': 'CANCEL',
                            'onclick': function () {
                                this.close();
                            },
                            'className': 'turquoise modal-uikit-cancel'
                        }
                    ]
                });
                confirmModal.addClass('modal-uikit-alert modal-uikit-confirm');
                return confirmModal;
            },
            validateAlert: function (contentMsg, txt_box_name) {
                var validateAlertModal = new ModalView({
                    'showOnOpen': true,
                    'contentPartial': contentMsg,
                    'headerPartial': 'Invalid Title',
                    'width': 400,
                    'buttons': [
                        {
                            'text': 'Cancel',
                            'onclick': function () {
                                this.close();
                            },
                            'className': 'dusty-grey modal-uikit-ok'
                        }, {
                            'text': 'Edit Title',
                            'onclick': function () {
                                $(txt_box_name).focus().select();
                                this.close();
                            },
                            'className': 'turquoise modal-uikit-cancel'
                        }
                    ]
                });
                validateAlertModal.addClass('modal-uikit-alert modal-uikit-confirm');
                return validateAlertModal;
            },

            /**
             * Make an iframe the main content of the modal
             * @param {string} srcURL - This is the src of the iframe.
             * @param {object} extraOptions - extends the defaults for this iframe view.
             */
            iframe: function (srcURL, extraOptions) {
                var iframeModal, DEFAULTS,
                    scrollTop = window.scrollY || window.pageYOffset, // get how much the user has scrolled down the page
                    height = window.innerHeight * 0.90;

                DEFAULTS = {
                    showOnOpen: true,
                    calculateTopPosition: true,
                    css: {
                        'margin-top': (scrollTop + (height * (1 / 18))) + 'px',
                        'height': height + 'px',
                        padding: '0'
                    },
                    initialize: function () {
                        this.$iframe = $(('<iframe frameborder="0"></iframe>'));
                        this.iframe = this.$iframe[0];
                        var $modalBody = this.$modalBody;
                        $modalBody.find('.content').append(this.iframe).css({
                            'padding': '0px 0px'
                        });
                        $modalBody.find('.close').css({
                            'z-index': 10000000,
                            left: '-16px' // switch close because there may be a scrollbar
                        });
                        this.on('open', function () {
                            this.$iframe.css({
                                position: 'absolute'
                            });
                            this.$iframe.attr('width', $modalBody.width());
                            this.$iframe.attr('height', height - 4); // height-4 is a snug fit
                            this.iframe.contentWindow.location.href = srcURL;
                        }, this);
                    }
                };

                if (typeof extraOptions === 'object') {
                    $.extend(true, DEFAULTS, extraOptions);
                }

                iframeModal = new ModalView(DEFAULTS);
                return iframeModal;
            }
        });


        return ModalView;
    }
);
