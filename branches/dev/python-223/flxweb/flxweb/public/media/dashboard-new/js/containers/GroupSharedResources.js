import React, {PropTypes } from 'react';
import { connect } from 'react-redux';

import QueueableComponent from 'components/base/QueueableComponent';
import Loader from 'components/Loader';

import { fetchSharedResources } from 'actions/groupsSharedResourcesActions';
import CardSharedResources from 'components/pages/groups/card/CardSharedResources';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

class GroupSharedResources extends QueueableComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true
        };

        this.hideLoader = this.hideLoader.bind(this);
    }

    componentDidMount(){
        super.componentDidMount();
        const { group: {id} } = this.props;
        const hasActivity = this.hasActivity();

        if(hasActivity){ this.hideLoader(); }

        this.props.fetchSharedResources(id)
            .then(()=> {
                if(!hasActivity){ this.hideLoader(); }
            });
    }

    componentWillUnmount(){
        super.componentWillUnmount();
    }

    hideLoader(){
        return this.queue.addPromise((resolve)=>{
            this.setState(Object.assign({}, this.state, {
                isLoading: false
            }), resolve);
        });
    }

    hasActivity(){
        const {group, groupsSharedResources} =  this.props;
        return groupsSharedResources.hasOwnProperty(group.id) && !!groupsSharedResources[group.id].activity.length;
    }

    render() {
        const {group, groupsSharedResources} =  this.props;

        // When fetching resources
        if(this.state.isLoading){
            return (
                <div className={`row align-center align-middle`} style={{height: '100%'}}>
                    <div className="column shrink">
                        <Loader/>
                    </div>
                </div>
            );
        }

        // When we have resources
        if(this.hasActivity()){
            const { activity } = groupsSharedResources[group.id];
            const { total } = groupsSharedResources[group.id];
            return <CardSharedResources groupId = {group.id}  total = {total} activities={activity} group={group} />;
        } else {
            return <NoResources group={group} />;
        }

    }
}

GroupSharedResources.propTypes = {
    groupsSharedResources: PropTypes.object.isRequired
};


const mapStateToProps = (state) => {
    return {
        groupsSharedResources: state.groupsSharedResources
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchSharedResources: (groupID) => {
            return fetchSharedResources(groupID, dispatch);
        }
    };
};

const NoResources = ({group}) => {
    const url = replacePlaceholder(routes.group.resources, group.id);
    return (
        <div className={`row align-center align-middle text-center`}>
            <div className={`column small-10`}>
                {(!group.resourcesCount) ? <h6>No shared resources yet.</h6> : <h6>No recently shared resources.</h6>}
                <p>
                    Find out how to share to your study group.
                </p>
                <a href={url} className="button expanded dxtrack-user-action" data-dx-desc={"Learn how to share resources"}>Learn how</a>
            </div>
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupSharedResources);