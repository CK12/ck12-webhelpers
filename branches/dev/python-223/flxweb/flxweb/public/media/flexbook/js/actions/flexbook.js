import * as ActionTypes from './actionTypes.js';
import * as ArtifactServices from '../services/artifact.js';
import {parseUpdatedTime} from '../utils/utils';
import {transformer} from 'eleven';

const fetchBookSuccess = (bookArtifact) => {
  return {
    type: ActionTypes.BOOK_FETCH_SUCCESS,
    payload: { artifact: bookArtifact }
  };
};

const fetchBookError = (error) => {
  return {
    type: ActionTypes.BOOK_FETCH_ERROR,
    payload : { error },
    error:true
  };
};

const fetchDetailsStart = () => {
  return {
    type: ActionTypes.DETAILS_FETCH_START
  };
};

const fetchDetailsSuccess = (artifactID, response) => {
  return {
    type: ActionTypes.DETAILS_FETCH_SUCCESS,
    payload: { artifactID, ...response }
  };
};

const fetchDetailsError = (revisionID, error) => {
  return {
    type: ActionTypes.DETAILS_FETCH_ERROR,
    payload: { revisionID, error },
    error: true
  };
};

const fetchBookWOCacheSuccess = (locationInfo) => {
  return {
    type: ActionTypes.BOOK_FETCH_WO_CACHE_SUCCESS,
    payload: {locationInfo}
  };
};

const fetchDraftStart = () => {
  return {
    type: ActionTypes.DRAFT_FETCH_START
  };
};

const fetchDraftError = () => {
  return {
    type: ActionTypes.DRAFT_FETCH_ERROR
  };
};

export const fetchBook = (locationInfo, isCache = true) => {
  return (dispatch) => {
    ArtifactServices.fetchBook(locationInfo, isCache)
    .then( (bookArtifact) => {
      if(!isCache)
      {
        let {updatedTime, revisions} = bookArtifact;
        updatedTime = parseUpdatedTime(updatedTime);
        locationInfo = {...locationInfo, updatedTime, revisionInfo: revisions[0]};
        dispatch(fetchBookWOCacheSuccess(locationInfo));  
      }
      dispatch(fetchBookSuccess(bookArtifact));
      return null;
    },(err) => {
      dispatch(fetchBookError(err));
      throw err; //TODO: don't throw error
    });
  };
};

export const fetchBookWOCache = (locationInfo) => {
  return (dispatch) => {
    let {artifactCreator} = locationInfo;
    if(artifactCreator)
    {
      dispatch(fetchBook(locationInfo,false));      
    }
    else
    {
      ArtifactServices.fetchBookWOCache(locationInfo)
      .then( (bookArtifact) => {
        let {updatedTime, revisions} = bookArtifact;
        updatedTime = parseUpdatedTime(updatedTime);
        locationInfo = {...locationInfo, updatedTime, revisionInfo: revisions[0]};
        dispatch(fetchBookWOCacheSuccess(locationInfo));
        dispatch(fetchBook(locationInfo));
        return null;
      },(err) => {
        dispatch(fetchBookError(err));
      });
    }
  };
}

export const fetchDraft = (revisionID, isCustomFlexBook) => {
  return (dispatch) => {
    dispatch(fetchDraftStart());
    ArtifactServices.fetchDraft(revisionID)
    .then( (artifact) => {
      let draft = transformer(artifact);
      dispatch(fetchDetailsSuccess(revisionID, draft.artifact) );
      return null;
    },(err) => {
      dispatch(fetchDetails(revisionID, !isCustomFlexBook));
      dispatch(fetchDraftError());
    });
  };
};

export const fetchDetails = (revisionID, isCache) => {
  return (dispatch) => {
    dispatch(fetchDetailsStart());
    ArtifactServices.fetchArtifact(revisionID, isCache)
    .then( (response) => {
      let artifact = response;
      if(response.draft)
      {
        artifact = transformer(response).artifact;
      }
      dispatch( fetchDetailsSuccess(revisionID, artifact) );
    }, (err) => {
      dispatch( fetchDetailsError(revisionID, err) );
    });
  };
};
