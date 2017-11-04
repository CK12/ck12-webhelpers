import {combineReducers} from 'redux';
import standardOptions from './standardReducer';
import subjectOptions from './subjectReducer';
import gradeOptions from './gradeReducer';

export const appReducers = combineReducers({
    standardOptions,
    subjectOptions,
    gradeOptions
});
