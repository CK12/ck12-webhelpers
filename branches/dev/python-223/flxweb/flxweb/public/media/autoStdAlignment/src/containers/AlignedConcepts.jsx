/**
*  AlignedConcepts
        !
*       ! ---> AlignedConceptsLHN
                    !
                    ! ---> BreadCrumb
                    !
                    !
                    ! ---> MiniSubjectList
                    !
                    !
                    ! ---> AlignedStdTreeView
                                !
                                ! --> AlignedIntermediateNode
                                !
                                ! --> SidNode
                                        !
                                        !---> AlignedCheckBox
                    !
                    !
                    ! ---> DownloadButton
        !
        !
        ! ---> AlignedConceptArea
                      !
                      ! ---> LessonListView
                      !
                      !
                      ! ---> ConceptsList < List >
                                !
                                ! --> SIdConceptDetailsView
                                            !
                                            !---> ConceptCarouselView
                                                      !
                                                      ! ---> ConceptView <List>
                                                                !
                                                                ! ---> AlignedCheckBox
                                                                !
                                                      !
                                            !
                                !
                      !
        !
        !
        ! ---> AlignedModalContainer
                    !
                    ! ---> AddConceptModal
                              !
                              ! ---> Select
                              !
                              ! ---> SearchBar
                    !
*/


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';

import { subjectsConfig } from '../app/Config';

import styles from '../../css/autoStandard.css';

import {
    ActionTypes,
    ActionMethods
} from '../actions/'

const {
    AlignedCompInit,
    ChangeStandardId,
    ChangeNodeExpansionState,
    ChangeConceptSelection,
    RemoveConceptSelection,
    OpenAddConceptModal,
    MoveToSubSelection,
    createCSVForSelectedSId
        } = ActionMethods; // destructuring the methods required to send

import AlignedConceptsLHN from '../components/AlignedConceptsLHN.jsx';

import AlignedConceptArea from '../components/AlignedConceptArea.jsx';

import AlignedModalContainer from '../components/AlignedModalContainer.jsx';


class AlignedConcepts extends Component {

  constructor(props) {
    super(props);
    this.changeStandardId = this.changeStandardId.bind(this);
    this.changeUIExpansionState =  this.changeUIExpansionState.bind(this);
    this.changeUIExpansionStateFromBlock =  this.changeUIExpansionStateFromBlock.bind(this);
    this.handleConceptCheckBoxEvent =  this.handleConceptCheckBoxEvent.bind(this);
    this.handleAddConceptToSid =  this.handleAddConceptToSid.bind(this);
    this.handleRemoveCheckedConcepts =  this.handleRemoveCheckedConcepts.bind(this);
    this.handleEditSubjectList =  this.handleEditSubjectList.bind(this);
    this.handleCSVClick = this.handleCSVClick.bind(this);
  }
  componentWillMount(){
    const { action } = this.props;
    action.AlignedCompInit();
  }
  render() {
    const {
            isCurriculumTreeLoading,
            isConceptsForCurriculumLoading,
            curriculumMetaData,
            expandedCurrNodesList,
            currentSId,
            currentSIdDesc,
            selectedSubjects,
            currentStandardDescription,
            currentCurriCulumDesc,
            conceptsSelected,
            conceptDataForCurriculumNode,
            selectedConceptDetails,
            selectedSIdsList
           }  = this.props;

    const alignedConceptLHNProps = {
        isCurriculumTreeLoading,
        treeData : curriculumMetaData,
        selectedNodeId : currentSId,
        expandedCurrNodesList,
        selectedSubjects,
        selectedSIdsList,
        shouldDownloadBtnBeDisabled: selectedSIdsList.length == 0,
        intermediateNodeClickCb : this.changeUIExpansionState,
        sIdNodeClickCb : this.changeStandardId,
        sIdNodeCheckCb  : ()=>({}),
        handleEditSubjectList : this.handleEditSubjectList,
        handleCSVClick : this.handleCSVClick
    };

    const alignedConceptsAreaProps = {
        isConceptsForCurriculumLoading,
        currentSId,
        currentSId,
        currentStandardDescription,
        currentCurriCulumDesc,
        conceptsSelected,
        curriculumMetaData,
        expandedCurrNodesList,
        conceptDataForCurriculumNode,
        selectedConceptDetails,
        handleClickOnLessonNode : this.changeUIExpansionStateFromBlock,
        handleConceptCheckBoxEvent : this.handleConceptCheckBoxEvent,
        handleAddConceptToSid : this.handleAddConceptToSid,
        handleRemoveCheckedConcepts : this.handleRemoveCheckedConcepts
    };

    return (
            <div style={{ 'height': "600px", diplay:'table'}}>
              <AlignedConceptsLHN {...alignedConceptLHNProps}/>
              <AlignedConceptArea {...alignedConceptsAreaProps}/>
              <AlignedModalContainer />
            </div>

        )
  }

  changeUIExpansionState(evt, state, id, subjectCode, desc){
    evt.stopPropagation();
    const { action } = this.props;
    action.ChangeNodeExpansionState({
       id ,
       state,
       subjectCode,
       desc
    });
  }
  changeUIExpansionStateFromBlock(id, subjectCode, desc){
    const { action } = this.props;
    action.ChangeNodeExpansionState({
       id ,
       subjectCode,
       desc,
       state : true
    });
  }
  changeStandardId(e, sId, subjectCode, sIdDesc) {
    e.stopPropagation();
    const { action } = this.props;
    action.ChangeStandardId({
        sId,
        subjectCode,
        sIdDesc
    });
  }
  handleConceptCheckBoxEvent( sId, conceptId){
    const { action } = this.props;
    action.ChangeConceptSelection({
        sId,
        conceptId
    });
  }
  handleAddConceptToSid(sId){
    const { action } = this.props;
    action.OpenAddConceptModal(sId)
  }
  handleRemoveCheckedConcepts(sId, conceptId){
    const { action } = this.props;
    action.RemoveConceptSelection({
        sId,
        conceptId
    });
  }
  handleEditSubjectList(){
    const { action } = this.props;
    action.MoveToSubSelection();
  }
  handleCSVClick(){
    const { action } = this.props;
    action.createCSVForSelectedSId();
  }
}

let mapStateToProps = (state, ownProps)=> {
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  return {
    action: bindActionCreators({
      AlignedCompInit,
      ChangeStandardId,
      ChangeNodeExpansionState,
      ChangeConceptSelection,
      RemoveConceptSelection,
      MoveToSubSelection,
      OpenAddConceptModal,
      createCSVForSelectedSId
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignedConcepts);


const Styles = {

}
