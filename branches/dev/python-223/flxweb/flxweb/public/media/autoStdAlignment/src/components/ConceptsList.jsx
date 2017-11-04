import React, { Component } from 'react';

import SIdConceptDetailsView from './SIdConceptDetailsView.jsx';
/**
*
*
*/

class ConceptsList extends Component {
  render() {
    const {
          currentCurriCulumDesc,
          currentSId,
          currentSIdDesc,
          conceptsSelected,
          conceptDataForCurriculumNode,
          selectedConceptDetails,
          handleConceptCheckBoxEvent,
          handleAddConceptToSid,
          handleRemoveCheckedConcepts
        } = this.props;

    const conceptDetailsList = conceptDataForCurriculumNode.map((prop, idx)=>{
                                    const conceptsSelected  =  selectedConceptDetails[prop.standardID]
                                    const props =  {...prop,conceptsSelected, handleConceptCheckBoxEvent, handleAddConceptToSid,handleRemoveCheckedConcepts}
                                    return <SIdConceptDetailsView {...props} key={idx} />
                               });
    return (
          <div>
            <div style={Styles.lessonDescriptionStyle}>{currentCurriCulumDesc}</div>
            <div style={{height:'513px',overflowY:'auto'}}>{conceptDetailsList}</div>
          </div>
        )
  }
}

export default ConceptsList;

ConceptsList.defaultProps = {
  currentCurriCulumDesc : 'Lesson Description Not Provided',
};

const Styles = {
  lessonDescriptionStyle:{
        fontSize: '26px',
        textAlign: 'left',
        paddingBottom: '50px',
        borderBottom: '1px solid lightgrey'
  },
  staticConceptBlockContainer : {
      'width': '150px',
      'height': '220px',
      marginLeft : '10px',
      float : 'left',
      marginBottom : '10px',
      display: 'inline-block',
      position:'relative'
  },
  staticConceptBlockImgArea:{
      height: '150px',
      width:'100%',
      backgroundColor:'rgba(0, 0, 0, 0.65)',
      borderRadius: '5px',
  },
  imgStyle:{
      top: '20%',
      left : '33%',
      position: 'relative'
  }
}
