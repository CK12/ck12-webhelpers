import React, { Component } from 'react';

import AlignedIntermediateNode from './AlignedIntermediateNode.jsx';

import SidNode from './SidNode.jsx';

class AlignedStdTreeView extends Component {

  prepareTree(data = [], expandedCurrNodesList, selectedSIdsList, selectedNodeId, level = 1){

      const { intermediateNodeClickCb, sIdNodeClickCb, sIdNodeCheckCb } = this.props;

      return data.map((val,idx)=>{

            const children  =  this.prepareTree(val.children, expandedCurrNodesList, selectedSIdsList,selectedNodeId, level+1)

            const isStandardNode = typeof val.children == 'undefined' ;

            if( isStandardNode){

              const isCurrentNode =  selectedSIdsList.includes(val.standardID);

              const sidNodeProps = {
                isHighLighted : (selectedNodeId == val.standardID),
                isSelected :  isCurrentNode,
                sIdData    :  val,
                handleOnClick : sIdNodeClickCb,
                handleCheckBoxClick : sIdNodeCheckCb
              };

              return  <SidNode {...sidNodeProps} key={idx}/>

            }else{

              const isExpanded  =  expandedCurrNodesList.indexOf(val.standardID) > -1;
              const intermediateNodeProps = {
                nodeDetails : val,
                children,
                isExpanded,
                handleClickEvent : intermediateNodeClickCb
              };

              return <AlignedIntermediateNode {...intermediateNodeProps} key={idx}/>
            }
      })
  }
  render() {
    const {
            treeData,
            selectedNodeId,
            expandedCurrNodesList,
            currentLevel,
            selectedSIdsList
           }  = this.props;

    const tree  =  this.prepareTree( treeData, expandedCurrNodesList, selectedSIdsList, selectedNodeId, currentLevel );

    return (
        <div style={{height:'413px', position:'relative',overflowY:'auto'}}>
          {tree}
        </div>
        )
  }
}

export default AlignedStdTreeView;
