import React from 'react';
import CardAssignments from './CardAssignments';
import styles from 'scss/components/GroupCard';

import { showModal } from 'actions/modalActions';

function hasAssignments(group, groupsAssignments){
    return !!groupsAssignments[group.id];
}

const CardDefault = ({group, dispatch, tutorial, groupsAssignments}) => {
    const onClick = ()=> {
        dispatch(showModal({
            modalType: 'CreateGroupModal',
            modalProps: ''
        }));
    }

    if(hasAssignments(group, groupsAssignments)){
        const { assignments } = groupsAssignments[group.id];
        return <CardAssignments group={group} assignments={assignments} dispatch={dispatch} tutorial={tutorial} />;
    }

    return (
        <div className={`row align-center align-middle text-center`}>
            <div className={`column small-10`}>
                <i className={`dashboard-icon-chat-bubble ${styles.noAssignments}`}></i>
                <h6>This is a demo card</h6>
                <p>
                    Please create your first group to get started!
                </p>
                <button className="button expanded dxtrack-user-action" onClick={onClick} data-dx-desc={"Open create group modal"}>Create Group</button>
            </div>
        </div>
    );
};

export default CardDefault;