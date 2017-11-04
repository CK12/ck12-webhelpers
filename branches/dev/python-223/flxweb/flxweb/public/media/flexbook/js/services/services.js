//import {Promise} from 'bluebird';
import ck12ajax from 'ck12-ajax';
import * as constants from '../constants/constants';
import {formatHandle} from '../utils/utils';


let options = { url: '/ajax_modality_config/', responseType:'text'};
ck12ajax(options).then( (response) => {
  constants.CK12MODALITY = Object.freeze(JSON.parse(response));
  return null; //http://bluebirdjs.com/docs/warning-explanations.html
});

export const assignToClass = () => {

};

export const getLoggedInUser = () => {
  let url = '/flx/get/info/my';
  return ck12ajax({url});
};

export const fetchGroups = () => {
  let url = '/flx/group/my?pageSize=0';
  return ck12ajax({url});
};

export const shareToGroups = (data) => {
  let url = '/flx/group/share';
  return ck12ajax({url, data, method: 'post'});
};

export const addRevisionToLibrary = (objectID) => {
  let url = '/flx/add/mylib/object?objectID='+objectID+'&objectType=artifactRevision';
  return ck12ajax({url}).then((response) =>{
    return response;
  });
};

export const fetchFeaturedModalities = (data) => {
  let {conceptName, collectionCreatorID, conceptCollectionHandle} = data;
  let url = '/flx/featured-modals/domainHandleOrEncodedID=' + conceptName + '?considerModalitiesOfTypes=lecture,asmtpractice,enrichment,simulationint,simulation,PLIX&includeResources=true';
  if(collectionCreatorID && conceptCollectionHandle)
  {
    url+= '&collectionCreatorID=' + collectionCreatorID +'&conceptCollectionHandle=' + conceptCollectionHandle;
  }
  return ck12ajax({url}).then( (response) => {
    let [key] = Object.keys(response);
    return response;
  });
};
//@ajit need clearity with the passing parameters
export const fetchAssessmentScore = (practiceHandle) => {
  let url = `/assessment/api/get/info/test/practice/${practiceHandle}?adaptive=true&checkFreeAttempts=True&checkUserLogin=true&spacedSchedule=True`;
  //TODO remove temporarily ?adaptive=true&checkUserLogin=false&checkFreeAttempts=true&spacedSchedule=true
  return ck12ajax({url}).then( (response) => {
    let [key] = Object.keys(response);
    return response[key];
  });
};

export const fetchPracticeHandle = (handle) => {
  let url = '/flx/get/featured/modalities/asmtpractice/'+ handle;
  return ck12ajax({url}).then( (response) => {
    let [key] = Object.keys(response);
    return response[key];
  });
};

export const generatePDFRevision = (info) => {
  let url =  window.location.origin + '/render/pdf/status/' +  info['id']+ '/' + info['revision'] + '/onecolumn/?artifacturl='+ window.location.href;
  return ck12ajax({url, responseType:'text'}).then( (response) => {
    return response;
  });
};

export const fetchColloborationDetails = (artifactID) => {
  let url = `/flx/get/editing/group/${artifactID}`;
  return ck12ajax({url}).then( (response) => {
    return response;
  });
};

export const fetchSectionAssigneeDetails = (artifactID) => {
  let url = `/flx/check/editing/authority/for/${artifactID}`;
  return ck12ajax({url}).then( (response) => {
    return response;
  });
};

export const fetchSummaryDetails = (artifactID) => {
  let url = `/flx/get/artifactsummary/${artifactID}`;
  return ck12ajax({url}).then( (response) => {
    return response;
  });
}