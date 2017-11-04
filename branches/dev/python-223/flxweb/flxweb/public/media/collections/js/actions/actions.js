import * as Services from '../services/collectionServices.js';
import {processCollectionResponse, processFlexbookResponse} from '../utils/collectionUtils';

export const sampleAction = () => {
  return {
    type: 'COLLECTION_INIT',
    payload: {}
  };
};

export const removeHiphens = (str) => {
  return str.replace(/-|_/g, ' ');
};

export const extractInfoFromUrl = () => {
  var collectionHandle,login;
  var separators = ['#', '/'];
  var urlComponants = window.location.href.split(new RegExp(separators.join('|'), 'g'));
  const hostIndex = urlComponants.indexOf(window.location.host);
  if (urlComponants.length >= hostIndex + 3) {
    login = urlComponants[hostIndex + 2];
    if (urlComponants[hostIndex + 1] == 'c') {
      if ((login.substring(0,5) == 'user:') && urlComponants.length >= hostIndex + 4) {
        login = login.substring(5);
        collectionHandle = urlComponants[hostIndex + 3];
      }
      else if (urlComponants.length >= hostIndex + 3) {
        login = '3';
        collectionHandle = urlComponants[hostIndex + 2];
      }
      else {
        return false;
      }
    } else {
      return false;
    }
  }
  return {collectionHandle: collectionHandle, login: login};
};

/* Get Collection */
export const collectionInfoFetchStart = () => ({type: 'COLLECTION_FETCH_START'});

export const collectionInfoSuccess = (data) => {
  return {
    type: 'COLLECTION_FETCH_SUCCESS',
    payload:processCollectionResponse(data)
  };
};

export const collectionInfoError = (error) => {
  return ({type:'COLLECTION_FETCH_ERROR', isError:true, payload:{error}});
};

export const getCollectionInfo = () => {
  const fromUrl = extractInfoFromUrl();
  if (fromUrl)
    return (dispatch) => {
      dispatch(collectionInfoFetchStart());
      Services.getCollection(fromUrl.collectionHandle, fromUrl.login)
    .then((info) => dispatch(collectionInfoSuccess(info)))
    .catch((error)=> dispatch(collectionInfoError(error)));
    };
  return (dispatch) => {dispatch(collectionInfoError('invalid URL'));};
};

/* get Flexbooks */
export const flexbookFetchStart = () => ({type: 'FLEXBOOK_FETCH_START'});

export const flexbookSuccess = (data) => {
  return {
    type: 'FLEXBOOK_FETCH_SUCCESS',
    payload:processFlexbookResponse(data)
  };
};

export const flexbookError = (error) => {
  console.log(error);
  return ({type:'FLEXBOOK_FETCH_ERROR', isError:true, payload:{error}});
};

export const getFlexbookInfo = () => {
  const fromUrl = extractInfoFromUrl();
  if (fromUrl) {
    return (dispatch) => {
      dispatch(flexbookFetchStart());
      Services.getFlexbooks(removeHiphens(fromUrl.collectionHandle))
    .then((info) => dispatch(flexbookSuccess(info)))
    .catch((error)=> dispatch(flexbookError(error)));
    };
  }
  return (dispatch) => {dispatch(flexbookError('invalid URL'));};
};

/* get Location */
export const locationFetchStart = () => ({type: 'LOCATION_FETCH_START'});

export const locationSuccess = (data) => {
  return {
    type: 'LOCATION_FETCH_SUCCESS',
    payload: data
  };
};

export const locationError = (error) => {
  return ({type:'LOCATION_FETCH_ERROR', isError:true, payload:{error}});
};

export const getLocationInfo = () => {
  return (dispatch) => {
    dispatch(locationFetchStart());
    Services.getLocation()
    .then((info) => dispatch(locationSuccess(info)))
    .catch((error)=> dispatch(locationError(error)));
  };
};

/* get Auth Info */
export const authFetchStart = () => ({type: 'AUTH_FETCH_START'});

export const authSuccess = (data) => {
  return {
    type: 'AUTH_FETCH_SUCCESS',
    payload: data
  };
};

export const authError = (error) => {
  return ({type:'AUTH_FETCH_ERROR', isError:true, payload:{error}});
};

export const getAuthInfo = () => {
  return (dispatch) => {
    dispatch(authFetchStart());
    Services.getAuth()
    .then((info) => dispatch(authSuccess(info)))
    .catch((error)=> dispatch(authError(error)));
  };
};

export const ltiContext = () => {
  return {
    type:'LTI_CONTEXT_DETECTED',
    isError: false
  };
};

export const getLMSContext = () => {
  return (dispatch) => {
    if(window.lmsContext === 'lti-app'){
      dispatch(ltiContext());
    }
  };
};
