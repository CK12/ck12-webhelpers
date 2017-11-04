import { subjectsService } from 'services';

import {
    GET_SUBJECTS,
    FETCH_SUBJECTS_SUCCESS,
    FETCH_SUBJECTS_ERROR
} from 'actions/actionTypes';

export function getSubjects() {
    return { type: GET_SUBJECTS };
}

export function fetchSubjects(dispatch){
    subjectsService.getSubjects()
        .then(subjects =>
            dispatch({ type: FETCH_SUBJECTS_SUCCESS, subjects })
        )
        .catch(() =>
            dispatch({ type: FETCH_SUBJECTS_ERROR })
        );
}

