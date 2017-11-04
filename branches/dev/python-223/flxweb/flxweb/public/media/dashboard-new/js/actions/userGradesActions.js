import { userService } from 'services';

import {
    FETCH_USER_GRADES_SUCCESS,
    FETCH_USER_GRADES_ERROR,
    SET_USER_GRADES_SUCCESS,
    SET_USER_GRADES_ERROR
} from 'actions/actionTypes';

import { isArray } from 'lodash';

export function fetchUserGrades(dispatch){
    return userService.getUserGrades()
        .then(res =>
            dispatch({
                type: FETCH_USER_GRADES_SUCCESS,
                grades: res.result
            })
        )
        .catch(() =>
            dispatch({ type: FETCH_USER_GRADES_ERROR })
        );
}

export function setUserGrades(gradeIDs, dispatch){

    if(isArray(gradeIDs)){
        gradeIDs = gradeIDs.join(',');
    }

    return userService.updateUserGrades({gradeIDs})
        .then(res =>
            dispatch({
                type: SET_USER_GRADES_SUCCESS,
                grades: res.result
            })
        )
        .catch(() =>
            dispatch({ type: SET_USER_GRADES_ERROR })
        );
}