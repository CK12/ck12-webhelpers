define( (require) => {
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



    var appData = {

    };
    var schoolRouter;


    /**
    Utility functions for fetching and manipulating states & schools data.
    **/

    //fetch states data from server
    var fetchStates = SchoolServices.getStates().then( (data) => {
        data = _(data).sortBy('_id').map((state) => {
            return Object.assign(state, {
                slug : Utils.slugify(state._id),
                name : Utils.toTitleCase(state._id)
            });
        });
        return data;
    });

    //find a state in states data by slug
    var findState = (stateSlug) => {
        var _d = $.Deferred(),
            foundState = null;
        fetchStates.done( (states) => {
            foundState = states.find( (state) => {
                return state.slug === stateSlug;
            });
            if (foundState){
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
    var fetchLocalRegion = $.when(fetchLocation).then( (location)=>{
        var region = (location && location.region) || DEFAULT_STATE;
        return findState(region);
    });

    //fetch schools for a state
    var fetchSchoolsForState = (stateSlug) => {
        var _d = $.Deferred(),schools;
        findState(stateSlug)
        .then((state) => {
            SchoolServices.getSchoolsForState({
                state:state._id
            }).then( (data) => {
                schools = data.school_artifacts.map( (school) => {
                    var books = school.approved_books,
                        id = books[0].schoolID,
                        slug = Utils.slugify(school.school_name);
                    return {
                        name: school.school_name,
                        books,
                        id,
                        slug,
                        url: `/r-schools/${stateSlug}/${slug}-${id}`
                    }
                } )
                _d.resolve(schools);
            }, (err) => {
                _d.reject(err);
            })
        }, (err) => {
            _d.reject(err);
        })
        return _d.promise();
    }



    class SchoolsMain extends React.Component{
        render (){
            var data = this.props.data;
            var selectedStateSchools = data.selectedStateSchools || [];
            console.log(selectedStateSchools);
            return (
                <div>
                    <StateBanner />
                    <StateSelector states={data.states} selectedState={data.selectedState} />
                    <SchoolList schools={selectedStateSchools} />
                </div>
            );
        }
    }




    var render = () => {
        ReactDOM.render(<SchoolsMain data={appData} />, document.getElementById('schoolMainContainer'));
    };

    fetchStates.done((data) => { appData.states = data; render(); });
    fetchLocation.then((location) => { appData.location = location; });




    var Router = Backbone.Router.extend({
        appData,
        routes :{
            'r-schools(/)': 'home',
            'r-schools/:state(/)': 'state',
            'r-schools/:state/:school-:id(/)': 'school'
        },
        home: () => {
            fetchLocalRegion.then((region) => {
                //Fetch user's location information and navigate to the local
                //state (or default state, if local state isn't available or
                //isn't a US state)
                schoolRouter.navigate(`/r-schools/${region.slug}`);
            }, () => {
                //TODO: handle case where somehow the location can't be retrieved
            });
            render();
        },
        state: (stateSlug) => {
            findState(stateSlug).done((foundState) => {
                appData.selectedState = foundState;
                fetchSchoolsForState(stateSlug).then( (data) => {
                    appData.selectedStateSchools = data;
                    render();
                })
                render();
            });
            render();
        },
        school: (stateName, schoolName, schoolID) => {
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
