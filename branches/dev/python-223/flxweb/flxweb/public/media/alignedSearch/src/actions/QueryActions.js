import KeyMirror from '../utils/KeyMirror';

const moduleName = 'QUERY';

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
    'SELECT',
    'CHANGE',
    'FETCH',
    'FETCH_SUCCESS',
    'FETCH_FAILURE',
    'FETCH_CACHED'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const QueryCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const SelectQuery = actionGenerator(appendModuleName('SELECT'), true);

const ChangeQuery = actionGenerator(appendModuleName('CHANGE'), true);

const FetchQuery = actionGenerator(appendModuleName('FETCH'), true);

const FetchQueryResponseSuccess = actionGenerator(appendModuleName('FETCH_SUCCESS'), true);

const FetchQueryResponseFailure = actionGenerator(appendModuleName('FETCH_FAILURE'), true);

const FetchQueryResponseCached = actionGenerator(appendModuleName('FETCH_CACHED'), true);


export default {
  Actions,
  QueryCompInit,
  SelectQuery,
  ChangeQuery,
  FetchQuery,
  FetchQueryResponseSuccess,
  FetchQueryResponseFailure,
  FetchQueryResponseCached
};
