import { includes, chunk, flatten } from 'lodash';

export const ASSIGN            = 'assign';
export const ASSIGNMENT_DELETE = 'assignment-delete';
export const ASSIGNMENT_EDIT   = 'assignment-edit';
export const UNASSIGN          = 'unassign';
export const CHANGE_DUE_DATE   = 'change-due-date';
export const JOIN              = 'join';
export const LEAVE             = 'leave';
export const CREATE            = 'create';
export const PH_ANSWER         = 'ph-answer';
export const PH_COMMENT        = 'ph-comment';
export const PH_QUESTION       = 'ph-question';
export const SHARE             = 'share';

export const menuTypes = {
    assignments: 'assignments',
    members: 'members',
    shared: 'shared',
    'q&a': 'q&a'
};

export const activityTypes = {
    [ASSIGN]: {
        action: 'assigned',
        type: menuTypes.assignments
    },
    [ASSIGNMENT_DELETE]: {
        action: 'deleted',
        type: menuTypes.assignments
    },
    [ASSIGNMENT_EDIT]: {
        action: 'edited',
        type: menuTypes.assignments
    },
    [UNASSIGN]: {
        action: 'unassigned',
        type: menuTypes.assignments
    },
    [CHANGE_DUE_DATE]: {
        action: 'changed the due date to',
        type: menuTypes.assignments
    },
    [JOIN]: {
        action: 'joined',
        type: menuTypes.members
    },
    [LEAVE]: {
        action: 'left',
        type: menuTypes.members
    },
    [CREATE]: {
        action: 'created',
        type: menuTypes.members
    },
    [PH_ANSWER]: {
        action: 'answered',
        type: menuTypes['q&a']
    },
    [PH_COMMENT]: {
        action: 'commented',
        type: menuTypes['q&a']
    },
    [PH_QUESTION]: {
        action:'asked',
        type: menuTypes['q&a']
    },
    [SHARE]: {
        action:'shared',
        type: menuTypes.shared
    }
};

export function isPeerhelp({activityType}){
    return /^ph-/.test(activityType);
}

export function isShare({activityType}){
    return activityType === SHARE;
}

export function isChangeDueDate({activityType}){
    return activityType === CHANGE_DUE_DATE;
}

export function isAssignment({activityType}){
    const assignmentTypes = [ASSIGN, ASSIGNMENT_DELETE,  ASSIGNMENT_EDIT, UNASSIGN];
    return includes(assignmentTypes, activityType);
}

export function isJoin({activityType}){
    return activityType === JOIN;
}

export function isLeave({activityType}){
    return activityType === LEAVE;
}

export function isCreate({activityType}){
    return activityType === CREATE;
}

export function sortByActivityType(activities){
    var types      = {},
        _menuTypes = Object.keys(menuTypes);

    _menuTypes.reduce( (prev, current) => {
        prev[current] = [];
        return prev;
    }, types);

    activities.activity.forEach( activity => {
        const { activityType } = activity;
        try {
            types[ activityTypes[activityType].type ].push(activity); // Sometimes activity types are blank
        } catch (e) { console.error(e); }
    });

    _menuTypes.reduce( (prev, current) => {
        prev[current] = chunk(prev[current], 2);
        return prev;
    }, types);

    return types;
}

export function getNewActivityCounts(sortedActivities){
    var counts = {};

    Object.keys(sortedActivities).reduce( (prev, current) => {
        prev[current] = flatten(sortedActivities[current]).length;
        return prev;
    }, counts);

    return counts;
}