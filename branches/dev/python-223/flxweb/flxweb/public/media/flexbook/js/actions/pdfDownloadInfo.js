import {
  fetchPDFDownloadInfo as fetch, 
  submitPDFDonloadInfo as submit
} from '../services/artifact'

import {
  PDF_DOWNLOAD_INFO_FETCH_START,
  PDF_DOWNLOAD_INFO_FETCH_SUCCESS,
  PDF_DOWNLOAD_INFO_FETCH_ERROR,
  PDF_DOWNLOAD_INFO_SUBMIT_START,
  PDF_DOWNLOAD_INFO_SUBMIT_SUCCESS,
  PDF_DOWNLOAD_INFO_SUBMIT_ERROR,
  SET_LOCATION
} from '../actions/actionTypes';

export const fetchStart = () => {
  return {
    type: 'PDF_DOWNLOAD_INFO_FETCH_START'
  }
}

export const fetchSuccess = (pdfDownloadInfo) => {
  let infoSubmitted = !!(pdfDownloadInfo);
  return {
    type: PDF_DOWNLOAD_INFO_FETCH_SUCCESS,
    payload: {
      loaded: true,
      infoSubmitted,
      pdfDownloadInfo
    }
  }
}

export const fetchError = () => {
  return {
    type: PDF_DOWNLOAD_INFO_FETCH_ERROR
  }
}

export const submitStart = () => {
  return {
    type: PDF_DOWNLOAD_INFO_SUBMIT_START
  }
}

export const submitSuccess = (pdfDownloadInfo) => {
  let infoSubmitted = !!(pdfDownloadInfo);
  return {
    type: PDF_DOWNLOAD_INFO_SUBMIT_SUCCESS,
    payload: {
      loaded: true,
      infoSubmitted,
      pdfDownloadInfo
    }
  }
}

export const submitError = () => {
  return {
    type: PDF_DOWNLOAD_INFO_SUBMIT_ERROR
  }
}

export const fetchPDFDownloadInfo = (artifactID) => {
  return (dispatch) => {
    dispatch(fetchStart())
    fetch(artifactID).then((data)=> {
      let info = data.pdfDownlaodInfo[0];
      dispatch(fetchSuccess(info))
    }).catch((e)=>{
      console.log(e);
      dispatch(fetchError())
    })
  }
}

export const submitPDFDownloadInfo = (info) => {
  
  return (dispatch) => {
    console.log('in submitPDFDownloadInfo:dispatching', info)
    dispatch(submitStart())
    submit(info).then((data)=>{
      let info = data.pdfDownlaodInfo;
      dispatch(submitSuccess(info))
    }).catch(()=>{
      dispatch(submitError())
    })
  }
}