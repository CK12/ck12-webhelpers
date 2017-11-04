import React, {PropTypes } from 'react';
import { Promise } from 'bluebird';
import { size, first } from 'lodash';

import { connect } from 'react-redux';

import QueueableComponent from 'components/base/QueueableComponent';
import GroupsTopRow from 'components/pages/groups/GroupsTopRow';
import GroupsCards from 'components/pages/groups/GroupsCards';
import GroupsPagination from 'components/pages/groups/GroupsPagination';
import Loader from 'components/Loader';

import styles from 'scss/components/GroupsPage';
import routes from 'routes';

import * as groupsActions from 'actions/groupsActions';
import * as groupsFilterActions from 'actions/groupsFilterActions';
import { hideTutorial } from 'actions/tutorialActions';
import { setActiveHeader } from 'externals';
import { hasSeenPageTutorial, showTutorial } from 'utils/tutorial';
import convertGroupsFilterToString from 'utils/groupFilter';
import { showModal } from 'actions/modalActions';

class GroupsPage extends QueueableComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isLoading: false
        };

        this.setLoading = this.setLoading.bind(this);
    }

    setLoading(state=false){
        return this.queue.addPromise((resolve)=>{
            this.setState(
                Object.assign({}, this.state, {
                    isLoading: state
                }),
                resolve
            );
        });
    }

    getGroups(){
        const { fetchGroups, groups, groupsFilter } = this.props;
        const startLoading = this.setLoading(true);
        const _fetchGroups = ()=>this.queue.add(fetchGroups(groups, convertGroupsFilterToString(groupsFilter)));
        const stopLoading  = ()=>this.setLoading();

        startLoading
            .then(_fetchGroups)
            .then(stopLoading);
    }

    componentDidMount(){
        super.componentDidMount();

        this.getGroups();

        const { dispatch ,groups,location, history } = this.props;
        const {router} = this.context;
        this.queue.add(
    	        setTimeout(()=>{setActiveHeader("Groups")},10), // line added to update active header groups
    	        setTimeout(()=>{
    	        	if(location.hash && location.hash.match(/\w+/)[0] === "create"){
    	        		dispatch(showModal({
    	        			modalType: 'CreateGroupModal',
    	                    modalProps: {}
    	        		}));
    	        	}
    	        },500),
    	        setTimeout(()=>{
    	        	if(!hasSeenPageTutorial(this.props)){
    	                showTutorial(this.props);
    	            } else {
    	                dispatch(hideTutorial());
    	            }
    	        },2000),
    	        setTimeout(()=>{
    	        	//reset history to absolute group
    	        	router.replace({
		                pathname: routes.groupsPage.home,
		                query: {}

		            });

    	        },2200)
        );

        document.title = groups.title;
    }

    componentWillUnmount(){
        super.componentWillUnmount();
    }

    render() {
        const { dispatch, groups, groupsFilter, user, setGroupsFilter, paginateGroups } = this.props;
        const { isLoading } = this.state;

        if( isLoading ) {
            return (
                <div className={`row row--fullWidth ${styles.page} align-middle align-center`}>
                    <div className={`row`}>
                        <div className={`column shrink ${styles.loader}`}>
                            <Loader />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`row row--fullWidth ${styles.page} small-up-1`}>
                <GroupsTopRow dispatch={dispatch} groupsFilter={groupsFilter} onFilterClick={setGroupsFilter} isLoading={isLoading} />
                <GroupsCards groups={groups} user={user} />
                <GroupsPagination groups={groups} paginateGroups={paginateGroups} groupsFilter={groupsFilter} />
            </div>
        );
    }
}

GroupsPage.propTypes = {
    groups: PropTypes.object.isRequired,
    groupsFilter: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    tutorial: PropTypes.object.isRequired,
    appData: PropTypes.object.isRequired
};
GroupsPage.contextTypes = {
	router: React.PropTypes.object.isRequired
}
const mapStateToProps = (state) => {
    return {
        groups: state.groups,
        groupsFilter: state.groupsFilter,
        user: state.user,
        tutorial: state.tutorial,
        appData: state.appData
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        fetchGroups: ({groups}, groupsFilter) => {
            if(groups.length > 1){ return new Promise( res => res() ); } // Don't fetch if we already have groups
            return groupsActions.fetchGroupsWithFilter(groupsFilter, dispatch);
        },
        paginateGroups: (groupsFilter) => {
            return groupsActions.paginateGroups(groupsFilter, dispatch);
        },
        setGroupsFilter: (groupsFilter) => dispatch(groupsFilterActions.setGroupsFilter(groupsFilter))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupsPage);
