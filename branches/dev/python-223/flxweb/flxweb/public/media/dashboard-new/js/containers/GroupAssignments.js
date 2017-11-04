import React, {PropTypes } from 'react';
import { connect } from 'react-redux';
import { Promise } from 'bluebird';

import QueueableComponent from 'components/base/QueueableComponent';
import Loader from 'components/Loader';

import { fetchGroupAssignments } from 'actions/groupsAssignmentsActions';
import CardAssignments from 'components/pages/groups/card/CardAssignments';

class GroupAssignments extends QueueableComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true
        };

        this.hideLoader = this.hideLoader.bind(this);
        this.hasAssignments = this.hasAssignments.bind(this);
    }

    componentDidMount(){
        super.componentDidMount();
        const { group: {id} } = this.props;
        const hasAssignments = this.hasAssignments();

        // Show the assignments instantly
        if(hasAssignments){ this.hideLoader(); }

        this.props.fetchAssignments(id)
            .then(()=> {
                if(!hasAssignments){ this.hideLoader(); }
            });
    }

    componentWillUnmount(){
        super.componentWillUnmount();
    }

    hasAssignments(){
        const { group: {id}, groupsAssignments } = this.props;
        return groupsAssignments.hasOwnProperty(id);
    }

    hideLoader(){
        return this.queue.addPromise((resolve)=>{
            this.setState(Object.assign({}, this.state, {
                isLoading: false
            }), resolve);
        });
    }

    render() {
        const {group, groupsAssignments, dispatch, tutorial} =  this.props;

        // When fetching assignments
        if(this.state.isLoading){
            return (
                <div className={`row align-center align-middle`} style={{height: '100%'}}>
                    <div className="column shrink">
                        <Loader/>
                    </div>
                </div>
            );
        }

        // When we have assignments
        if(this.hasAssignments()){
            const { assignments } = groupsAssignments[group.id];
            return <CardAssignments group={group} assignments={assignments} dispatch={dispatch} tutorial={tutorial} />;
        }

        return (
            <div className="row align-center align-middle text-center">
                <div className="column small-10">
                    <i className="icon-notification"></i>
                    <p>You are not an admin of this group</p>
                </div>
            </div>
        );
    }
}

GroupAssignments.propTypes = {
    groupsAssignments: PropTypes.object.isRequired,
    tutorial: PropTypes.object.isRequired
};


const mapStateToProps = (state) => {
    return {
        groupsAssignments: state.groupsAssignments,
        tutorial: state.tutorial
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchAssignments: (groupID) => {
            return fetchGroupAssignments(groupID, dispatch);
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupAssignments);