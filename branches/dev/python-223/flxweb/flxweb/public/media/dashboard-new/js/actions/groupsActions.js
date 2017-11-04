import { groupsService } from 'services';
import { hideModal} from 'actions/modalActions';
import { Promise } from 'bluebird';
import {
    GET_GROUPS,
    ADD_GROUP,
    FETCH_GROUPS_SUCCESS,
    FETCH_GROUPS_ERROR,
    JOIN_GROUP_SUCCESS,
    JOIN_GROUP_ERROR,
    FETCH_GROUPS_PAGINATION_SUCCESS,
    FETCH_GROUPS_PAGINATION_ERROR
} from 'actions/actionTypes';
import {
    showMessageText
} from 'actions/messageTextActions';
export function getGroups() {
    return { type: GET_GROUPS  };
}

export function joinGroup({accessCode},dispatch) {
    return groupsService.joinGroup({accessCode})
    .then(groups => {
        dispatch({ type: JOIN_GROUP_SUCCESS })
        dispatch(hideModal());
        dispatch(showMessageText({
            messageType: 'success',
            message: groups.message || 'You successfully joined new group!'
        }));
        if(!groups.message){
            return groupsService.getGroups()
            .then(groups =>
                dispatch({ type: FETCH_GROUPS_SUCCESS, groups })
            )
            .catch(() =>
                dispatch({ type: FETCH_GROUPS_ERROR })
            );
        }
    })
    .catch((res) => {
    	  dispatch({ type: JOIN_GROUP_ERROR })
          dispatch(showMessageText({
              messageType: 'error',
              message: res.message  || 'Error in joining new group!'
          }));
    });
}

export function addGroup(group, role='groupadmin') {
    return { type: ADD_GROUP, group, role };
}

export function fetchGroups(dispatch){
    return groupsService.getGroups()
        .then(groups =>
            dispatch({ type: FETCH_GROUPS_SUCCESS, groups })
        )
        .catch(() =>
            dispatch({ type: FETCH_GROUPS_ERROR })
        );
}

export function paginateGroups(groupsFilter, dispatch){
    return groupsService.getGroupsWithFilter(groupsFilter)
        .then(groups =>
            dispatch({ type: FETCH_GROUPS_PAGINATION_SUCCESS, groups })
        )
        .catch(()=>
            dispatch({ type: FETCH_GROUPS_PAGINATION_ERROR })
        );
}

export function fetchGroupsWithFilter(filter, dispatch){
    return groupsService.getGroupsWithFilter(filter)
        .then(groups =>
            dispatch({ type: FETCH_GROUPS_SUCCESS, groups })
        )
        .catch(() =>
            dispatch({ type: FETCH_GROUPS_ERROR })
        );
}
