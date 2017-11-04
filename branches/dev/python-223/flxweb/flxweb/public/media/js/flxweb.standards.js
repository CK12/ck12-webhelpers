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
 * This file originally written by Ravi Gidwani
 *
 * $Id$
 */
define(['backbone', 'jquery', 'common/views/modal.view', 'common/utils/utils', 'jquery-ui'],
    function (Backbone, $, ModalView, util) {
        'use strict';
        var StandardsModule = {},
            standardboard = '',
            standardboardID = '',
            standardboardLongname = '',
            message = '';

        function modalAlert(msg) {
            msg = msg || '';
            ModalView.alert(msg);
        }

        StandardsModule.StandardsAlignedStatesData = Backbone.Collection.extend({
            initialize: function (options) {
                options = options || {};
            },
            url: function () {
                return '/media/js/models/standards.json';
            }
        });

        StandardsModule.StandardsAlignedView = Backbone.View.extend({
            initialize: function () {
                //exit if the element does not exist
                if ($(this.el).length === 0) {
                    return;
                }

                //initialize the router
                this.router = new StandardsModule.StandardsAlignedRouter({
                    view: this
                });
            },
            camelCase: function (match) {
                return match.toUpperCase();
            },
            showBooks: function (subject, state, grade) {
                console.log(subject, state, grade);
                state = state || this.$('#standards_state').val();
                grade = grade || this.$('#standards_grade').val();
                subject = subject || this.$('#standards_subject').val();


                if (state === '-' || grade === '-' || subject === '-') {
                    // modalAlert('could not update grades');
                    return false;
                }

                $.flxweb.showLoading();
                $('#standards_books').load('/ajax/standards/books/' +
                    escape(subject) + '/' +
                    escape(state) + '/' +
                    escape(grade) + '/' +
                    escape(standardboard) + '/' +
                    escape(standardboardID) + '/' +
                    escape(standardboardLongname) + '?Message=' +
                    escape(message),
                    function () {
                        $.flxweb.hideLoading();
                        window.standardCorrelationsDialog = new StandardCorrelationsDialog_1({
                            el: $('#js_view_standards_dialog'),
                            target: $('a.std_links')
                        });
                    });
            }
        });

        StandardsModule.StandardsAlignedRouter = Backbone.Router.extend({
            routes: {
                'standards/:subject/:state/:grade': 'onRouteChange',
                'standards/:subject/:state/:grade/': 'onRouteChange'
            },
            initialize: function (options) {
                this.options = options;
            },
            onRouteChange: function (subject, state, grade) {
                this.options.view.showBooks(subject, state, grade);
            }
        });


        $(document).ready(function () {
            var view,
                pushState = window.history && window.history.pushState; // Disable pushState for older browsers

            view = new StandardsModule.StandardsAlignedView({
                el: $('#standards_form'),
                pushState: pushState
            });
            Backbone.history.start({
                pushState: pushState
            });
            if (!pushState) {
                view.showBooks();
            }
            var config = {
                id:'standardsApp',
                initailizedData: {}
            };
            var pathname = window.location.pathname;
            var params = pathname.split('/').filter(function(param){ return param.length > 0;});
            if(params.length > 1){
                var initailizedData = {
                    standard: params[2].split('.')[1],
                    subject: params[1],
                    grade: params[3]
                };
                config.initailizedData = initailizedData;
                config.callback = function(data){
                    var url = '/standards' + '/' + escape(data.subjectName) + '/' +data.countryCode+ '.' + data.standard + '/' + data.grade;
                    view.router.navigate(url, {trigger: true, replace: true});
                };
            }
            if(window.StandardSelections){
                window.StandardSelections.init(config);
            }
        });
    });
