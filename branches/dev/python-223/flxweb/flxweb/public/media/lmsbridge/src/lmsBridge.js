/* jshint esversion: 6 */

"use strict";
/**
 *  LMS Bridge, interface between third party lms like integrations and CK-12
 *
 */

import URLHelper from 'urlHelper';
import EmbedHelper from 'embedHelper';
import ModalView from 'modalView';
//import {assign} from './services/lmsbridge.services';
import {createAssignment, submitLMSScore} from './services/lmsbridge.services';
//import {buildLTILaunchURL} from './utils/lti';

const dexter_clientID = 24839961;
export default class LMSBridge {

  /**
   *
   */
  constructor(config) {
    let {appID, appName, lms_name, lms_groupID, provider, launch_url="", launch_key="", api_server_url=""} = config;
    this.appID = appID;
    this.appName = appName;
    this.lms_name = lms_name;
    this.lms_groupID = lms_groupID;
    this.lms_provider = provider;
    this.launch_url = launch_url;
    this.utm_campaign = "";
    this.dexterjs = "";
    this.launch_key = launch_key;
    this.api_server_url = api_server_url;
  }

  /*initializeDexter(){
      this.dexterjs = window.dexterjs({
          memberID: window.ads_userid,
          clientID: dexter_clientID,
          mixins: {
              appID: this.appID,
              lmsProvider: this.lms_provider
          }
      });
  }*/

   showMessage(msg, callback, showCloseButton=false){
       return ModalView.alert(msg,callback, showCloseButton);
   }

  /**
   * Callback for create Assignment API. Override this method for your handler
   *
   */
  onCreateAssignmentSuccess(assignmentID, assignType, title, artifactID="", uri="", eid=""){
       console.log("[super] onCreateAssignmentSuccess callback");
  }

  onCreateAssignmentError(error){
    //alert("Failed to create assignment. Please try again later.");
    this.showMessage("Failed to create assignment. Please try again later.");
    console.log(error);
  }
  onAssignInteractive(data){
      let that = this;
            createAssignment(
                    data.concepts,
                    null,
                    this.lms_groupID,
                    null,
                    data.title,
                    null,
                    '' + Math.round(Math.random()*320000) + '_' + (Number(new Date())),
                    this.launch_key,
                    this.appID,
		    this.api_server_url
                ).then(function(response){
                    if (response.error){
                      return that.onCreateAssignmentError(response.payload);
                    }
                    that.onCreateAssignmentSuccess(response.assignment.assignmentID,
                         data.mtype,
                         data.title,
                         data.artifactID,
                         data.uri, "");
                }, function(){
                    alert("Failed to create assignment");
                });
  }
  onAssignModality(data){
      let that = this;
            createAssignment(
                    data.concepts,
                    data.artifactID,
                    this.lms_groupID,
                    null,
                    data.title,
                    null,
                    '' + Math.round(Math.random()*320000) + '_' + (Number(new Date())),
                    this.launch_key,//appUrl.search_params.launch_key
                    this.appID,
		    this.api_server_url
                ).then(function(response){
                    if (response.error){
                      return that.onCreateAssignmentError(response.payload);
                    }
                    that.onCreateAssignmentSuccess(response.assignment.assignmentID,
                        'modality',
                         title,
                         data.artifactID,
                         data.uri, "");
                }, function(){
                    alert("Failed to create assignment");
                });
  }
  onAssignConcept(assignData) {
      let that = this;
      if (this.lms_provider === "lti"){
          createAssignment(
              assignData.current_concept.concepts,
              assignData.current_concept.eid,
              this.lms_groupID,
              null,
              assignData.current_concept.title,
              null,
              assignData.current_concept.handle + '_' + (Number(new Date())),
              this.launch_key,//appUrl.search_params.launch_key
              this.appID,
	      this.api_server_url
          ).then(function(response){
              if (response.error){
                return that.onCreateAssignmentError(response.payload);
              }
              that.onCreateAssignmentSuccess(response.assignment.assignmentID,
                  'concept',
                   assignData.current_concept.title,
                   "",
                   "", assignData.current_concept.eid);
          }, function(){
              //_c.showMessage("Failed to create assignment. Please try again later.");
              alert("Failed to create assignment. Please try again later.");
          });
      }
  }

  buildUrlForModality(url){
      var newUrl = url.split("&backUrl")[0];

      if(newUrl.indexOf("?") > 0){
	  return newUrl + "&noReturn=true";
      }else{
	  return newUrl + "?noReturn=true";
      }
  }

  getContextURL(context="", context_url=""){
      var topURL = context_url || window.location.href.substring((window.location.protocol + '//' + window.location.hostname).length);
      if (context === 'plix' || context === 'simulationint'){
          topURL = this.buildUrlForModality(topURL);
      }
      return topURL;
  }

  getStudyTrackConcepts(artifact_or_encoded_ID, contextURL, conceptCollectionHandle="", collectionCreatorID=3){
      let context_url = encodeURIComponent(contextURL);
      let concepts = `${artifact_or_encoded_ID}|${context_url}`;
      if (conceptCollectionHandle){
          concepts += `|${conceptCollectionHandle}|${collectionCreatorID}`;
      }
      return concepts;
  }

  setEmbedURI(embedURI, provider) {
      let embedParams = "&utm_source=viewer&utm_medium=embed&utm_campaign=LTIApp"; // FOR GA CAMPAIGN
      //console.log(url);
      // check if embedURI is http or https
      if (embedURI.substr(0,5)[4] === ":") {
          embedURI = "https" + embedURI.substr(4);
      }
      // add additional params
      embedURI += "&app_context="+provider;
      embedURI += embedParams;
      return embedURI;
  }

  setCurrentConcept(eid, title, handle){
    let concept = {};
    concept.eid = String(eid);
    concept.title = title;
    concept.handle = handle;
    return concept;
  }

  onAssignAction(assignData) {
      console.log("[onAssignAction] Assign action triggered");
      console.dir(assignData);
      this.showMessage("Creating assignment",'',true);
      let encodedID = assignData.domaineid? assignData.domaineid : null;
      let artifactID = assignData.artifactID ? assignData.artifactID : null;
      let embedURI, url = null;
      // Log ADS Event
      let create_assignment_payload = {'desc': 'create_assignment', 'artifactID': artifactID};
      if (encodedID) {
          create_assignment_payload.context_eid = encodedID;
      }
      window.dexterjs.logEvent('FBS_USER_ACTION', create_assignment_payload);
      if (assignData.mtype !== 'plix' && assignData.mtype !== 'simulationint') {
          embedURI = EmbedHelper.getModalityEmbedUrl({
                                        modality_type: assignData.mtype,
                                        modality_handle: assignData.handle,
                                        modality_realm: assignData.realm,
                                        nochrome: true,
                                        hideConceptLink: true
                                    });
          url = new URLHelper(embedURI);
      }
      // For asmtquiz and asmtpractice use assign concept
      if (assignData.mtype =="asmtquiz"){
          let current_concept = this.setCurrentConcept(artifactID, assignData.title, url.hash_params.handle);
	  let context_url = this.getContextURL();
	  current_concept.concepts = this.getStudyTrackConcepts(artifactID, context_url, assignData.conceptCollectionHandle, assignData.collectionCreatorID);
          this.onAssignConcept({current_concept: current_concept});
      } else if (assignData.mtype == "asmtpractice"){
          let current_concept = this.setCurrentConcept(encodedID, assignData.title, url.hash_params.handle);
	  let context_url = this.getContextURL();
	  current_concept.concepts = this.getStudyTrackConcepts(encodedID, context_url, assignData.conceptCollectionHandle, assignData.collectionCreatorID);
          this.onAssignConcept({current_concept: current_concept});
      } else if (assignData.mtype === "plix"){
          let url = this.getContextURL('plix', assignData.context_url);
          assignData.uri = url;
	  assignData.concepts = this.getStudyTrackConcepts(artifactID, url);
          this.onAssignInteractive(assignData);
      } else if (assignData.mtype === "simulationint"){
          let url = this.getContextURL('simulationint', assignData.context_url);
          assignData.uri = url;
	  assignData.concepts = this.getStudyTrackConcepts(artifactID, url);
          this.onAssignInteractive(assignData);
      } else {
          // Else assign modality
          embedURI = this.setEmbedURI(embedURI, this.lms_provider);
          assignData.uri = embedURI;
	  let context_url = this.getContextURL();
	  assignData.concepts = this.getStudyTrackConcepts(artifactID, context_url, assignData.conceptCollectionHandle, assignData.collectionCreatorID);
          this.onAssignModality(assignData);
      }
  }
 submitLMSScore(assignmentID, score, artifactID, callback) {
     let that = this;
     submitLMSScore(
	     assignmentID,
	     score,
	     this.launch_key,
	     this.lms_groupID,
	     artifactID,
	     this.appID,
	     this.api_server_url,
	     this.lms_provider
     ).then(function(response){
         if (response.error){
	     //that.showMessage("Could not turn in assignment, please try again later.");
             return callback("Could not turn in assignment, please try again later.");
         }
	 return callback(null,"Assignment turned in");
	 //that.showMessage("Assignment turned in", true);
    }, function(e){
	     //that.showMessage("Could not turn in assignment, please try again later.");
	    console.log(String(e));
	    return callback("Could not turn in assignment, please try again later.");
    });
 }

 /**
  * Handler for post message assignment creation
  *
  * @param other_window {window obj} - reference to the window making the postmessage
  */
 postMessageAssign(other_window){
     //this.showMessage("Use the 'Create Assignment' button in the opened window to add the modality to your lms",null,true);
     let that = this;
     try {
	window.addEventListener('message', function(event) {
	    console.log("Received post message");
	    if (event.origin !== window.origin && event.origin.slice(-8) !== window.origin.slice(-8)) {
		    return;
	    }
	    other_window.close();
	    that.onAssignAction(JSON.parse(event.data));
	});
     } catch(e) {
         console.log("Error on create assignment via postmessage:" + String(e));
     }
 }

 /**
  * Send artifact details used to create assignment via post message
  *
  * @param other_window {window obj} - reference to the window making the postmessage
  * @param data {obj} - assignment artifact details
  */
 postMessageSendAssignment(other_window, data){
     try {
	console.log("Received post message");
        other_window.postMessage(JSON.stringify(data),"*");
     } catch(e) {
         console.log("Error sending assignment details via postmessage:" + String(e));
     }
 }
}
