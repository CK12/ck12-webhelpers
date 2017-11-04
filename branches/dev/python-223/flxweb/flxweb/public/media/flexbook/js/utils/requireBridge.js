/*global requirejs */

// NOTE: This file will act as a temporary bridge between the react functionality and the older code.
// You can add methods here that'd require modules or utilities from the older code.



import * as constants from '../constants/constants';
import {formatHandle} from '../utils/utils';


import Promise from 'bluebird';



export const showSigninDialog = () => {
  if (window.requirejs){
    requirejs([constants.LOGINPOPUP], (loginPopup)=> {
      loginPopup.showLoginDialogue();
    });
  } else {
    console.log('!!!signin dialog prompted');
  }
};

let annotatorInstance = null;

export const enableAnnotation = (selector, artifactID, revisionID, isLoggedIn) =>{

  let dfd = window.$.Deferred();
  if(window.requirejs){
    requirejs([constants.ANNOTATIONS], (CK12Annotator)=>{
      if (annotatorInstance && annotatorInstance.destroy){
        annotatorInstance.destroy();
      }
      annotatorInstance = new CK12Annotator(selector, artifactID, revisionID, isLoggedIn);
      annotatorInstance.create();
      dfd.resolve();
    });
  }
  return dfd;
};
export const getAnnotator = ()=>{
  return annotatorInstance;
};

var shareWrapper = document.getElementById('sharePlaneWrapper'); //Can be done in more cooler way you know latter but.

window.optionsSharePlane = {
  planeContainerId: 'sharePlaneWrapper',
  shareData:{
    _ck12: true,
    context: 'Share this FlexBook® Textbook'
  }
};
var timeoutSharePlane = null;
var sharePlaneCallBack = function(){
  try{
    clearTimeout(timeoutSharePlane);
    window.loadSharePlane(window.optionsSharePlane);
    shareWrapper.className = 'row relative share-plane-container';
  }catch(e){
    shareWrapper.className = 'row relative share-plane-container hide'; //this goes with book load too.
    timeoutSharePlane = setTimeout(sharePlaneCallBack,500);
  }
};
sharePlaneCallBack();

export const showShareOPlaneDialog = (options) => {
  if(window.requirejs){
    let {coverImage: shareImageUrl, title, userSignedIn} = options;
    let branchName = formatHandle(title);
    requirejs([constants.SHAREOPLANE], (shareView)=> {
      var payload = {
        memberID : '2',
        page : 'browse'
      };
      var options = {
        'shareImage': shareImageUrl,
        'shareUrl': window.location.href,
        'shareTitle': branchName,
        'context': 'Share this Subject',
        'payload': payload,
        '_ck12': true,
        userSignedIn
      };
      shareView.open(options);
    });
  }else
    console.error('Please ensure the require module!!');
};

export const assignToClass = (title, artifactID) => {
  requirejs([constants.MODALITY_ASSIGN_LIB], (modalityLib) => {
    modalityLib.init({title, artifactID});
  });
};

export const readerDialog = (options = {}) => {
  requirejs([constants.READER_DIALOG], (reader) => {
    let Reader = new reader(options);
    Reader.revealModal();
  });
};

export const sendEmail = (email) => {
  requirejs([constants.EMAIL_SERVICES, 'jquery'], (EmailServices, $) => {
    EmailServices.sendTemplateEmail(email, 'app_link:fb').done(function () {
      $('.successpanel').removeClass('hide');
      $('.emailpanel').addClass('hide');
    }).fail(function () {
      alert('Sorry, sending the email failed. Please try again.');
    });
  });
};

export const triggerSoftReg = () => {
  requirejs([constants.SOFT_REGISTRATION_CONFIG], (SoftRegConfig) => {
    const EventType =  SoftRegConfig.EventType;
    const event = new CustomEvent(EventType.PAGE_ROUTE_CHANGE, {
      detail: {
        route : window.location.pathname,
        params:[]
      }
    });
    window.dispatchEvent(event);
    console.log('soft reg');
  });
};

export const requireModule = (module) => {
  return new Promise((resolve, reject)=> {
    requirejs(['main'], ()=>{
      requirejs([module], (moduleRef) => {
        resolve(moduleRef);
      }, (err)=> {
        reject(err);
      });
    });
  });
};

export const logADSEvent = (eventName,data) => {
  if (window._ck12) {
    _ck12.logEvent(eventName,data);
  }
}

export const getPracticeUrl = (options) => {
  return new Promise((resolve)=> {
    requirejs([constants.PRACTICE_BADGE], (practice) => {
      let url = practice.widgetPracticeUrlUtility(options);
      resolve(url);
    });
  });
};
