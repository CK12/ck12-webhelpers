import KeyMirror from '../utils/KeyMirror';

const moduleName = 'STD_SELECTION';

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
    'STD_BY_COUNTRY_RESPONSE_SUCCESS',
    'STD_BY_COUNTRY_RESPONSE_FAILURE',
    'COUNTRY_CHANGED',
    'STD_CHANGED',
    'STD_LIST_CHANGED',
    'PROCEED_FORWARD',
    'CLEAR_SELECTED_COUNTRY',
    'CLEAR_SELECTED_REGION',
    'CLEAR_SELECTED_STANDARD',
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const StdSelectionCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const StdSelectionAPISuccess =  actionGenerator( appendModuleName('STD_BY_COUNTRY_RESPONSE_SUCCESS'), true);

const StdSelectionAPIFailure =  actionGenerator( appendModuleName('STD_BY_COUNTRY_RESPONSE_FAILURE'), true);

const StdSelectionCountryChanged =  actionGenerator( appendModuleName('COUNTRY_CHANGED'), true);

const StdSelectionStandardChanged =  actionGenerator( appendModuleName('STD_CHANGED'), true);

const StdSelectionNextStep =  actionGenerator( appendModuleName('PROCEED_FORWARD'));

const StandardListChanged  =  actionGenerator( appendModuleName( 'STD_LIST_CHANGED'), true);

const clearSelectedCountry   =  actionGenerator( appendModuleName('CLEAR_SELECTED_COUNTRY'));

const clearSelectedRegion   =  actionGenerator( appendModuleName('CLEAR_SELECTED_REGION'));

const clearSelectedStandard   =  actionGenerator( appendModuleName('CLEAR_SELECTED_STANDARD'));


export default {
  Actions,
  StdSelectionCompInit,
  StdSelectionAPISuccess,
  StdSelectionAPIFailure,
  StdSelectionCountryChanged,
  StdSelectionStandardChanged,
  StdSelectionNextStep,
  StandardListChanged,
  clearSelectedCountry,
  clearSelectedRegion,
  clearSelectedStandard
};
