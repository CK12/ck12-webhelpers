'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
    'use strict';

    var React = require('react');
    var ReactDOM = require('react-dom');

    var Backbone = require('backbone');
    var _ = require('underscore');
    var $ = require('jquery');
    var Utils = require('common/utils/utils');

    var SchoolBanner = require('./components/schoolbanner');
    var StateBanner = require('./components/statebanner');
    var StateSelector = require('./components/stateselector');
    var SchoolList = require('./components/schoollist');

    var SchoolServices = require('schools/services/schools.services');

    var DEFAULT_STATE = 'california';

    var appData = {};
    var schoolRouter;

    /**
    Utility functions for fetching and manipulating states & schools data.
    **/

    //fetch states data from server
    var fetchStates = SchoolServices.getStates().then(function (data) {
        data = _(data).sortBy('_id').map(function (state) {
            return Object.assign(state, {
                slug: Utils.slugify(state._id),
                name: Utils.toTitleCase(state._id)
            });
        });
        return data;
    });

    //find a state in states data by slug
    var findState = function findState(stateSlug) {
        var _d = $.Deferred(),
            foundState = null;
        fetchStates.done(function (states) {
            foundState = states.find(function (state) {
                return state.slug === stateSlug;
            });
            if (foundState) {
                _d.resolve(foundState);
            } else {
                _d.reject();
            }
        });
        return _d.promise();
    };

    //retrieve user location using api
    var fetchLocation = SchoolServices.getLocation();

    //based on the retrieved location, fetch the local state
    var fetchLocalRegion = $.when(fetchLocation).then(function (location) {
        var region = location && location.region || DEFAULT_STATE;
        return findState(region);
    });

    //fetch schools for a state
    var fetchSchoolsForState = function fetchSchoolsForState(stateSlug) {
        var _d = $.Deferred(),
            schools;
        findState(stateSlug).then(function (state) {
            SchoolServices.getSchoolsForState({
                state: state._id
            }).then(function (data) {
                schools = data.school_artifacts.map(function (school) {
                    var books = school.approved_books,
                        id = books[0].schoolID,
                        slug = Utils.slugify(school.school_name);
                    return {
                        name: school.school_name,
                        books: books,
                        id: id,
                        slug: slug,
                        url: '/r-schools/' + stateSlug + '/' + slug + '-' + id
                    };
                });
                _d.resolve(schools);
            }, function (err) {
                _d.reject(err);
            });
        }, function (err) {
            _d.reject(err);
        });
        return _d.promise();
    };

    var SchoolsMain = function (_React$Component) {
        _inherits(SchoolsMain, _React$Component);

        function SchoolsMain() {
            _classCallCheck(this, SchoolsMain);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(SchoolsMain).apply(this, arguments));
        }

        _createClass(SchoolsMain, [{
            key: 'render',
            value: function render() {
                var data = this.props.data;
                var selectedStateSchools = data.selectedStateSchools || [];
                console.log(selectedStateSchools);
                return React.createElement(
                    'div',
                    null,
                    React.createElement(StateBanner, null),
                    React.createElement(StateSelector, { states: data.states, selectedState: data.selectedState }),
                    React.createElement(SchoolList, { schools: selectedStateSchools })
                );
            }
        }]);

        return SchoolsMain;
    }(React.Component);

    var render = function render() {
        ReactDOM.render(React.createElement(SchoolsMain, { data: appData }), document.getElementById('schoolMainContainer'));
    };

    fetchStates.done(function (data) {
        appData.states = data;render();
    });
    fetchLocation.then(function (location) {
        appData.location = location;
    });

    var Router = Backbone.Router.extend({
        appData: appData,
        routes: {
            'r-schools(/)': 'home',
            'r-schools/:state(/)': 'state',
            'r-schools/:state/:school-:id(/)': 'school'
        },
        home: function home() {
            fetchLocalRegion.then(function (region) {
                //Fetch user's location information and navigate to the local
                //state (or default state, if local state isn't available or
                //isn't a US state)
                schoolRouter.navigate('/r-schools/' + region.slug);
            }, function () {
                //TODO: handle case where somehow the location can't be retrieved
            });
            render();
        },
        state: function state(stateSlug) {
            findState(stateSlug).done(function (foundState) {
                appData.selectedState = foundState;
                fetchSchoolsForState(stateSlug).then(function (data) {
                    appData.selectedStateSchools = data;
                    render();
                });
                render();
            });
            render();
        },
        school: function school(stateName, schoolName, schoolID) {
            console.log(stateName, schoolName, schoolID);
            render();
        }
    });

    schoolRouter = new Router();
    Backbone.history.start({
        pushState: true
    });

    return schoolRouter;
});
//# sourceMappingURL=schools-react.js.map
