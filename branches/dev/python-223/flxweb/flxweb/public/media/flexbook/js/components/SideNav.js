import React, {Component} from 'react';
import {connect} from 'react-redux';
import SideNavRow from '../components/SideNavRow';
import {  sideNavigationList, 
          checkResourceAttach, 
          checkRevisionAdded,
          customizeArtifactLink, 
          editArtifactLink } from '../utils/utils';
import {  getCurrentSectionArtifact,
          isUserLoggedIn,  
          getFlexBookArtifact, 
          isOwner, 
          getCustomizeOptions, 
          isArtifactPublished,
          isNewSideNavigationBar,
          getGroupEditingDetails,
          getLocationInfo,
          getCurrentArtifactType,
          getSummaries,
          userHasRole  } from '../selectors/selectors.js';
import * as ArtifactTypes from '../constants/artifactTypes';
import {TEACHER} from '../constants/constants';
import includes from 'lodash/includes';        
import FlexBookReader from './FlexBookReader';
import Ck12EditLink from 'ck12-edit-link';

//Based on the role we unshift array with Add to Class
class SideNav extends Component{
  constructor(props){
    super(props);
    this.state = { attachment:null};
  }

  componentDidMount(){
    if(!this.state.attachment){
      let resourceAttached = checkResourceAttach(this.props.resources);
      (resourceAttached != '') ? this.setState({attachment: resourceAttached}) :null;
    }
  }
  render() {
    let {groupEditingDetails, locationInfo, artifactOwner, 
         userInfo, artifact, customizeOptions, artifactType,
         isPublished, revisions, isNewSideNav, summaries, isTeacher} = this.props;
    let {login,loggedIn} = userInfo;
    let sourcePDF = (this.state.attachment) ? this.state.attachment: '';
    let revisionAdded = checkRevisionAdded(loggedIn, artifact.revisions);
    let sideOptions = sideNavigationList({artifact, artifactOwner, isNewSideNav});
    let editLink = (login!='ck12editor' && (artifactOwner || groupEditingDetails.isAssigned)) ? editArtifactLink(locationInfo) : customizeArtifactLink(artifact);
    let customizeLinkOptions = Ck12EditLink({...customizeOptions, editLink});
    //let customizeLinkOptions = {editLink};
    let artifactRevisionID = artifact.revisionID || artifact.revisions[0].id;
    let {id:artifactID, title:artifactTitle} = artifact;
    let linkInfo =  {isNewSideNav, artifactRevisionID, artifactOwner, artifactType,
                    sourcePDF,login,loggedIn,revisionAdded, groupEditingDetails, isTeacher,
                    customizeLinkOptions, artifactID, artifactTitle, isPublished, summaries};
    //let linkInfo = {sourcePDF,login,loggedIn,revisionAdded, artifactID, title};
    let sideBarOptions = sideOptions.map(function({title, label, icon}, index){
      return (
        <SideNavRow  key={'sd_' + index} {...linkInfo} type={label} icon={icon} title={title}/>
      );
    });
    return (
      <div className='sidenav' style={isNewSideNav?{position:'absolute',right:'0px'}:{}}>
        { sideBarOptions }
        {!artifactOwner && !isNewSideNav && <FlexBookReader/>}
      </div>
    );
  }
}


const styles = {
  link: {
    display: 'block'
  }
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state),
    userInfo = isUserLoggedIn(state),
    isNewSideNav = isNewSideNavigationBar(state),
    {resources,revisions} = getFlexBookArtifact(state),
    artifactOwner = isOwner(state),
    customizeOptions = getCustomizeOptions(state),
    isPublished = isArtifactPublished(state),
    locationInfo = getLocationInfo(state),
    groupEditingDetails = getGroupEditingDetails(state),
    summaries  = getSummaries(state),
    artifactType = getCurrentArtifactType(state),
    isTeacher = userHasRole(state,TEACHER);
  return {
    artifact,
    userInfo,
    resources,
    revisions,
    artifactOwner,
    customizeOptions,
    isPublished,
    locationInfo,
    isNewSideNav,
    groupEditingDetails,
    artifactType,
    summaries,
    isTeacher
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  fetchSectionAssigneeDetails
});

export default connect(
  mapStateToProps,
  null
)(SideNav);
