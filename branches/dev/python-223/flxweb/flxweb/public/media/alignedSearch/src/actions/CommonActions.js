import KeyMirror from '../utils/KeyMirror';

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
    'APP_INIT',
    'TRIGGER_ROUTE_CHANGE'
  ];

const Actions = KeyMirror( _actions.map(val=>val));

const AppInit =  actionGenerator(('APP_INIT'));

const TriggerRouteChange =  actionGenerator(('TRIGGER_ROUTE_CHANGE'), true);


export default {
  Actions,
  AppInit,
  TriggerRouteChange
};
