define([
        'jquery',
        'backbone',
        'standard/services/ck12.standard',
        'standard/models/standard.model',
        'groups/controllers/assignment.edit',
        'common/utils/mergeChildren',
        'common/utils/utils'
    ],
    function (
        $,
        Backbone,
        standardServices,
        standardModel,
        AssignmentEditController,
        merge,
        util) {

        'use strict';

        function standardController() {

            var setsCollection = new standardModel.setsCollection(),
                nodesCollection = new standardModel.nodesCollection(),
                standardService = new standardServices(),
                standardType, router, pushState,
                standardRouter,
                _c = this;

            function getChildren(sid, callback) {
                var data = {
                    'depth': 6,
                    'sid': sid,
                    'getConcepts': true,
                    'set': standardType
                };
                util.ajaxStart();
                standardService.getStandards(data, nodesCollection).done(function () {
                    var nodeModel = nodesCollection.at(0).toJSON();
                    if (nodeModel.hasOwnProperty('response') && !(nodeModel.response.hasOwnProperty('message'))) {
                        if ('ccss' === standardType.toLowerCase()) {
                            nodeModel.response.standards = merge.mergeChildrenRecursive(nodeModel.response.standards, 'children');
                        }
                    } else {
                        console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                    }
                    if (callback) {
                        callback(nodesCollection, setsCollection);
                    }
                    util.ajaxStop();
                }).fail(function (error) {
                    console.log(error);
                    util.ajaxStop();
                });
            }

            function loadView() {
                var _d = $.Deferred();
                try {
                    require(['standard/views/standard.view'], function (view) {
                        _d.resolve(view);
                    });
                } catch (e) {
                    _d.reject('Could not load view and templates');
                }
                return _d.promise();
            }

            function loadMobileView() {
                util.ajaxStart();
                $.when(loadView()).done(function (view) {
                    _c.view = new view(_c);
                    _c.view.loadMobileView();
                    util.ajaxStop();
                }).fail(function (error) {
                    console.log(error);
                    util.ajaxStop();
                });
            }

            standardRouter = Backbone.Router.extend({
                routes: {
                    ':standardType(/)': 'loadInfo',
                    ':standardType/:set/:domain(/)': 'loadSet'
                },
                initialize: function (options) {
                    this.options = options;
                },
                loadInfo: function (_standardType) {
                    _standardType = _standardType || location.pathname.split('/')[1];
                    if ('standard' === _standardType) {
                        loadMobileView();
                        return;
                    }
                    standardType = _standardType.toUpperCase();
                    util.ajaxStart();
                    $.when(loadView(), standardService.getStandards({
                        'set': standardType,
                        'depth': 3
                    }, setsCollection)).done(function (view) {
                        _c.view = new view(_c);
                        var setModel = setsCollection.at(0).toJSON();
                        if (setModel.hasOwnProperty('response') && !(setModel.response.hasOwnProperty('message'))) {
                            if ('ngss' === standardType.toLowerCase()) {
                                setModel.response.standards = merge.mergeChildren(setModel.response.standards, 'children');
                            }
                            _c.view.init(standardType, setsCollection);
                            util.ajaxStop();
                        } else {
                            console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                            util.ajaxStop();
                        }
                    }).fail(function (error) {
                        console.log(error);
                        util.ajaxStop();
                    });
                },
                loadSet: function (_standardType, set, domain) {
                    if ('standard' === _standardType) {
                        loadMobileView();
                        return;
                    }
                    set = decodeURIComponent(set).replace(/\-/g, ' ');
                    domain = decodeURIComponent(domain).replace(/\-/g, ' ');
                    standardType = _standardType.toUpperCase();
                    util.ajaxStart();
                    standardService.getStandards({
                        'set': standardType,
                        'depth': 3
                    }, setsCollection).done(function () {
                        var setModel, index, data;
                        setModel = setsCollection.at(0).toJSON();
                        if (setModel.hasOwnProperty('response') && !(setModel.response.hasOwnProperty('message'))) {
                            if ('ngss' === standardType.toLowerCase()) {
                                setModel.response.standards = merge.mergeChildren(setModel.response.standards, 'children');
                            }
                            setModel = setModel.response.standards;
                            for (index = 0; index < setModel.length; index++) {
                                if (set === $.trim(setModel[index].description.toLowerCase().replace(/\-/g, ' '))) {
                                    data = setModel[index].sid;
                                    break;
                                }
                            }
                            if (!data) {
                                console.log('The url you entered does not match with a standard. Please contact our customer support for more information.');
                                util.ajaxStop();
                                return;
                            }
                            data = {
                                'depth': 6,
                                'sid': data,
                                'getConcepts': true,
                                'set': standardType
                            };
                            $.when(loadView(), standardService.getStandards(data, nodesCollection)).done(function (view) {
                                _c.view = new view(_c);
                                var nodeModel = nodesCollection.at(0).toJSON();
                                if (nodeModel.hasOwnProperty('response') && !(nodeModel.response.hasOwnProperty('message'))) {
                                    if ('ccss' === standardType.toLowerCase()) {
                                        nodeModel.response.standards = merge.mergeChildrenRecursive(nodeModel.response.standards, 'children');
                                    }
                                } else {
                                    console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                                }
                                _c.view.loadSets(standardType, domain, setsCollection, nodesCollection);
                                util.ajaxStop();
                            }).fail(function (error) {
                                console.log(error);
                                util.ajaxStop();
                            });
                        } else {
                            console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                            util.ajaxStop();
                        }
                    }).fail(function (error) {
                        console.log(error);
                        util.ajaxStop();
                    });
                }
            });

            function load() {

                router = new standardRouter();
                pushState = window.history && window.history.pushState;
                Backbone.history.start({
                    pushState: pushState
                });
                if (!pushState) {
                    router.loadInfo();
                }
               
            }

            function showNewsPaper(src) {
                AssignmentEditController.showNewspaper(src);
            }

            function updateURL(url) {
                router.navigate(url, { trigger: true });
            }

            this.load = load;
            this.loadMobileView = loadMobileView;
            this.getChildren = getChildren;
            this.showNewsPaper = showNewsPaper;
            this.updateURL = updateURL;

        }

        return standardController;
    });