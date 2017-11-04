import React, { Component } from 'react';

import BreadCrumb from './BreadCrumbContainer.jsx';

import AlignedStdTreeView from './AlignedStdTreeView.jsx';

import MiniSubjectList from './MiniSubjectList.jsx';

import Button from '../common/components/Button.jsx';

import Loader from '../common/components/Loader.jsx';

import DownloadButton from './DownloadButton.jsx';

import { subjectsConfig } from '../app/Config';

/**
* This is the LHN Subview of Aligned Concept Page
* It has
*  1. Breadcrumbs
*  2. Subject Lists
*  3. AlignedStdTreeView
*  4. Download Button
*
*/


class AlignedConceptLHN extends Component {
  render() {
    const {
          isCurriculumTreeLoading,
          treeData,
          selectedNodeId,
          expandedCurrNodesList,
          selectedSubjects,
          intermediateNodeClickCb,
          sIdNodeClickCb,
          sIdNodeCheckCb,
          shouldDownloadBtnBeDisabled,
          selectedSIdsList,
          handleEditSubjectList,
          handleCSVClick
        } = this.props;


    const subjectData  = [...subjectsConfig[0].branchList, ...subjectsConfig[1].branchList];
    const subjectList  =    subjectData.filter(val=> selectedSubjects.indexOf(val.code) != -1).map(val=>val.title);

    const alignedStdTreeProps = {
        treeData,
        selectedNodeId,
        expandedCurrNodesList,
        intermediateNodeClickCb ,
        sIdNodeClickCb,
        sIdNodeCheckCb,
        selectedSIdsList
    };

    const alignedTreeLoaderProps = {
        loaderStyle : Styles.alignedTreeLoader
    };

    const downloadBtnProps = {
        isDisabled : shouldDownloadBtnBeDisabled,
        handleCSVClick ,
        btnStyle: Styles.downloadBtnStyle,
        btnDisabledStyle:Styles.downloadBtnDisabledStyle
    };

    return (
        <div style={Styles.alignedTreeContainer}>
          <div style={{'marginBottom': '30px', 'borderBottom':'1px solid lightgrey','paddingBottom':'10px'}}>
              <BreadCrumb />
              <MiniSubjectList {...{subjectList : subjectList,handleEditSubjectList } }/>
          </div>
          {
            isCurriculumTreeLoading &&
            <Loader {...alignedTreeLoaderProps}/>
          }
          {
            !isCurriculumTreeLoading &&
            <div style={{height:'483px'}}>
              <AlignedStdTreeView {...alignedStdTreeProps}/>
              <DownloadButton {...downloadBtnProps}/>
            </div>
          }
        </div>
        )
  }
}
export default AlignedConceptLHN;

AlignedConceptLHN.defaultProps = {
    data : {},
    isExpanded : false,
    children : []
};

const Styles = {
  alignedTreeContainer : {
    // overflowY : 'auto',
    width: '28%',
    position: 'relative',
    height : '100%',
    textAlign : 'left',
    paddingLeft: '3px',
    display : 'table-cell',
  },
  downloadBtnStyle:{
    width: '100%',
    marginLeft: 'auto',
    marginRight:'auto',
    marginTop:'10px',
    borderRadius: '5px',
    height: '60px',
    fontSize: '21px',
    borderColor : 'lightgrey'
  },
  downloadBtnDisabledStyle:{
    backgroundColor:'#A9A9A9'
  },
  alignedTreeLoader:{
      top:'40%',
      left:'10%'
  }
}
