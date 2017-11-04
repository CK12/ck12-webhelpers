
//import { createSelector } from 'reselect';
import {getSubjectByEID} from 'ck12-subjects';
import flxwebSubjectInfo from '../config/subjectInfo';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* Collection Selectors */
export const getCollectionTitle = (state) => {
	if (state.collectionInfo.loaded && 'title' in state.collectionInfo.collection) 
		return state.collectionInfo.collection.title;
	else if (state.flexbookInfo.loaded && 'collectionHandle' in state.flexbookInfo) 
		return capitalizeFirstLetter(state.flexbookInfo.collectionHandle);
  else
    return undefined;
}

export const getCollectionDescription = (state) => {
  if (state.collectionInfo.loaded && 'description' in state.collectionInfo.collection) 
    return state.collectionInfo.collection.description;
  else
    return "";
}

export const getCollectionSubject = (state) => {
  var subjectCode = false;
  if(state.collectionInfo.loaded && 'parentSubjectID' in state.collectionInfo.collection)
  {
  	subjectCode = state.collectionInfo.collection.parentSubjectID;
  }
  else if (state.flexbookInfo.loaded && !state.flexbookInfo.error)
  {
  	var books = state.flexbookInfo.books
  	for(var i = 0; i < books.length; i++)
    { 
      if ('domain' in books[i] && books[i].domain && 'encodedID' in books[i].domain) 
      {
        subjectCode = books[i].domain.encodedID;
        break;
      }
    }
  }
  let subject = subjectCode ? getSubjectByEID(subjectCode) : false;
  if (subject)
  {
    return {
      name:subject.title,
      url:`/${subject.handle}/`
    };
  }
  return {
      name:"",
      url:""
    }
};

export const isCollectionLoaded = (state) => state.collectionInfo.loaded;

export const isCollectionNonEmpty = (state) => {
  return (state.collectionInfo.loaded && 
          !state.collectionInfo.error && 
          (Object.keys(state.collectionInfo.collection).length !== 0))
}

export const getCollection = (state) => state.collectionInfo.collection || {};

/* Flexbook Selectors */
export const getFlexbooks = (state, filter) => {
  if (filter == 'levelBasic') return state.flexbookInfo.levelBasic || {};
  else if (filter == 'levelAtGrade') return state.flexbookInfo.levelAtGrade || {};
  else if (filter == 'levelAdvanced') return state.flexbookInfo.levelAdvanced || {};
  else if (filter == 'languageEnglish') return state.flexbookInfo.languageEnglish || {};
  else if (filter == 'languageSpanish') return state.flexbookInfo.languageSpanish || {};
  else if (filter == 'highSchool') return state.flexbookInfo.highSchool || {};
  else if (filter == 'middleSchool') return state.flexbookInfo.middleSchool || {};
  else if (filter == "showLevels") return state.flexbookInfo.showLevels;
  else if (filter == "showLanguages") return state.flexbookInfo.showLanguages;		
  else if (filter == "showSchoolTabs") return state.flexbookInfo.showSchoolTabs;		
  else return state.flexbookInfo.books || {};
};

export const getFlexbookHandle = (state) => state.flexbookInfo.collectionHandle;

export const isFlexbookLoaded = (state) => state.flexbookInfo.loaded;

export const isFlexbookNonEmpty = (state) => {
  return (state.flexbookInfo.loaded && 
          !state.flexbookInfo.error && 
          (Object.keys(state.flexbookInfo.books).length !== 0))
}

/* Subject Selectors */
export const getSubjectLinks = (state, filter) => {
  var collectionHandle = getHandle(state).toLowerCase()
  var subject = getCollectionSubject(state).name.toLowerCase()
  if (subject in flxwebSubjectInfo && collectionHandle in flxwebSubjectInfo[subject].branches)
  {
    const subjectInfo = flxwebSubjectInfo[subject].branches[collectionHandle]  
    if (filter == 'simsURL') return subjectInfo.simsURL;
    else if (filter == 'plixURL') return subjectInfo.plixURL;
    else if (filter == 'studyguideURL') return subjectInfo.studyguideURL;
    else if (filter == 'cbseURL') return subjectInfo.cbseURL;
    else if (filter == 'conceptMapURL') return subjectInfo.conceptMapURL;
    
    else if (filter == "showOnLandingPage") return subjectInfo.showOnLandingPage;
    else if (filter == "showSubjectsFilter") return subjectInfo.showSubjectsFilter;    
    else if (filter == "showDifficultyFilter") return subjectInfo.showDifficultyFilter;  
    else if (filter == "showHSMSTabs") return subjectInfo.showHSMSTabs    
  }
};

/* Miscellaneous Selectors */
export const isCollectionAndFlexbookLoaded = (state) => {
	if (state.flexbookInfo.loaded && state.collectionInfo.loaded) 
    return true;
	return false;
}

export const errorCollectionAndFlexbook = (state) => {
  if (state.flexbookInfo.loaded && state.collectionInfo.loaded && state.flexbookInfo.error && state.collectionInfo.error) 
    return true;
  return false
}

export const getHandle = (state) => {
  if (state.collectionInfo.loaded && Object.keys(state.collectionInfo.collection).length != 0) 
    return state.collectionInfo.collection.handle
  if (state.flexbookInfo.loaded) 
    return state.flexbookInfo.collectionHandle;
  return false;
}

export const isLocationFound = (state) => state.locationInfo.locationFound;

export const getLocation = (state) => state.locationInfo.location;

export const isAuthFound = (state) => state.authInfo.authFound;

export const isTeacher = (state) => {
  if (state.authInfo.authFound && 'roles' in state.authInfo.auth)
    for (var i = 0; i < state.authInfo.auth.roles.length; i++)
    {
      if (state.authInfo.auth.roles[i].id == 5) return true
    };
  return false
}

export const getAuth = (state) => state.authInfo.auth;

