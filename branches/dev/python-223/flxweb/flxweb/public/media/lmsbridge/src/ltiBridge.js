/* jshint esversion: 6 */

"use strict";
/**
 *  LTI Bridge, interface between LTI like integrations and CK-12
 *
 */

import LMSBridge from 'lmsBridge';
import {buildLTILaunchURL, buildLTIContentReturnURL, resetLTIAppContext} from './utils/lti';
import {getAppInfo} from './utils/lms';

export default class LTIBridge extends LMSBridge{

  /**
   *
   */
  constructor(config) {
    // Timestamp diff cannot be greater than
    // localstorage_expriry_time in minutes;
    let localstorage_expriry_time = 30;
    // Get default config
    if (!config){
        config = getAppInfo('ltiAppInfo', localstorage_expriry_time);
    }
    let {appID, appName, lms_name, lms_groupID, provider, content_return_url="", launch_url="", launch_key="", api_server_url=""} = config;
    super(config);
    this.appID = appID;
    this.appName = appName;
    this.lms_name = lms_name;
    this.lms_groupID = lms_groupID;
    this.lms_provider = provider;
    this.utm_campaign = "";
    this.content_return_url = content_return_url;
    this.launch_url = launch_url;
    this.launch_key = launch_key;
    this.api_server_url = api_server_url;
  }

  getConceptAssignLaunchUrlParams(assignmentID){
      let concept_url_params = {
        assignmentID: assignmentID,
        lmsgroupID: this.lms_groupID
      };
      return concept_url_params;
  }

  getEmbedAssignLaunchUrlParams(assignmentID){
      // Include the ltiInfo.context_id to track origin of assignment 
      let url_params = {
          assignmentID: assignmentID,
          lmsgroupID: this.lms_groupID,
      };
      return url_params;
  }

  getPlixAssignLaunchUrlParams(assignmentID, url){
      let url_params = {
          assignmentID: assignmentID,
          lmsgroupID: this.lms_groupID,
	  plixUrl: url
      };
      return url_params;
  }

  getSimmulationAssignLaunchUrlParams(assignmentID, url){
      let url_params = {
          assignmentID: assignmentID,
          lmsgroupID: this.lms_groupID,
	  simsUrl: url
      };
      return url_params;
  }
  getLaunchURL(url_params){
      let launch_url = '';
      // If the lms has an issue with long launch urls, we can just use the assignmentID
      // Add the lms name to assignmentID_launch_url in the config 
      //if (this.lms_name === "schoology"){
      //    url_params.modalityURI = data.uri;
      //    url_params.artifactID = data.artifactID;
      //}
      launch_url = buildLTILaunchURL(url_params);
      return launch_url;
  }

  onCreateAssignmentSuccess(assignmentID, assignType, title, artifactID="", uri="", eid=""){
      console.log(`The assignment ID:${assignmentID} `);
      let url_params = '';
      let  content_return_url = '';
      if (assignType === 'concept'){
          url_params = this.getConceptAssignLaunchUrlParams(assignmentID);
      } else if (assignType === 'modality'){
          url_params = this.getEmbedAssignLaunchUrlParams(assignmentID);
      } else if (assignType ==='simulationint') {
          url_params = this.getSimmulationAssignLaunchUrlParams(assignmentID, uri);
      } else if (assignType ==='plix') {
          url_params = this.getPlixAssignLaunchUrlParams(assignmentID, uri);
      } else {
        //TODO: Throw a unknow assignment type error
        console.log(`Unknown assignment type: ${assignType}`);
      }
      let launch_url = this.getLaunchURL(url_params);
      //buildLTIContentReturnURL(ltiLaunchURL, returnUrl, title)
      content_return_url = buildLTIContentReturnURL(launch_url, this.content_return_url, title);
      if (content_return_url){
	  resetLTIAppContext();
          console.log(`redirecting to: ${content_return_url}`);
          window.location = content_return_url;
      } else {
          //TODO: Add functionality for resource selection popup
          //showResourceSelectionModal(launchURL.url(),lms_name);
          console.log("Your lms does not support content passback");
      }
  }

}

