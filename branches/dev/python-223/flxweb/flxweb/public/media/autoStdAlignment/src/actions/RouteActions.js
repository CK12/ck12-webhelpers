import KeyMirror from '../utils/KeyMirror';

const moduleName = 'ROUTE';

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
    'MOVE_TO_STD_SELECTION',
    'MOVE_TO_SUB_SELECTION',
    'MOVE_TO_ALIGNED_CONCEPTS'

  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const MoveToStdSelection =  actionGenerator(appendModuleName('MOVE_TO_STD_SELECTION'));
const MoveToSubSelection =  actionGenerator(appendModuleName('MOVE_TO_SUB_SELECTION'));
const MoveToAlignedConcepts =  actionGenerator(appendModuleName('MOVE_TO_ALIGNED_CONCEPTS'));

export default {
  Actions,
  MoveToStdSelection,
  MoveToSubSelection,
  MoveToAlignedConcepts
};
