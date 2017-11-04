import * as ActionTypes from './actionTypes.js';
import * as Services from '../services/services.js';
import * as ArtifactServices from '../services/artifact.js';
import {getAnnotator} from '../utils/requireBridge';

export const changeVocabularyLanguage = (language) => {
  return {
    type: ActionTypes.CHANGE_VOCABULARY_LANGUAGE,
    payload: {language}
  };
};

export const addRevisionToLibrarySuccess = (artifact) => {
  return {
    type: ActionTypes.ADD_TO_LIBRARY_SUCCESS,
    payload: {artifact}
  };
};

export const addRevisionToLibraryError = (error) => {
  return {
    type: ActionTypes.ADD_TO_LIBRARY_ERROR,
    payload: {error},
    error: true
  };
};

export const libraryFlexBooksFetchStart = () => {
  return {
    type: ActionTypes.BOOKS_LIST_FETCH_START
  };
};

export const libraryFlexBooksFetchSuccess = (fetchedBooks, totalBookCount) => {
  return {
    type: ActionTypes.BOOKS_LIST_FETCH_SUCCESS,
    payload: {
      books: fetchedBooks,
      total: totalBookCount
    }
  };
};

export const libraryFlexBooksFetchError = (errorInfo) => {
  return {
    type: ActionTypes.BOOKS_LIST_FETCH_ERROR,
    payload: {
      errorInfo
    }
  };
};

export const fetchStandardsSuccess = (data) => {
  return {
    type: ActionTypes.FETCH_STANDARDS_SUCCESS,
    payload: {...data}
  };
};

export const fetchStandardSuccess = (response) => {
  return {
    type: ActionTypes.FETCH_STANDARD_SUCCESS,
    payload: response
  };
};

export const publishSuccess = (response) => {
  return {
    type: ActionTypes.PUBLISH_SUCCESS,
    payload: response
  };
};

export const clearStandard = () => {
  return {
    type: ActionTypes.CLEAR_STANDARD
  };
};

export const displayStandards = () => {
  return {
    type: ActionTypes.SHOW_STANDARDS
  };
};

export const flexBookSaveStart = (bookTitle) => {
  return {
    type: ActionTypes.FLEXBOOK_SAVE_START,
    payload: {
      bookTitle
    }
  };
};

export const flexBookSaveSuccess = (flexbook) => {
  return {
    type: ActionTypes.FLEXBOOK_SAVE_SUCCESS,
    payload: {
      flexbook
    }
  };
};

export const flexBookSaveError = (errorInfo) => {
  return {
    type: ActionTypes.FLEXBOOK_SAVE_ERROR,
    payload: {
      errorInfo
    }
  };
};

export const addToFlexBookStart = (flexbook) => {
  return {
    type: ActionTypes.ADDTOFLEXBOOK_START,
    payload: {
      flexbook
    }
  };
};

export const addToFlexBookSuccess = (artifact) => {
  return {
    type: ActionTypes.ADDTOFLEXBOOK_SUCCESS,
    payload: {
      artifact
    }
  };
};

export const addToFlexBookError = (errorInfo) => {
  return {
    type: ActionTypes.ADDTOFLEXBOOK_ERROR,
    payload: {
      errorInfo
    },
    error: true
  };
};

export const generatePDFRevisionStart = () => {
  return {
    type: ActionTypes.GENERATE_PDF_START
  };
};

export const generatePDFRevisionSuccess = (data) => {
  return {
    type: ActionTypes.GENERATE_PDF_SUCCESS,
    payload: data
  };
};

export const generatePDFRevisionError = (error) => {
  return {
    type: ActionTypes.GENERATE_PDF_ERROR,
    payload: error
  };
};

export const addRevisionToLibrary = (artifact) => {
  let {artifactRevisionID} = artifact;
  return (dispatch) => {
    dispatch(addRevisionToLibrarySuccess(artifact));
    Services.addRevisionToLibrary(artifactRevisionID)
    .then( (artifactID) => {
      //dispatch(addRevisionToLibrarySuccess(artifact));
    },(err) => {
      dispatch(addRevisionToLibraryError(err));
    });
  };
};

export const generatePDFRevision = (artifactInfo) => {
  return (dispatch) => {
    dispatch(generatePDFRevisionStart());
    Services.generatePDFRevision(artifactInfo)
    .then( (data) => {
      dispatch(generatePDFRevisionSuccess(data));
    },(err) => {
      dispatch(generatePDFRevisionError(err));
    });
  };
};

export const loadAnnotation = ()=>{
  return (dispatch) =>{
    if(getAnnotator()){
      getAnnotator().annotationsPromise.done(data =>{
        dispatch({
          type: ActionTypes.ANNOTATIONS_LOADED,
          annotations: data
        });
      });
    }
  };
};

export const setAnnotationLoaded = () =>{
  return (dispatch) =>{
    dispatch({
      type: ActionTypes.ANNOTATION_SET_LOADED
    });
  };
};

export const initAddToFlexBook = (start) => {
  return (dispatch) => {
    dispatch(libraryFlexBooksFetchStart()); // Check if the total is greater than stored state total
    ArtifactServices.fetchLibraryFlexBooks(start)
    .then( (artifact) => {
      let books = artifact.artifacts;
      let total = artifact.total;
      dispatch(libraryFlexBooksFetchSuccess(books, total));
    })
    .catch((err) => {
      dispatch(libraryFlexBooksFetchError(err));
    });
  };
};

export const saveFlexBook = (flexBook) => {
  return (dispatch) => {
    dispatch(flexBookSaveStart(flexBook.title));
    ArtifactServices.assembleFlexBook(flexBook)
    .then( (savedFlexBook) => {
      dispatch(flexBookSaveSuccess(savedFlexBook));
    })
    .catch( (err) => {
      dispatch(flexBookSaveError(err));
    });
  };
};

export const showStandards = () =>{
  return(dispatch) => {
    dispatch(displayStandards());
  };
};

export const fetchStandards = (artifactID) => {
  return (dispatch) => {
    ArtifactServices.fetchStandards(artifactID)
    .then((response) => {
      dispatch(fetchStandardsSuccess({response, artifactID}));
    });
  };
};

export const fetchStandard = (url) => {
  return (dispatch) => {
    dispatch(clearStandard());
    ArtifactServices.fetchStandard(url)
    .then((response)=>{
      dispatch(fetchStandardSuccess(response));
    });
  };
};

export const publish = (data) => {
  return (dispatch) => {
    ArtifactServices.publish(data)
    .then((response)=>{
      dispatch(publishSuccess(response));
    }).catch( (err) => {
      console.log(err);
    });
  };
};

export const addToFlexBook = (artifactToAdd,flexbook) => {
  return (dispatch) => {
    let {title} = flexbook;
    dispatch(addToFlexBookStart(flexbook));
    ArtifactServices.addToFlexBook(artifactToAdd,flexbook)
    .then((response)=>{
      let {artifact} = response;
      dispatch(addToFlexBookSuccess({...artifact, title}));
    }).catch( (err) => {
      dispatch(addToFlexBookError(err));
    });
  };
};

export const fetchColloborationDetailsSuccess = (group,userID) =>{
  return {
    type: ActionTypes.FETCH_COLLOBORATION_DETAILS_SUCCESS,
    payload: {
      group,
      userID
    }
  };
};

export const fetchColloborationDetailsStart = (group,userID) =>{
  return {
    type: ActionTypes.FETCH_COLLOBORATION_DETAILS_START
  };
};

export const fetchColloborationDetails = (artifactID, userID) => {
  return (dispatch) => {
    dispatch(fetchColloborationDetailsStart());
    Services.fetchColloborationDetails(artifactID)
    .then((response)=>{
      dispatch(fetchColloborationDetailsSuccess(response.group,userID));
    }).catch( (err) => {
      dispatch(fetchColloborationDetailsSuccess(err,userID));
    });
  };
};

export const fetchSectionAssigneeDetailsStart = () =>{
  return {
    type: ActionTypes.FETCH_SECTION_ASSIGNEE_DETAILS_START
  };
};

export const fetchSectionAssigneeDetailsSuccess = (response) =>{
  return {
    type: ActionTypes.FETCH_SECTION_ASSIGNEE_DETAILS_SUCCESS,
    payload: response
  };
};

export const fetchSectionAssigneeDetails = (artifactID) => {
  return (dispatch) => {
    dispatch(fetchSectionAssigneeDetailsStart());
    Services.fetchSectionAssigneeDetails(artifactID)
    .then((response)=>{
      dispatch(fetchSectionAssigneeDetailsSuccess(response));
    }).catch( (err) => {
      dispatch(fetchSectionAssigneeDetailsSuccess(err));
    });
  };
};

export const fetchSummarySuccess = (data) => {
  return {
    type: ActionTypes.FETCH_SUMMARY_SUCCESS,
    payload: {data}
  }
};

export const fetchSummaryFailure = () => {
  return {
    type: ActionTypes.FETCH_SUMMARY_ERROR
  }
};

export const fetchSummaryDetails = (artifactID) =>{
  return (dispatch) => {
    Services.fetchSummaryDetails(artifactID)
    .then( (data) => {
      dispatch(fetchSummarySuccess(data));
    },(err) => {
      dispatch(fetchSummaryFailure());
    });
  };
};
