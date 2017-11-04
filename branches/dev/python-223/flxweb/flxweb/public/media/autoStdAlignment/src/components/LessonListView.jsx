import React, { Component } from 'react';

import SIdConceptDetailsView from './SIdConceptDetailsView.jsx';
/**
*
*
*/

class LessonListView extends Component {
  render() {
    const {
          intermediateNodeList,
          currentStandardDescription,
          handleClickOnLessonNode
        } = this.props;

    let nodes  = intermediateNodeList.map((tree, idx)=>{
                        return <div key={idx} style={Styles.staticNodeContainer}
                                  onClick={(e)=>{handleClickOnLessonNode(tree.standardID, tree.subjectCode||'BIO', tree.standardTitle)}}>
                            <div key={idx} style={Styles.staticNodeImgArea}>
                              <img src='/media/autoStdAlignment/images/ConceptIcon.png'
                                  style={Styles.imgStyle}/>
                            </div>
                            <a className='aligned-standard-text'>{tree.standardTitle}</a>
                          </div>

                  });

    return (
          <div>
            <div style={Styles.staticViewHeader}>
              <div style={Styles.standardDescTxtStyle}>{currentStandardDescription}</div>
            </div>
            {nodes}
          </div>
        )
  }
}

export default LessonListView;

LessonListView.defaultProps = {
  currentStandardDescription : 'Curriculum Description Not Provided',
  handleClickOnLessonNode : ()=>({})
};

const Styles = {
  staticViewHeader:{
    paddingBottom: '10px',
    borderBottom: '1px solid lightgrey',
    marginBottom: '20px',
    height:'87px'
  },
  standardTxtStyle:{
    fontSize: '26px',
    textAlign: 'left',
    marginBottom: '7px'
  },
  standardDescTxtStyle:{
    fontSize: '20px',
    textAlign: 'left'
  },
  staticNodeContainer:{
    'width': '150px',
    'height': '220px',
    marginLeft : '10px',
    float : 'left',
    marginBottom : '10px'
  },
  staticNodeImgArea:{
    height: '150px',
    width:'100%',
    backgroundColor:'black',
    opacity:0.75,
    display: 'inline-block',
    borderRadius: '5px',
  },
  imgStyle:{
    top: '20%',
    position: 'relative'
  }
}
