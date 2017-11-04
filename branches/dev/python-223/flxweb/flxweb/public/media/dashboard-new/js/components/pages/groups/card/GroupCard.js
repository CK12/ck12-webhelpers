import React, {PropTypes} from 'react';
import { connect } from 'react-redux';

import QueueableComponent from 'components/base/QueueableComponent';

import { fetchGroupActivity, markGroupActivityViewed } from 'actions/groupsActivitiesActions';
import { fetchQACounts } from 'actions/peerhelpActions';

import GroupCardHeader from './GroupCardHeader';
import GroupCardMenu from './GroupCardMenu';
import GroupCardActivities from './GroupCardActivities';
import GroupCardContent from './GroupCardContent';
import GroupCardContentOverlay from './GroupCardContentOverlay';

import { sortByActivityType, getNewActivityCounts } from 'utils/groupActivity';

import styles from 'scss/components/GroupCard';

class GroupCard extends QueueableComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeMenu: null,
            preload: true
        };

        this.onActivityCountClick = this.onActivityCountClick.bind(this);
        this.onActivityCountClose = this.onActivityCountClose.bind(this);
        this.preload = this.preload.bind(this);
    }

    preload(state=false){
        this.queue.addPromise((resolve)=>{
            this.setState(Object.assign({}, this.state, {
                preload: state
            }), resolve);
        });
    }

    componentDidMount(){
        super.componentDidMount();

        const { fetchGroupActivity, fetchQACounts, group: {id, IS_DEFAULT } } = this.props;
        if(IS_DEFAULT){ return; }
        fetchGroupActivity(id)
            .then(()=>this.queue.add(setTimeout(this.preload, 1000)));

        fetchQACounts(id);
    }

    componentWillUnmount(){
        super.componentWillUnmount();
    }

    onActivityCountClick(menuItem){
        this.setState(Object.assign({}, this.state, {
            activeMenu: menuItem
        }));
    }

    onActivityCountClose(){
        this.setState(Object.assign({}, this.state, {
            activeMenu: null
        }));
    }

    getActiveMenu(){
        return this.state.activeMenu;
    }

    hasActivity(){
        const { groupsActivitites, group: {id} } = this.props;
        return groupsActivitites.hasOwnProperty(id);
    }

    getActivities(){
        const { groupsActivitites, group: {id} } = this.props;
        return groupsActivitites[id];
    }

    render() {
        const { group, user, dispatch, tutorial, groupsAssignments, markGroupActivityViewed, peerhelp } = this.props;
        const hasActivity = this.hasActivity();
        const activities = hasActivity ? sortByActivityType(this.getActivities()) : null;
        const newCounts = activities ? getNewActivityCounts(activities) : null;
        const activeMenu = this.getActiveMenu();

        const activityClass = hasActivity && activeMenu ? styles.hasActivity : '';
        const preload       = this.state.preload ? 'preload' : '';
        const showForMedium  = group.groupType === 'study' ? 'show-for-medium' : ''; //Not showing right content for study group in mobile view.
        return (
            <div className={`columns small-12`}>
                <div className={`row align-center`}>
                    <div className={`columns small-12 ${styles.groupCard}`}>
                        <GroupCardContentOverlay group={group} />

                        <div className={`row`}>

                            <div className={`column small-12 medium-8 ${styles.sectionLeftContent} ${activityClass} ${preload}`}>
                                <GroupCardHeader group={group} tutorial={tutorial} dispatch={dispatch} />
                                <GroupCardMenu group={group} counts={newCounts} peerhelp={peerhelp} activeMenu={activeMenu} onClick={this.onActivityCountClick} isActivityOpen={!!(hasActivity && activeMenu)} dispatch={dispatch} tutorial={tutorial} />
                                { hasActivity ? <GroupCardActivities
                                        group={group}
                                        user={user}
                                        activities={activities}
                                        activeMenu={activeMenu}
                                        onClick={this.onActivityCountClose}
                                        markGroupActivityViewed={markGroupActivityViewed}
                                        dispatch={dispatch}
                                        tutorial={tutorial}
                                    /> : null }
                            </div>

                            <div className={`column small-12 medium-4 ${styles.sectionRightContent} ${showForMedium}`}>
                                <GroupCardContent group={group} dispatch={dispatch} tutorial={tutorial} groupsAssignments={groupsAssignments} />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

GroupCard.propTypes = {
    group: PropTypes.object.isRequired,
    groupsActivitites: PropTypes.object.isRequired,
    groupsAssignments: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    tutorial: PropTypes.object.isRequired,
    peerhelp: PropTypes.object.isRequired
};


const mapStateToProps = (state) => {
    return {
        groupsActivitites: state.groupsActivitites,
        groupsAssignments: state.groupsAssignments,
        tutorial: state.tutorial,
        peerhelp: state.peerhelp
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        fetchGroupActivity: (groupID) => {
            return fetchGroupActivity(groupID, dispatch);
        },
        fetchQACounts: (groupID) => {
            return fetchQACounts(groupID, dispatch);
        },
        markGroupActivityViewed: (groupID, activityIDs) => {
            return markGroupActivityViewed(groupID, activityIDs, dispatch);
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupCard);