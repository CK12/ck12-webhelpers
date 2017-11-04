import React, { Component } from 'react';

/**
* AlignedIntermediateNode is used for displaying the intermediate nodes
* props :
*  1. level : Level is the indicator of
*  2. nodeDetails  :  Data attribute to be passed. It has to have nodeDesc , nodeId and subjectCode
*  3. children  : Children under
*  4. isExpanded : Flag to manage expanded/collapsed state
*/

class AlignedIntermediateNode extends Component {
  constructor(){
    super();
    this.onClick = this.onClick.bind(this);
  }
  render() {
    const {
          level,
          nodeDetails,
          children,
          isExpanded
        } = this.props;

    const treeHeaderClass =  `tree-view_arrow ${isExpanded ? '': 'tree-view_arrow-collapsed'}`;
    const treeChildrenClass =  `tree-view-children ${isExpanded ? '': 'tree-view_children-collapsed'}`;

    return (
      <div className='tree-view' style={{'fontSize': (20-(level-1)*1)+'px'}} data-is-node='true'>
        <div className='tree-view_item'
          onClick={this.onClick}>
            <span className='node'>{nodeDetails.standardTitle}</span>
            <div className={treeHeaderClass}></div>
        </div>
        <div className={treeChildrenClass}>
          {children}
        </div>
      </div>
        )
  }
  onClick(e){
    const { handleClickEvent, nodeDetails, isExpanded }  = this.props;
    //TODO 
    handleClickEvent( e, !isExpanded, nodeDetails.standardID , nodeDetails.subjectCode ||'BIO' , nodeDetails.standardTitle);
  }
}
export default AlignedIntermediateNode;

AlignedIntermediateNode.defaultProps = {
    nodeDetails : {},
    isExpanded : false,
    children : [],
    handleClickEvent: ()=>({}),
    level : 1
};
