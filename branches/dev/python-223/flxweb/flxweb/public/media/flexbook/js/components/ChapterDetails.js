/* global MathJax*/
import React from 'react';
import {connect} from 'react-redux';
import {setCurrentSection} from '../actions/location';
import {fetchDetails, fetchDraft} from '../actions/flexbook';
import {
  getCurrentSectionInfo,
  getProcessedContents,
  fetchingFlexbookDetails,
  isCustomFlexBook
} from '../selectors/selectors.js';
import TOCRow from './TOCRow.js';
import {processChapterContent} from '../utils/ck12content.js';
import ImageAttributions from './ImageAttributions';
import {extractImageAttributions} from '../utils/imageAttribution';
import CK12HTML from './CK12Html.js';
import Separator from './common/Separator';

class ChapterDetails extends React.Component {
  constructor(){
    super();
    this.onSectionClick = this.onSectionClick.bind(this);
  }

  onSectionClick(section){
    this.props.setCurrentSection(section);
  }

  refresh(){ //TODO: needs better name
    let {artifact, processedContents,fetchingDetails, isCustom} = this.props;
    if (artifact && !processedContents){
      let {revisionID} = artifact;
      !fetchingDetails && this.props.fetchDetails(revisionID, !isCustom);
    }
  }

  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(){
    this.refresh();
  }

  render(){
    if (this.props.artifact){
      let chapterIntro = '';
      let chapterSummary = '';
      let chapterChildIndex = 1;
      let {realm, handle, artifactType, revision} = this.props.bookInfo;
      let chapterPosition = this.props.chapterPosition;
      let {processedContents, imageAttributions} = this.props;
      let chapterChildren = this.props.chapterChildren.map((child) => {
        let position = chapterPosition + '.' + chapterChildIndex;
        chapterChildIndex += 1;
        let {summary, title,hasDraft} = child;
        let rowInfo = {
          realm,
          handle,
          artifactType,
          revision,
          position,
          summary,
          title,
          hasDraft
        };
        return (
          <TOCRow
            key={'ch_' + child.revisionID}
            onRowClick={this.onSectionClick}
            {...rowInfo}
            />
        );
      });

      if (processedContents){
        ( {intro:chapterIntro, summary:chapterSummary} = processChapterContent(processedContents) );
      }

      return (
        <div className='chapterdetails'>
          <Separator className="hide-for-small"/>
          <div id="chapter_intro">
            <CK12HTML content={chapterIntro} contentID="chapter_intro"/>
          </div>
          <div>
            {chapterChildren}
          </div>
          <div id="chapter_summary">
            <CK12HTML content={chapterSummary} contentID="chapter_summary"/>
          </div>
          <ImageAttributions attributions={imageAttributions}/>
        </div>
      );
    } else {
      return (
        <div>
          Artifact not found!!
        </div>
      );
    }

  }
}

const mapStateToProps = (state) =>{
  let processedContents = getProcessedContents(state);
  let {artifact, loaded} = getCurrentSectionInfo(state);
  let chapterChildren = (artifact.revisions && artifact.revisions[0].children) || artifact.children;
  let [chapterPosition] = state.currentTOCSection.split('.');
  let imageAttributions = extractImageAttributions(processedContents).filter((attribution)=>attribution.author);
  let fetchingDetails = fetchingFlexbookDetails(state);
  let isCustom = isCustomFlexBook(state);
  return {
    processedContents,
    imageAttributions,
    artifact,
    chapterChildren,
    chapterPosition,
    bookInfo: state.locationInfo,
    loaded,
    fetchingDetails,
    isCustom
  };
};

export default connect(
  mapStateToProps,
  {
    fetchDetails,
    fetchDraft,
    setCurrentSection
  }
)(ChapterDetails);
