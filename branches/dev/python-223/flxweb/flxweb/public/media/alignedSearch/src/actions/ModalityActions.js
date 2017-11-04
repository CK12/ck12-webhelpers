import KeyMirror from '../utils/KeyMirror';

const moduleName = 'MODALITY';

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
    // 'COMP_INIT',
    'SELECT',
    'FETCH',
    'FETCH_SUCCESS',
    'FETCH_FAILURE',
    'FETCH_CACHED'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

// const ModalityCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const SelectModality =  actionGenerator(appendModuleName('SELECT'), true);

const FetchModality =  actionGenerator(appendModuleName('FETCH'), true);

const FetchModalityResponseSuccess =  actionGenerator(appendModuleName('FETCH_SUCCESS'), true);

const FetchModalityResponseFailure =  actionGenerator(appendModuleName('FETCH_FAILURE'), true);

const FetchModalityResponseCached =  actionGenerator(appendModuleName('FETCH_CACHED'), true);

export default {
  Actions,
  // ModalityCompInit,
  SelectModality,
  FetchModality,
  FetchModalityResponseSuccess,
  FetchModalityResponseFailure,
  FetchModalityResponseCached
};
