import * as ActionTypes from './actionTypes.js';
import {getPracticeUrl} from '../utils/requireBridge';
import * as Services from '../services/services.js';

export const fetchPracticeHandleSuccess = (handle) => {
  return {
    type: ActionTypes.FETCH_PRACTICE_HANDLE_SUCCESS,
    payload: handle
  };
};

export const fetchAssessmentScoreSuccess = (handle,artifacts) => {
  return {
    type: ActionTypes.ASSESSMENT_FETCH_SUCCESS,
    payload: {handle,artifacts}
  };
};

export const fetchAssessmentScoreError = (error) => {
  return {
    type:ActionTypes.ASSESSMENT_FETCH_ERROR,
    payload: {error},
    error: true
  };
};

export const togglePracticeWidgetSuccess = (value) => {
  return {
    type: ActionTypes.TOGGLE_PRACTICE_WIDGET_SUCCESS,
    payload: {value}
  };
};

export const fetchPracticeUrlStart = () => {
  return {
    type: ActionTypes.FETCH_PRACTICE_URL_START
  };
};

export const fetchPracticeUrlSuccess = (url) => {
  return {
    type: ActionTypes.FETCH_PRACTICE_URL_SUCCESS,
    payload: {url}
  };
};

export const stoppedPracticeLoading = () =>{
  return {
    type: ActionTypes.STOP_PRACTICE_LOADING
  }
}

export const updatePracticeInfo = (modality) => {
  return {
    type: ActionTypes.UPDATE_PRACTICE_INFO,
    payload: {modality}
  };
}

export const fetchPracticeHandle = (handle) => {
  return (dispatch) => {
    Services.fetchPracticeHandle(handle).then( (response)=> {
      let practiceModality = (response || [])[0] ||{};
      dispatch(fetchPracticeHandleSuccess(practiceModality.handle));
    }, (err) => {
      console.log(err);
    });
  };
};

export const fetchAssessmentScore = (handle) => {
  return (dispatch) => {
    Services.fetchAssessmentScore(handle)
    .then( (artifact) => {
      dispatch(fetchAssessmentScoreSuccess(handle,artifact));
    },(err) => {
      dispatch(fetchAssessmentScoreError(err));
      dispatch(stopPracticeLoading());
    });
  };
};

export const togglePracticeWidget = (value) =>{
  return (dispatch) => {
    dispatch(togglePracticeWidgetSuccess(value));
  };
};

export const fetchPracticeUrl = (options) =>{
  return (dispatch) => {
    dispatch(fetchPracticeUrlStart());
    getPracticeUrl(options).done(url =>{
      dispatch(fetchPracticeUrlSuccess(url));
      dispatch(stopPracticeLoading());
    });
  };
};

export const stopPracticeLoading = () => {
  return (dispatch) => {
    dispatch(stoppedPracticeLoading());
  };
}