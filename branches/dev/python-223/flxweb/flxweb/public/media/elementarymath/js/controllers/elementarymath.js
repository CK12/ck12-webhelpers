/* global _ck12 */
define(['jquery',
        'backbone',
        'elementarymath/views/elementarymath.view',
        'elementarymath/models/browse.models'
        ],
    function ($, Backbone, view, model) {
        'use strict';

        function BrowseController() {

            var browseRouter, router, branch,
                ADSdone = false,
                self = this,
                browseView = new view(this),
                browseModel = new model.browseTerm();

            var SEO_META_TAGS = {
                '1' : { 'title': 'Grade 1 Elementary Math Games & Problems | CK12', 'description':'At ck12.org, we provide students and teachers alike with a variety of math games, problems and more.  We are a great resource for anyone wanting to learn.'},
                '2' : { 'title': 'Grade 2 Math | Squares, Circles, Rectangles, Triangles', 'description':'CK12\'s 2nd grade math modules cover many topics for students. Learn how to identify all types of shapes including squares, circles, rectangles and more.'},
                '3' : { 'title': 'Grade 3 Math | Factors & Multiplication | CK12', 'description':'Build the foundation of learning at CK12. Our 3rd grade math topics cover everything from multiplication to factors. Come explore today!'},
                '4' : { 'title': 'Grade 4 Math | Coin Values | Equations | CK12', 'description':'Prepare for your future with CK12\'s 4th grade math modules. Learn and play games that teach users coin values, how to identify and solve equations and more.'},
                '5' : { 'title': 'Grade 5 Math | Adding Fractions, Decimals & Place Value', 'description':'CK12\'s 5th grade math worksheets cover the basics of fractions, decimals, and more. Come inside to learn numerators, denominators and decimal place values.'}
            };

            this.eid = 'MAT.EM';
            this.memberID = $('header').data('user');

            this.logADSEvent = function (payload, event) {
                if (window._ck12) {
                    event = event || 'FBS_VIEW';
                    payload.branch = branch || 'Elementary Math';
                    if (!ADSdone) {
                        _ck12.logEvent(event, payload);
                    }
                    ADSdone = true;
                    setTimeout(function () {
                        ADSdone = false;
                    }, 500);
                }
            };

            browseRouter = Backbone.Router.extend({
                routes: {
                    'elementary-math(/)': 'loadGrade',
                    'elementary-math-grade-:grade(/)': 'loadGrade'
                },
                initialize: function (options) {
                    this.options = options;
                },
                loadGrade: function (grade) {
                    grade = grade || $.cookie('flxwebgrade');
                    self.grade = grade;
                    self.getBrowseTerm({
                        'eID': self.eid + (grade || 1),
                        'grade': grade || 1,
                        'loadGrade': true
                    }).done(browseView.init).fail(function () {
                        browseView.init(false);
                    });
                }
            });

            this.getBrowseTerm = function (options) {
                var _d = $.Deferred(), rendered = false;
                browseModel.eID = options.eID || '';
                browseModel.grade = options.grade || '';
                browseModel.collectionHandle = 'elementary-math-grade-' + options.grade;
                browseModel.fetch({
                    localCache: {
                        region: 'monthly',
                        key: browseModel.collectionHandle,
                        namespace: 'browse',
                        validatedata: browseModel.parse
                    },
                    success: function (result, response) {
                        if (!rendered) {
                            self.grade = options.grade;
                            var seoTags = null;
                            if (!self.grade) {
                                seoTags = SEO_META_TAGS['1'];
                            } else {
                                seoTags = SEO_META_TAGS[self.grade];
                            }
                            document.title = seoTags.title;
                            $('meta[name=description]').attr('content', seoTags.description);

                            if (options.grade) {
                                if (options.loadGrade) {
                                    history.replaceState({}, document.title, '/elementary-math-grade-' + options.grade);
                                } else {
                                    history.pushState({}, document.title, '/elementary-math-grade-' + options.grade);
                                }
                            }
                            _d.resolve(result);
                            try {
                                branch = '';
                                var payload = {};
                                payload.page = 'browse';
                                payload.page_view = 'list';
                                response = response.response;
                                if (response && response.hasOwnProperty('branch')) {
                                    branch = response.branch.name || '';
                                    if (response.branch.hasOwnProperty('parent') && response.branch.parent.level > 0) {
                                        payload.subject = response.branch.parent.name;
                                    }
                                } else {
                                    branch = '';
                                }
                                if (options.clicked) {
                                    payload.referral_action = 'clicked';
                                } else if ($.cookie('flxwebgrade')) {
                                    payload.referral_action = 'remembered';
                                } else {
                                    payload.referral_action = 'default';
                                }
                                self.logADSEvent(payload);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        rendered = true;
                    },
                    error: _d.reject
                });
                return _d.promise();
            };

            this.init = function (container, ownContentContainer, ownContentContainerSmall) {
                self.container = container;
                self.ownContentContainer = ownContentContainer;
                self.ownContentContainerSmall = ownContentContainerSmall;
                router = new browseRouter();
                var pushState = window.history && window.history.pushState;

                Backbone.history.start({
                    pushState: pushState
                });
                if (!pushState) {
                    router.loadGrade();
                }
            };


        }

        return new BrowseController();
    });
