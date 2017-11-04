import React, { Component } from 'react';

import Select from '../Select.jsx';
import SearchBar from '../SearchBar.jsx';

import { subjectsConfig } from '../../app/Config.js';

/**
Props to accept
1.
*/

class AddConceptModal extends Component {

  constructor(){
    super();
    this.changeSubject = this.changeSubject.bind(this);
  }
  render() {
    const {
          selectedSubjectCode,
          selectedBranchCode,
          handleChangeSubject,
          handleSelectConcept,
          optionsData
        } = this.props;


    const subjectOptions =  [];

    let currentSubjectText;

    subjectsConfig.forEach((subject, idx)=> {

          subjectOptions.push({
              label : subject.title,
              value : subject.code,
              class : 'auto-aligned-options option-group',
              attribute:{
                  subjectTitle : subject.title,
                  subjectCode : subject.code
              }
          })
          if ( subject.code == selectedSubjectCode ){
              currentSubjectText =  subject.title
          }

          subject.branchList.forEach((branch,index)=>{

                subjectOptions.push({
                  label : `-${branch.title}`,
                  value : branch.code,
                  class : 'auto-aligned-options option-list',
                  attribute:{
                      subjectTitle : subject.title,
                      subjectCode : subject.code,
                      branchTitle : branch.title,
                      branchCode : branch.code
                  }
                })
                if ( branch.code == selectedBranchCode ){
                    currentSubjectText =  `${subject.title}-${branch.title}`;
                }
          })
    });

    const selectProps = {
        defaultText : 'Choose Subject',
        optionsData : subjectOptions,
        currentText : currentSubjectText,
        handleOptionChange : handleChangeSubject
    };
    const searchBarProps = {
      handleSelectConcept,
      optionsData
    }
    return (
            <div style={Styles.modalStyle}>
              <div style={{marginTop:'20px', marginBottom:'20px',fontSize:'26px'}}>
                <p>Add Concept</p>
              </div>
              <Select {...selectProps} />
              <SearchBar {...searchBarProps} />
            </div>
        )
  }
  changeSubject(e){
    const { action } = this.props;
    let value =  e.target.getAttribute('value');
    let attribute =  e.target.getAttribute('data-attrib');
    let payload = {};
    try{
       attribute  =  JSON.parse(attribute);
       payload = {
         subjectCode : attribute.subjectCode,
         branchCode  : value
       }
       this.setState({
         selectedSubjectIdForAddingConcept : value
       })
    }catch(e){
      console.error(e);
      payload = {
        subjectCode : value
      }
      this.setState({
        selectedSubjectIdForAddingConcept : value
      })
    }
  }
}
export default AddConceptModal;

AddConceptModal.defaultProps = {
  handleChangeSubject : ()=>{},
  handleSelectConcept : ()=>{}
};

const Styles = {
  modalStyle:{
    backgroundColor : 'white',
  },
  checkStyle:{
    fontSize: "21px",
    color: '#00ABA4',
    width: '100%',
    height: '100%',
    position: 'relative',
    fontWeight: 'bold'
  }
}
