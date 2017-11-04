import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';

import Modal from 'react-modal';

import AddConceptModal from './modals/AddConceptModal.jsx';

import {
    ActionTypes,
    ActionMethods
} from '../actions/'

const {
    CloseAddConceptModal,
    CloseGenerateFlexbookModal,
    ChangeSubjectForModalSelect,
    ConceptSelectedForAddition
        } = ActionMethods; // destructuring the methods required to send
// Components

class AlignedModalContainer extends Component {

  constructor(props) {
    super(props);
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.onConceptSelect = this.onConceptSelect.bind(this);
    this.onAddConceptModalClose = this.onAddConceptModalClose.bind(this);
  }
  render() {
    const {
      openAddConceptModal,
      openGenerateFlexbookModal,
      openFlexbookSuccessModal,
      subjectCodeForAddConceptModal,
      branchCodeForAddConceptModal,
      conceptListByBranchId
     }  = this.props;

    const style = {
      overlay : {
        backgroundColor: 'rgba(160,160,160,0.5)',
        zIndex: 1000
      },
      content:{
        width : '600px',
        height: '350px',
        top: '30%',
        marginLeft :'auto',
        marginRight : 'auto',
        textAlign : 'center',
        borderRadius : '10px',
        overflow : 'initial',
        overflowY:'visible'
      }
    };
    const addConceptModalProps = {
      selectedSubjectCode : subjectCodeForAddConceptModal ,
      selectedBranchCode  : branchCodeForAddConceptModal,
      handleChangeSubject : this.onSubjectChange ,
      handleSelectConcept : this.onConceptSelect,
      optionsData :   conceptListByBranchId
    };
    return (
            <Modal
              isOpen={openAddConceptModal}
              contentLabel="Aligned Modal"
               shouldCloseOnOverlayClick={true}
               onRequestClose={this.onAddConceptModalClose}
               role='dialog'
               style={style}>
               <AddConceptModal {...addConceptModalProps}/>
            </Modal>

        )
  }

  onSubjectChange(e, attributes) {
    const { action } = this.props;
    action.ChangeSubjectForModalSelect(attributes);
  }
  onConceptSelect(eId) {
    const { action } = this.props;
    action.ConceptSelectedForAddition(eId);
  }
  onAddConceptModalClose(){
    const { action } =  this.props;
    action.CloseAddConceptModal();
  }
}

let mapStateToProps = (state, ownProps)=> {
  let instance = ownProps['instance'];
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  let instance = ownProps['instance'];
  return {
    action: bindActionCreators({
      CloseAddConceptModal,
      CloseGenerateFlexbookModal,
      ChangeSubjectForModalSelect,
      ConceptSelectedForAddition
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignedModalContainer);


const Styles = {
  loginHeaderTxt : {
    overflowWrap :'normal',
    width: '90%',
    left: '5%',
    height: '40px',
    fontSize: '34px',
    position: 'relative',
    marginTop : '30px'
  },
  loginInstructionTxt : {
    overflowWrap :'normal',
    width: '60%',
    left: '20%',
    height: '30px',
    fontSize: '28px',
    position: 'relative',
    marginTop : '10px'
  },
  stdMarketingContainer:{
    width: '80%',
    left: '10%',
    height: '500px',
    borderRadius : '20px',
    position: 'relative',
    fontSize : '30px',
    lineHeight : '500px',
    marginTop : '20px',
    boxShadow: '0px 3px 5px lightgrey'
  }
}
