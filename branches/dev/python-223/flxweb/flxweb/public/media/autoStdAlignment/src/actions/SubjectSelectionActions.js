import KeyMirror from '../utils/KeyMirror';

const moduleName = 'SUB_SELECTION';

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
    'SUB_SELECTION_CHANGED',
    'PROCEED_FORWARD'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const SubSelectionCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const SubSelectionCheckChanged =  actionGenerator( appendModuleName('SUB_SELECTION_CHANGED'), true);

const SubSelectionProceedForward =  actionGenerator( appendModuleName('PROCEED_FORWARD'));


export default {
  Actions,
  SubSelectionCompInit,
  SubSelectionCheckChanged,
  SubSelectionProceedForward
};
