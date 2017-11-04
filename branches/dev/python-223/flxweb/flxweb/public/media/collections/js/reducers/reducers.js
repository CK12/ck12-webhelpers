import { collectionInfo } from './collectionInfo';
import { flexbookInfo } from './flexbookInfo';
import { locationInfo } from './locationInfo';
import { authInfo } from './authInfo';
import { combineReducers } from 'redux';
import { lmsInfo } from './lmsInfo';

export const createReducer = () => {
  return combineReducers({
    collectionInfo,
    flexbookInfo,
    locationInfo,
    authInfo,
    lmsInfo
  });
};

export default createReducer;
