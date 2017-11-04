/*global MathJax*/
import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import  {getCurrentSectionArtifact,
        getProcessedSectionContents, 
        isUserLoggedIn,
        isCustomFlexBook,
        getGroupEditingDetails,
        isOwner
        } from '../selectors/selectors.js';
import {fetchDetails,
        fetchDraft
      } from '../actions/flexbook';
import {fetchSectionAssigneeDetails} from '../actions/actions';
import {loadAnnotation,
        setAnnotationLoaded,
        fetchSummaryDetails
} from '../actions/actions.js';
import HighlightNoteTable from '../containers/HighlightNoteTable';
import Vocabularies from '../containers/Vocabularies';
import ImageAttributions from './ImageAttributions';
import CK12HTML from './CK12Html.js';
import {enableAnnotation} from '../utils/requireBridge.js';
import {extractImageAttributions} from '../utils/imageAttribution';
import {isMobile} from '../utils/utils';
import {LOADINGICON} from '../constants/constants';
import Separator from './common/Separator';

@Radium
class SectionDetails extends React.Component {
  refresh(isSectionChanged){ //TODO: needs better name
    let {artifact, processedContents, annotationList, loggedIn, isCustom, isBookOwned,
        groupEditingDetails:{loading:{fetchingAssign}, isAssignee, isColloborater}} = this.props;
    let {id:artifactID, revisionID:artifactRevisionID, handle} = artifact;
    if(isSectionChanged && !processedContents  && typeof(isColloborater) != 'object')
    {
      let isCache = !(isBookOwned || isColloborater);
      this.props.fetchDetails(artifactRevisionID, isCache);   
      this.props.fetchSummaryDetails(artifactID);
    }

    if (artifact){
      if(!fetchingAssign && isSectionChanged)
      {
        this.props.fetchSectionAssigneeDetails(artifactID);
      }
      artifactRevisionID = artifactRevisionID|| artifact.revisions[0].id;
      if (processedContents){
        if(!annotationList.loaded){
          let annotationInstancePromise = enableAnnotation('#artifact_content', artifactID, artifactRevisionID, loggedIn);
          this.props.setAnnotationLoaded();
          annotationInstancePromise.done(()=>{
            this.props.loadAnnotation(); //load annotations in highlight/note table
          });
        }
      }
    }
  }
  componentDidMount(){
    this.refresh(true);
  }

  componentDidUpdate(prevState, prevProps){
    let {artifact:{revisionID: artifactRevisionID}, groupEditingDetails:{isColloborater}} = this.props;
    let {artifact:{revisionID: prevArtifactRevisionID}, groupEditingDetails:{isColloborater: prevColloborater}} = prevState;
    this.refresh(artifactRevisionID!=prevArtifactRevisionID || isColloborater!=prevColloborater);
  }
  render(){
    let loadingContent = (
      <div>
        Loading...
        <img src={LOADINGICON} width="43" height="11"/>
      </div>
    ), content;
    let {artifact, processedContents, imageAttributions, loading} = this.props;
    if (artifact && processedContents){
      content = (
        <CK12HTML content={processedContents} contentID="chapter_summary"/>
      );
    }
    return (
      <div className='sectiondetails'>
        {loading && 
          (<div>
            {loadingContent}
          </div>)
        }
        <Separator className="hide-for-small"/>
        <div className="annotator-wrapper">
          <div style={styles.wordWrap} id="artifact_content">
            {content}
          </div>
        </div>
        <ImageAttributions attributions={imageAttributions}/>
        <Vocabularies/>
        <HighlightNoteTable />
      </div>
    );
  }
}

const styles = {
  wordWrap:{
    '@media screen and (max-width:767px)':{
      wordWrap: 'break-word'
    }
  }
}

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  let {conceptContent: processedContents} = getProcessedSectionContents(state);
  let imageAttributions = extractImageAttributions(processedContents).filter((attribution)=>attribution.author);
  let {loggedIn} = isUserLoggedIn(state);
  let isCustom  = isCustomFlexBook(state);
  let groupEditingDetails = getGroupEditingDetails(state);
  let isBookOwned = isOwner(state);
  let {practice:{loading}} = state;
  return {
    artifact,
    bookInfo: state.locationInfo,
    sectionPosition: state.currentTOCSection,
    processedContents,
    imageAttributions,
    annotationList: state.annotationList,
    loggedIn,
    isCustom,
    isBookOwned,
    loading,
    groupEditingDetails
  };
};

export default connect(
  mapStateToProps,
  {
    fetchDetails,
    fetchDraft,
    fetchSummaryDetails,
    loadAnnotation,
    setAnnotationLoaded,
    fetchSectionAssigneeDetails
  }
)(SectionDetails);
