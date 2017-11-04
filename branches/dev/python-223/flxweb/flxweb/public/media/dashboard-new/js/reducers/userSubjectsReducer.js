import {
    FETCH_USER_SUBJECTS_SUCCESS,
    FETCH_USER_SUBJECTS_ERROR,
    SET_USER_SUBJECTS_SUCCESS,
    SET_USER_SUBJECTS_ERROR
} from 'actions/actionTypes';

const defaultState = { subjects: [] , subjectSuccess:null};

export default function userSubjectsReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_USER_SUBJECTS_SUCCESS:
            return Object.assign({}, state, {subjects: action.subjects,subjectSuccess:true});

        case SET_USER_SUBJECTS_SUCCESS:
            return Object.assign({}, state, {subjects: null}, {subjects: action.subjects,subjectSuccess:true });

        case FETCH_USER_SUBJECTS_ERROR:
        case SET_USER_SUBJECTS_ERROR:
        default:
            return state;
    }
}