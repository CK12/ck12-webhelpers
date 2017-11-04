import KeyMirror from '../utils/KeyMirror';

const moduleName = 'ALIGNED';

const appendModuleName = (val)=>`${moduleName}_${val}`;
const actionGenerator  =  (type, isPayload = false )=>{
  return isPayload ?
          (payload)=>({
            type : Actions[type],
            payload
          }) :
          ()=>({
            type : Actions[type]
          }) ;
};

const _actions  =
  [
    'COMP_INIT',
    'FETCH_STANDARD_TREE',
    'STANDARD_TREE_SUCCESS',
    'STANDARD_TREE_FAILURE',
    'CHANGE_STD_ID',
    'FETCH_CONCEPTS_FOR_STD_ID',
    'CONCEPTS_RESPONSE_SUCCESS',
    'CACHE_CONCEPTS_RESPONSE',
    'CONCEPTS_RESPONSE_FAILURE',
    'CHANGE_NODE_EXP_STATE',
    'ADD_MULTI_NODE_EXP',
    'CHANGE_CONCEPT_SELECTION',
    'REMOVE_CONCEPT_SELECTION',
    'CONCEPT_LIST_RES_SUCCESS',
    'CONCEPT_LIST_RES_FAILURE',
    'ADD_CONCEPTS_RESPONSE_SUCCESS',
    'ADD_CONCEPTS_RESPONSE_FAILURE',
    'GENERATE_CSV',
    'CONCEPT_REQUEST_SENT'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const AlignedCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const AutoStandandardSuccess =  actionGenerator(appendModuleName('STANDARD_TREE_SUCCESS'), true);

const AutoStandandardFailure =  actionGenerator(appendModuleName('STANDARD_TREE_FAILURE'), true);

const ChangeStandardId =  actionGenerator(appendModuleName('CHANGE_STD_ID'), true);

const FetchConceptsForStandardId =  actionGenerator(appendModuleName('FETCH_CONCEPTS_FOR_STD_ID'));

const ConceptsResponseSuccess =  actionGenerator(appendModuleName('CONCEPTS_RESPONSE_SUCCESS'), true);

const CacheConceptsResponseSuccess =  actionGenerator( appendModuleName('CACHE_CONCEPTS_RESPONSE'), true);

const ConceptsResponseFailure =  actionGenerator(appendModuleName('CONCEPTS_RESPONSE_FAILURE'));

const ChangeNodeExpansionState =  actionGenerator(appendModuleName('CHANGE_NODE_EXP_STATE'), true);

const AddMultipleNodeForExpansion = actionGenerator(appendModuleName('ADD_MULTI_NODE_EXP'), true);

const ChangeConceptSelection  = actionGenerator( appendModuleName('CHANGE_CONCEPT_SELECTION'), true);

const RemoveConceptSelection  = actionGenerator( appendModuleName('REMOVE_CONCEPT_SELECTION'), true);

const conceptListResponseSuccess =  actionGenerator( appendModuleName('CONCEPT_LIST_RES_SUCCESS'), true);

const conceptListResponseFailure =  actionGenerator( appendModuleName('CONCEPT_LIST_RES_FAILURE'), true);

const addConceptResponseSuccess =  actionGenerator( appendModuleName('ADD_CONCEPTS_RESPONSE_SUCCESS'), true);

const addConceptResponseFailure =  actionGenerator( appendModuleName('ADD_CONCEPTS_RESPONSE_FAILURE'), true);

const createCSVForSelectedSId =  actionGenerator( appendModuleName('GENERATE_CSV'));

const AutoStandandardRequestSent =  actionGenerator( appendModuleName('CONCEPT_REQUEST_SENT'));

export default {
  Actions,
  AlignedCompInit,
  AutoStandandardSuccess,
  AutoStandandardFailure,
  ChangeStandardId,
  FetchConceptsForStandardId,
  ConceptsResponseSuccess,
  CacheConceptsResponseSuccess,
  ConceptsResponseFailure,
  ChangeNodeExpansionState,
  AddMultipleNodeForExpansion,
  ChangeConceptSelection,
  RemoveConceptSelection,
  conceptListResponseSuccess,
  conceptListResponseFailure,
  addConceptResponseSuccess,
  addConceptResponseFailure,
  createCSVForSelectedSId,
  AutoStandandardRequestSent
};
