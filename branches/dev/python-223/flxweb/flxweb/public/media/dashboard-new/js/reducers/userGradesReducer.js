import {
    FETCH_USER_GRADES_SUCCESS,
    FETCH_USER_GRADES_ERROR,
    SET_USER_GRADES_SUCCESS,
    SET_USER_GRADES_ERROR
} from 'actions/actionTypes';

const defaultState = { grades: [] };

export default function userSubjectsReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_USER_GRADES_SUCCESS:
            return Object.assign({}, state, {grades: action.grades });

        case SET_USER_GRADES_SUCCESS:
            return Object.assign({}, state, {grades: null}, {grades: action.grades });

        case FETCH_USER_GRADES_ERROR:
        case SET_USER_GRADES_ERROR:
        default:
            return state;
    }
}