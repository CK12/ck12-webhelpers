import {ActionTypes as Actions} from '../actions/';
/**
We would call it Curriculum tree
and each entity Curriculum unit
*/
/**
* Reducer Structure
* {
  isCurriculumTreeLoading : Boolean ,
  isConceptsForCurriculumLoading : Boolean,
  curriculumMetaData : [] ,
  expandedCurrNodesList = [],
  currentSId=String,
  currentSIdDesc =String,
  selectedSIdsList : []
}
*
*  {
     conceptDataForCurriculumNode : [ {
            sIdDesc :
            sId :
            conceptsSelected: [],
            conceptsList : []
   }],
   conceptDataResponseCache:{
      nodeId  : []
 },
 conceptList:{}
*
*  }
*/


const isCurriculumTreeLoading = ( state = true, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.ALIGNED_STANDARD_TREE_SUCCESS :
  case Actions.ALIGNED_STANDARD_TREE_FAILURE :
    return false;
    break;
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return true;
  default:
    return state;
  }
};

const isConceptsForCurriculumLoading = ( state = true, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.ALIGNED_CONCEPTS_RESPONSE_SUCCESS :
    return false;
    break;
  case Actions.ALIGNED_FETCH_CONCEPTS_FOR_STD_ID :
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return true;
  default:
    return state;
  }
};


const curriculumMetaData = ( state = [], action)=>{
  const type = action.type;
  switch( type ){
  case Actions.ALIGNED_STANDARD_TREE_SUCCESS :
    return action.payload;
    break;
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return [];
  default:
    return state;
  }
};

/** UI States*/

const expandedCurrNodesList = ( state = [], action)=>{
  const type = action.type;
  switch( type ){
  case Actions.ALIGNED_CHANGE_NODE_EXP_STATE :
    const isExpanded  = action.payload.state;
    const id  = action.payload.id;
    if( isExpanded ){
      return [ ...state, id];
    }else{
      return state.filter(val=>val!=id);
    }
    break;
  case Actions.ALIGNED_ADD_MULTI_NODE_EXP :
    const payload  = action.payload;
    return [...state, ...payload];
    break;

  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return [];

  default:
    return state;
  }
};
/**
State stores the selected sIds from the LHN
*/
const selectedSIdsList = ( state = [], action)=>{
  const type = action.type;

  switch (type) {
  case Actions.ALIGNED_CHANGE_STD_ID:  // ADD ANOTHER HANDLE
      let sId =  action.payload.sId,
      newState =  Object.assign([], state);
      const hasSId  = newState.includes(sId);
      let newConceptSelectedList = [];
      if( hasSId ){
         newConceptSelectedList  = newState.filter(val=>val!=sId);
      }else{
        newConceptSelectedList = [...newState, sId];
      }

      return newConceptSelectedList;
      break;
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
      return [];

  default:
    return state;
  }
};

/**
 State stores the currently selected sID, is being used to highlight the node
*/

const currentSId =  ( state='', action)=>{
  const type = action.type;

  switch (type) {
  case Actions.ALIGNED_CHANGE_STD_ID:
    return action.payload.sId;
    break;
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return '';
  default:
    return state;
  }
};

/**
 State stores the Description for currently selected sId, currently do not see any use in the view
 TODO
*/
const currentSIdDesc =  ( state='', action)=>{
  const type = action.type;

  switch (type) {
  case Actions.ALIGNED_CHANGE_STD_ID:
    return action.payload.sIdDesc;
    break;
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return '';
  default:
    return state;
  }
};

/**
Stores the subject ID for the currently selected SId,
it is required
*/

const subjectIdForCurrentSId =  ( state='', action)=>{
  const type = action.type;

  switch (type) {
  case Actions.ALIGNED_CHANGE_STD_ID:
    return action.payload.subjectCode;
    break;
  case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
    return '';

  default:
    return state;
  }
};

/**
 State stores the caches of the conceptData for a curriculum node, so if the data is in cache for
 a particular curriculum node , it serves it from here
*/
const conceptDataResponseCache = ( state = {}, action)=>{
      const type = action.type;
      switch( type ){
      case Actions.ALIGNED_CACHE_CONCEPTS_RESPONSE :
        let newState  =  Object.assign({}, state);
        const id = action.payload.id;
        const response = action.payload.conceptDataBySid;
        newState[ id ] = response;
        return newState;
        break;
      default:
        return state;
      }
}

/**
  State stores the concept data for a currently selected curriculum node
*/
const conceptDataForCurriculumNode =  ( state = [], action)=>{
      const type = action.type;
      switch( type ){
      case Actions.ALIGNED_CONCEPTS_RESPONSE_SUCCESS :
        return action.payload.conceptDataBySid;
        break;
      case Actions.ALIGNED_ADD_CONCEPTS_RESPONSE_SUCCESS :
        let newState =  Object.assign([], state);
        //  let nodeRef =  newState.find((node)=>node.standardID == action.payload.sId);
        let nodeRef = -1;
        for( let node of newState){
            if( node.standardID == action.payload.sId){
              nodeRef = node;
              break;
            }
        }
         if(nodeRef!= -1){
           nodeRef.relatedConcepts.push(action.payload.conceptData);
         }
        return newState;
        break;
      case Actions.ALIGNED_FETCH_CONCEPTS_FOR_STD_ID:
      case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
        return [];
        break;

      default:
        return state;
      }
}

/**
  State stores the current state of the list of selected concept encodedIDs for each sID
*/
const selectedConceptDetails = ( state = {}, action)=>{
      const type = action.type;
      let newState;
      switch( type ){
        case Actions.ALIGNED_CONCEPTS_RESPONSE_SUCCESS :

          let response = action.payload.conceptDataBySid;
          newState =  Object.assign({}, state);
           for( const res of response){
                newState[res.standardID] = [];
           }
          return newState;
          break;
        case Actions.ALIGNED_CHANGE_CONCEPT_SELECTION:
          let sId =  action.payload.sId,
              conceptId =  action.payload.conceptId;
          newState =  Object.assign({}, state);

          let selectedConceptBySId =  newState[sId] || [] ;

          const hasConceptId  = selectedConceptBySId.includes(conceptId);
          let newConceptSelectedList = [];
          if( hasConceptId ){
             newConceptSelectedList  = selectedConceptBySId.filter(val=> val!=conceptId);
          }else{
            newConceptSelectedList = [...selectedConceptBySId, conceptId];
          }
          newState[sId] =  newConceptSelectedList;

          return newState;
          break;
        case Actions.ALIGNED_REMOVE_CONCEPT_SELECTION :
                sId =  action.payload.sId,
                conceptId =  action.payload.conceptId;
            newState =  Object.assign({}, state);
                selectedConceptBySId =  newState[sId] || [] ;
                newConceptSelectedList  = selectedConceptBySId.filter(val=> val!=conceptId);
            newState[sId] =  newConceptSelectedList;
            return newState;
            break;
        case Actions.ALIGNED_CONCEPT_REQUEST_SENT:
            return {};
        default:
          return state;
           break;

      }
}

/**
 This state stores the master data for all the concept nodes, like all of the data from API
*/
const conceptMasterList = ( state = {}, action)=>{
    const type = action.type;
    let newState;
    switch( type ){
      case Actions.ALIGNED_CONCEPT_LIST_RES_SUCCESS :
        return action.payload;
        break;
      default:
        return state;
         break;
    }
}

/**
 State stores the currently selected/tapped curriculum ID

*/
const currentCurriCulumId = ( state = '', action)=>{
  const type = action.type;
  let newState;
  switch( type ){
    case Actions.ALIGNED_CHANGE_NODE_EXP_STATE :
      return action.payload.id;
      break;
    default:
      return state;
       break;
  }
}

/**
 State stores the currently selected/tapped curriculum ID

*/
const currentCurriCulumDesc = ( state = '', action)=>{
  const type = action.type;
  let newState;
  switch( type ){
    case Actions.ALIGNED_CHANGE_NODE_EXP_STATE :
      return action.payload.desc;
      break;
    default:
      return state;
       break;
  }
}

/**
 State stores the subjectId for currently selected/tapped curriculum ID
 Required for sending the request fetching all the concepts
*/
const subjectIdForCurrentCurriId = ( state = '', action)=>{
  const type = action.type;
  let newState;
  switch( type ){
    case Actions.ALIGNED_CHANGE_NODE_EXP_STATE :
      return action.payload.subjectCode;
      break;
    default:
      return state;
       break;
  }
}



export default {
  isCurriculumTreeLoading,
  isConceptsForCurriculumLoading,
  curriculumMetaData,
  expandedCurrNodesList,
  currentSId,
  currentSIdDesc,
  subjectIdForCurrentSId,
  conceptDataResponseCache,
  conceptDataForCurriculumNode,
  selectedConceptDetails,
  selectedSIdsList,
  conceptMasterList,
  currentCurriCulumId,
  currentCurriCulumDesc,
  subjectIdForCurrentCurriId
};
