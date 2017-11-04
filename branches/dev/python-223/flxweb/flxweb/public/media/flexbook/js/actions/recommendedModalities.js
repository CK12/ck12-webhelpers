import * as ActionTypes from './actionTypes.js';
import * as Services from '../services/services.js';
import {updatePracticeInfo} from './practice.js';

const fetchRecommendedModalities = () => {
  return {
    type: ActionTypes.RECOMMENDED_MODALITIES_FETCH
  }
};

const fetchRecommendedModalitiesSuccess = (conceptName,artifacts) => {
  return {
    type: ActionTypes.RECOMMENDED_MODALITIES_FETCH_SUCCESS,
    payload: {conceptName,artifacts}
  };
};

const fetchRecommendedModalitiesError = (error) => {
  return {
    type: ActionTypes.RECOMMENDED_MODALITIES_FETCH_ERROR,
    payload: {error},
    error: true
  };
};

export const fetchFeaturedModalities = (data) => {
  return (dispatch) => {
    dispatch(fetchRecommendedModalities());
    Services.fetchFeaturedModalities(data)
    .then( (response) => {
      let {conceptName} = data;
      let artifacts = response.featuredModalities ? response.featuredModalities:[];
      dispatch(fetchRecommendedModalitiesSuccess(conceptName,artifacts));
      dispatch(updateFeaturedModalities(artifacts));
    },(err) => {
      dispatch(fetchRecommendedModalitiesError(err));
    });
  };
};

export const updateFeaturedModalities = (modalities=[]) => {
  return (dispatch) => {
    let practiceModality = modalities.find((modality)=>modality.type.name=='asmtpractice');
    dispatch(updatePracticeInfo(practiceModality));
  }
}
