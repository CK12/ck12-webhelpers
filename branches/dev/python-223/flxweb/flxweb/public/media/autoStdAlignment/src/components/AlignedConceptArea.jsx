import React, { Component } from 'react';

import Loader from '../common/components/Loader.jsx';

import ConceptsList from './ConceptsList.jsx';

import LessonListView from './LessonListView.jsx';

/**
* This is the LHN Subview of Aligned Concept Page
* It has
*  1. Lesson List View
*  2. Concepts Lists
*       sIdConceptDetailsView ( List )
          sid Desc
          Concepts selectedNodeId
          ConceptCarouselView
              ConceptView
*
*/


class AlignedConceptArea extends Component {
  render() {
    const {
          isConceptsForCurriculumLoading,
          currentSId,
          currentSIdDesc,
          currentStandardDescription,
          currentCurriCulumDesc,
          conceptsSelected,
          curriculumMetaData,
          handleClickOnLessonNode,
          expandedCurrNodesList,
          conceptDataForCurriculumNode,
          handleConceptCheckBoxEvent,
          handleAddConceptToSid,
          handleRemoveCheckedConcepts,
          selectedConceptDetails
        } = this.props;

    const alignedConceptLoaderProps = {
        loaderStyle : Styles.alignedConceptLoader
    };
    const lessonListViewProps = {
        intermediateNodeList : curriculumMetaData,
        currentStandardDescription,
        handleClickOnLessonNode
    };

    const conceptListProps = {
        currentCurriCulumDesc,
        currentSId,
        currentSIdDesc,
        conceptsSelected,
        conceptDataForCurriculumNode,
        selectedConceptDetails,
        handleConceptCheckBoxEvent,
        handleAddConceptToSid,
        handleRemoveCheckedConcepts
    };

    return (
      <div style={Styles.alignedConceptsContainer}>
        { isConceptsForCurriculumLoading && expandedCurrNodesList.length != 0 &&  <Loader {...alignedConceptLoaderProps}/> }
        {  expandedCurrNodesList.length == 0 && <LessonListView {...lessonListViewProps} /> }
        {  !isConceptsForCurriculumLoading  && expandedCurrNodesList.length != 0 &&  <ConceptsList {...conceptListProps} /> }
      </div>
        )
  }
}
export default AlignedConceptArea;

AlignedConceptArea.defaultProps = {
    data : {},
    isExpanded : false,
    children : []
};

const Styles = {
  alignedConceptsContainer:{
    display : 'table-cell',
    width : '72%',
    maxWidth:'600px',
    height : '100%',
    // overflowY: 'auto',
    paddingLeft: '5%'
  },
  alignedConceptLoader:{
    'top': '200px',
    'left': '0px'
  }
}
