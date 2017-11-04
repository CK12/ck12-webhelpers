import React, { Component } from 'react';

import ConceptCarouselView from './ConceptCarouselView.jsx';
/**
*
*
*/

class SIdConceptDetailsView extends Component {
  render() {
    const {
          standardID,
          standardTitle,
          standardDescription,
          conceptsSelected,
          relatedConcepts,
          handleConceptCheckBoxEvent,
          handleRemoveCheckedConcepts,
          handleAddConceptToSid
        } = this.props;

    const conceptsSelectedTxtList =  relatedConcepts.filter((val)=> conceptsSelected.includes(val.eid));

    const conceptsSelectedXML  = conceptsSelectedTxtList.map((val, idx)=>{
            return <span key={idx} onClick={(e)=>{handleRemoveCheckedConcepts(standardID, val.eid)}}>
                        &nbsp;
                        <span className='aligned-standard-text' style={{cursor:'pointer'}}>&#x274c;</span>
                        &nbsp;
                        {val.name}
                        &nbsp;
                      </span>
    })
    // TODO decompose to smaller components
    return (
          <div style={{paddingTop:'25px', 'borderBottom': '1px solid lightgrey',paddingBottom:'45px'}}>
            <div style={{'textAlign':'left', fontSize:'20px'}}>
              <span>
                <a className='aligned-standard-text'>{standardID}</a>
              </span>:&nbsp;
              <span style={{fontSize:'18px'}}>
                {standardDescription}
              </span>.
            </div>
            <div style={{'textAlign':'left', fontSize:'16px', marginTop:'10px',marginBottom:'4px'}}>
                <span className='aligned-standard-text' style={{fontWeight:'bold'}}>
                  Concepts Selected : &nbsp;
                </span>
                <span>
                  { conceptsSelected.length > 0 && conceptsSelectedXML }
                  { conceptsSelected.length == 0 && <span>none</span> }
                </span>
           </div>
            <ConceptCarouselView {...{conceptList : relatedConcepts,conceptsSelected, sId:standardID,handleAddConceptToSid, handleConceptCheckBoxEvent}} />
          </div>
        )
  }
}

export default SIdConceptDetailsView;

SIdConceptDetailsView.defaultProps = {
  // conceptList : [],
  handleRemoveCheckedConcepts:()=>{}
};

const Styles = {

}
