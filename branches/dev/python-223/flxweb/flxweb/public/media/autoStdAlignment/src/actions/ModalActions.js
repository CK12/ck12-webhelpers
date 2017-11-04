import KeyMirror from '../utils/KeyMirror';

const moduleName = 'MODAL';

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
    'OPEN_ADD_CONCEPT_MODAL',
    'CLOSE_ADD_CONCEPT_MODAL',
    'OPEN_GENERATE_FLEXBOOK_MODAL',
    'CLOSE_GENERATE_FLEXBOOK_MODAL',
    'OPEN_FLEXBOOK_SUCCESS_MODAL',
    'CLOSE_FLEXBOOK_SUCCESS_MODAL',
    'CHANGE_SUBJECT',
    'CONCEPT_SELECTED',
    'CHANGE_CONCEPT_LIST_FOR_SUB_CODE'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const OpenAddConceptModal =  actionGenerator(appendModuleName('OPEN_ADD_CONCEPT_MODAL'), true);

const CloseAddConceptModal =  actionGenerator(appendModuleName('CLOSE_ADD_CONCEPT_MODAL'));

const OpenGenerateFlexbookModal =  actionGenerator(appendModuleName('OPEN_GENERATE_FLEXBOOK_MODAL'));

const CloseGenerateFlexbookModal =  actionGenerator(appendModuleName('CLOSE_GENERATE_FLEXBOOK_MODAL'));

const OpenFlexbookSucessModal =  actionGenerator(appendModuleName('OPEN_FLEXBOOK_SUCCESS_MODAL'));

const CloseFlexbookSuccessModal =  actionGenerator(appendModuleName('CLOSE_FLEXBOOK_SUCCESS_MODAL'));

const ChangeSubjectForModalSelect = actionGenerator( appendModuleName('CHANGE_SUBJECT'), true);

const ConceptSelectedForAddition = actionGenerator( appendModuleName('CONCEPT_SELECTED'), true);

const ChangeConceptListForSubjectCode  = actionGenerator( appendModuleName('CHANGE_CONCEPT_LIST_FOR_SUB_CODE'), true);

export default {
  Actions,
  OpenAddConceptModal,
  CloseAddConceptModal,
  OpenGenerateFlexbookModal,
  CloseGenerateFlexbookModal,
  OpenFlexbookSucessModal,
  CloseFlexbookSuccessModal,
  ChangeSubjectForModalSelect,
  ConceptSelectedForAddition,
  ChangeConceptListForSubjectCode
};
