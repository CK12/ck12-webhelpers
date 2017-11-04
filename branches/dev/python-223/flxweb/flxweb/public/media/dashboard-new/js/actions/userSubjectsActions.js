import { userService } from 'services';

import {
    FETCH_USER_SUBJECTS_SUCCESS,
    FETCH_USER_SUBJECTS_ERROR,
    SET_USER_SUBJECTS_SUCCESS,
    SET_USER_SUBJECTS_ERROR
} from 'actions/actionTypes';

export function fetchUserSubjects(dispatch){
    return userService.getUserSubjects()
        .then(res =>
            dispatch({
                type: FETCH_USER_SUBJECTS_SUCCESS,
                subjects: res.result
            })
        )
        .catch(() =>
            dispatch({ type: FETCH_USER_SUBJECTS_ERROR })
        );
}

export function setUserSubjects(subjects, dispatch){
    return userService.updateUserSubjects(subjects)
        .then(res =>
            dispatch({
                type: SET_USER_SUBJECTS_SUCCESS,
                subjects: res.result
            })
        )
        .catch(() =>
            dispatch({ type: SET_USER_SUBJECTS_ERROR })
        );
}