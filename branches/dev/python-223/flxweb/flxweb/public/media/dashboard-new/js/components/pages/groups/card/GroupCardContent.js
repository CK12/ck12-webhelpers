import React from 'react';

import GroupAssignments  from 'containers/GroupAssignments';
import GroupSharedResources  from 'containers/GroupSharedResources';
import CardDefault from './CardDefault';
import CardNoAssignments from './CardNoAssignments';
import CardNoMembers from './CardNoMembers';

function getStudyGroupContent(group) {
    const { membersCount, IS_DEFAULT } = group;

    if(IS_DEFAULT){
        return CardDefault;
    } else if(membersCount <= 1){
        return CardNoMembers;
    } else {
        return GroupSharedResources;
    }
}

function getClassContent(group) {
    const { membersCount, totalAssignmentsCount, IS_DEFAULT } = group;
    if(IS_DEFAULT){
        return CardDefault;
    } else if(membersCount <= 1){
        return CardNoMembers;
    } else if (!totalAssignmentsCount) {
        return CardNoAssignments;
    } else {
        return GroupAssignments;
    }
}

function getCardContent(group){
    const { groupType } = group;
    if(groupType === 'study'){
        return getStudyGroupContent(group)
    } else {
        return getClassContent(group);
    }
}

const GroupCardContent = ({group, dispatch, tutorial, groupsAssignments}) => {
    const Content = getCardContent(group);
    return (
        <Content group={group} dispatch={dispatch} tutorial={tutorial} groupsAssignments={groupsAssignments} />
    );
};


export default GroupCardContent;