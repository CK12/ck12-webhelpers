import {
  PDF_DOWNLOAD_INFO_FETCH_START,
  PDF_DOWNLOAD_INFO_FETCH_SUCCESS,
  PDF_DOWNLOAD_INFO_FETCH_ERROR,
  PDF_DOWNLOAD_INFO_SUBMIT_START,
  PDF_DOWNLOAD_INFO_SUBMIT_SUCCESS,
  PDF_DOWNLOAD_INFO_SUBMIT_ERROR,
  SET_LOCATION
} from '../actions/actionTypes';

const defaultState = {
  loaded: false,
  infoSubmitted: false,
  pdfDownloadInfo: {
    grades: '',
    subjects: '',
    school: '',
    noOfUsers: 0,
    artifactID: 0
  }
}
export const PDFDownloadInfo = (state = defaultState, action) => {
  let {payload, type:actionType} = action
  if(actionType === PDF_DOWNLOAD_INFO_FETCH_START)
  {
    return defaultState;
  }
  
  if ( 
    actionType === PDF_DOWNLOAD_INFO_FETCH_SUCCESS || 
    actionType === PDF_DOWNLOAD_INFO_SUBMIT_SUCCESS
  ) {
    return {
      loaded: true,
      ...payload
    };
  }

  //in the event of API error, proceed with the download, no need to penalize user.
  if ( 
    actionType === PDF_DOWNLOAD_INFO_FETCH_ERROR || 
    actionType === PDF_DOWNLOAD_INFO_SUBMIT_ERROR
  ) {
    return {
      loaded: true,
      infoSubmitted: true,
      pdfDownloadInfo: {}
    };
  }

  return state;
}