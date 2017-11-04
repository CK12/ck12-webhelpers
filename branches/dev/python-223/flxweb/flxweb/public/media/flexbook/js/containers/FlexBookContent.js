import React from 'react';
import {connect} from 'react-redux';
import {
  getCurrentSectionArtifact,
  getChapters,
  getRevisions,
  getMessageToUsers,
  getTOC,
  isModality,
  getCurrentArtifactType
} from '../selectors/selectors.js';
import FlexBookTOC from '../components/FlexBookTOC.js';
import ChapterDetails from '../components/ChapterDetails.js';
import SectionDetails from '../components/SectionDetails.js';
import {setCurrentSection} from '../actions/location';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import * as ArtifactTypes from '../constants/artifactTypes';

const FlexBookContent = (props) => {
  let {artifactType, position} = props;
  if(includes(ArtifactTypes.BOOK_TYPES, artifactType)){
    let {messageToUsers, bookInfo, setCurrentSection, chapters} = props;
    return (
    <FlexBookTOC
      onSectionClick={setCurrentSection}
      messageToUsers={messageToUsers}
      chapters={chapters}
      bookInfo={bookInfo}/>);
  }
  else if(artifactType === ArtifactTypes.CHAPTER){
    if(position == '0.0'){
      let {messageToUsers, bookInfo, setCurrentSection, chapters} = props;
      return (
    <FlexBookTOC
      onSectionClick={setCurrentSection}
      messageToUsers={messageToUsers}
      chapters={chapters}
      bookInfo={bookInfo}/>);
    }
    return(<ChapterDetails />);
  }
  else if (includes(ArtifactTypes.SECTION_TYPES, artifactType))
    return (<SectionDetails />);
  else return (<div> Unrecognized artifactType</div>);
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state),
    chaptersObj = getChapters(state),
    revisions = getRevisions(state),
    messageToUsers = getMessageToUsers(state),
    toc = getTOC(state),
    modality = isModality(state),
    position = state.currentTOCSection,
    artifactType = getCurrentArtifactType(state);

  if(isEmpty(artifact))
    return {};

  let {revisionID: artifactRevisionID} = artifact;

  let props = {
    artifactType,
    artifactRevisionID,
    bookInfo : state.locationInfo,
    messageToUsers,
    position,
    modality
  };
  if(includes(ArtifactTypes.BOOK_TYPES, artifactType) || position == '0.0'){
    let chapters = chaptersObj.map( (chapter) => revisions[toc[chapter]].artifact );
    props.chapters = chapters;
  }
  return props;
};

export default connect(
  mapStateToProps,
  {
    setCurrentSection
  }
)( FlexBookContent );
