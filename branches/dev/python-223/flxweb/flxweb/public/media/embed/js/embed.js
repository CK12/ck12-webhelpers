/**
 * Copyright 2007-2013 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
define(['jquery', 'common/utils/url', 'backbone'],
    function ($, URL, Backbone) {
        'use strict';

        function Embedder() {

            /*var modules = ['concept', 'modality'],*/
            var active_module_name = '',
                active_module = null,
                current_module = null,
                current_params = null,
                that = this;

            $.extend(this, Backbone.Events);

            /**
             * @method - returns the current module and params
             */
            function getConfiguration() {
                return ({
                    module: current_module,
                    params: current_params
                });
            }

            function loadModule(module, params) {
                var loader = this;
                try {
                    if (module) {
                        require(['modality/controllers/' + module], function (Module) {
                            active_module = new Module(loader);
                            if (active_module && active_module.destroy && 'function' === typeof active_module.init) {
                                active_module.init(params);
                            } else {
                                throw 'Unsupported module format.';
                            }

                        });
                        current_module = module;
                        current_params = params;
                        that.trigger('loadmodule', getConfiguration());
                    } else {
                        throw 'No module to load';
                    }
                } catch (e) {
                    console.log('Could not load module: ' + module);
                }
            }


            function hashchange() {
                var hash_params, _module;
                hash_params = new URL().hash_params;
                hash_params.el = $('#embed_container');
                hash_params.view_mode = 'embed';
                _module = hash_params.module;

                if (_module === active_module_name) {
                    if (active_module && active_module.destroy && 'function' === typeof active_module.hashchange) {
                        //                        current_params = params;
                        active_module.hashchange(hash_params);
                    }
                } else {
                    if (active_module && active_module.destroy && 'function' === typeof active_module.destroy) {
                        active_module.destroy();
                    }
                    loadModule(_module, hash_params);
                }
                that.trigger('hashchange', getConfiguration());
            }

            function init() {
                var hash_params = new URL().hash_params;
                this.trigger('init');

                //embed specific parameters
                hash_params.el = $('#embed_container');
                hash_params.view_mode = 'embed';
                try {
                    loadModule(hash_params.module, hash_params);
                } catch (e) {
                    $('#embed_container').html(e.message);
                }
                if ('true' !== hash_params.nochrome) {
                    $('body').removeClass('nochrome');
                }
                if ('list' === hash_params.display_style) {
                    $('body').addClass('display-style-list');
                }
                if ('string' === typeof hash_params.app_context) {
                    $('body').addClass('appcontext-' + hash_params.app_context);
                    if (hash_params.app_context === 'athena') {
                        var meta = document.createElement('meta');
                        meta.setAttribute('http-equiv', 'X-UA-Compatible');
                        meta.setAttribute('content', 'IE=EmulateIE10');
                        $('head').append(meta);
                    }
                }
                $(window).off('hashchange.module').on('hashchange.module', hashchange);
            }

            this.init = init;
            this.getConfiguration = getConfiguration;
        }

        return Embedder;
    });
