import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {browserHistory} from 'react-router';
import ControlCenterMenu from 'components/ControlCenterMenu';

import routes from 'routes';

import { controlCenter } from 'scss/components/ControlCenter';
import * as countsActions from 'actions/countsActions';
import { showTooltip, hideTutorial } from 'actions/tutorialActions';
import { showModal } from 'actions/modalActions';
import { saveAppData } from 'actions/appDataActions';
import { tutorialPaths } from 'utils/tutorial';

var _appData ="";

const menuItems = [
    {
        menuFor: 'Content',
        title: 'New!',
        subtitle: 'Content',
        iconClass: 'content',
        route: routes.contentPage.home,
        alias: [routes.contentPage.recommended, routes.contentPage.standards],
        tutorial: {
            mapsTo: tutorialPaths.menuContent,
            tooltipText: 'You now have all your content in one location',
            onClick: (dispatch, tutorial)=>{
                if(tutorial.isFirstTimeUser){
                    dispatch(showTooltip(tutorialPaths.mastheadTutorial));
                    saveAppData(dispatch, _appData, {
                        userdata: {
                            seenContentPageTutorial: true,
                            seenGroupsPageTutorial: true
                        }
                    });
                } else {
                    dispatch(hideTutorial());
                }
            }
        }
    },
    {
        menuFor: 'Groups',
        title: 'Members',
        subtitle: 'Groups',
        iconClass: 'groups',
        mapsTo: ['distinct-group-member-count', ['study-group-count', 'class-count']],
        route: routes.groupsPage.home,
        tutorial: {
            mapsTo: tutorialPaths.menuGroups,
            tooltipText: 'Follow, and track student progress in an even more convenient way!',
            onClick: (dispatch)=>{
                dispatch(showModal({ modalType: 'GroupCardDemoModal'}));
                dispatch(showTooltip(tutorialPaths.cardTitle));
            }
        }
    }
];

class ControlCenter extends Component {
    constructor(props) {
        super(props);
        _appData = this.props.appData
    }

    componentDidMount(){
        this.props.fetchCounts();
    }

    render() {
        const { counts, location, tutorial, dispatch } = this.props;

        return (
            <div className={`row row--fullWidth align-middle align-center ${controlCenter} controlCenter`}>
                <div className={`columns small-12`}>
                    <ControlCenterMenu menuItems={menuItems} counts={counts} location={location} tutorial={tutorial} dispatch={dispatch}/>
                </div>
            </div>
        );
    }
}

ControlCenter.propTypes = {
    counts: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    tutorial: PropTypes.object.isRequired
};


const mapStateToProps = (state) => {
    return {
        counts: state.counts,
        tutorial: state.tutorial
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        fetchCounts: () => {
            countsActions.fetchCounts(dispatch);
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ControlCenter);