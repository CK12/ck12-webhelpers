import {ActionTypes as Actions} from '../actions/';

/**
* Reducer Structure
* {
  openAddConceptModal : Boolean ,
  openGenerateFlexbookModal : Boolean ,
  openFlexbookSuccessModal : Boolean,

  sIdForAddConceptModal : String,
  subjectCodeForAddConceptModal : String,
  branchCodeForAddConceptModal : String,
  conceptListByBranchId : []
}
*
*
*/


const openAddConceptModal = ( state = false, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.MODAL_OPEN_ADD_CONCEPT_MODAL :
    return true;
    break;
  case Actions.MODAL_CLOSE_ADD_CONCEPT_MODAL :
  case Actions.MODAL_CONCEPT_SELECTED:
    return false;
    break;
  default:
    return state;
  }
};

const openGenerateFlexbookModal = ( state = false, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.MODAL_OPEN_GENERATE_FLEXBOOK_MODAL :
    return true;
    break;
  case Actions.MODAL_CLOSE_GENERATE_FLEXBOOK_MODAL :
    return false;
    break;
  default:
    return state;
  }
};


const openFlexbookSuccessModal = ( state = false, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.MODAL_OPEN_FLEXBOOK_SUCCESS_MODAL :
    return true;
    break;
  case Actions.MODAL_CLOSE_FLEXBOOK_SUCCESS_MODAL :
    return false;
    break;
  default:
    return state;
  }
};


/**  id - 1 */
const sIdForAddConceptModal = ( state = '', action)=>{
    const type = action.type;
    let newState;
    switch( type ){
      case Actions.MODAL_OPEN_ADD_CONCEPT_MODAL :
        return action.payload;
        break;
      case Actions.MODAL_CLOSE_ADD_CONCEPT_MODAL :
        return '';
        break;
      default:
        return state;
         break;
    }
}

const subjectCodeForAddConceptModal = ( state = '', action)=>{
    const type = action.type;
    let newState;
    switch( type ){
      case Actions.MODAL_CHANGE_SUBJECT :
        return action.payload.subjectCode;
        break;
      case Actions.MODAL_CLOSE_ADD_CONCEPT_MODAL :
        return '';
        break;
      default:
        return state;
         break;
    }
}

const branchCodeForAddConceptModal = ( state = '', action)=>{
    const type = action.type;
    let newState;
    switch( type ){
      case Actions.MODAL_CHANGE_SUBJECT :
        return action.payload.branchCode || '';
        break;
      case Actions.MODAL_CLOSE_ADD_CONCEPT_MODAL :
        return '';
        break;
      default:
        return state;
         break;
    }
}

const conceptListByBranchId = ( state = [], action)=>{
  const type = action.type;
  let newState;
  switch( type ){
    case Actions.MODAL_CHANGE_CONCEPT_LIST_FOR_SUB_CODE :
      return action.payload;
      break;
    case Actions.MODAL_CLOSE_ADD_CONCEPT_MODAL :
      return [];
      break;
    default:
      return state;
       break;
  }
}



export default {
  openAddConceptModal,
  openGenerateFlexbookModal,
  openFlexbookSuccessModal,
  sIdForAddConceptModal,
  subjectCodeForAddConceptModal,
  branchCodeForAddConceptModal,
  conceptListByBranchId
};
