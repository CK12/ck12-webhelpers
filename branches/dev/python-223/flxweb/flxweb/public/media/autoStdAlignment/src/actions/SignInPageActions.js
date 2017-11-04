import KeyMirror from '../utils/KeyMirror';

const moduleName = 'SIGN_IN_PAGE';

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
    'NOT_LOGGED_IN',
    'ACCESS_FORBIDDEN',
    'ACCESS_PROVIDED',
    'DO_SIGN_IN'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const SingCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const notLoggedIn   = actionGenerator( appendModuleName('NOT_LOGGED_IN'));

const accessForbiden  = actionGenerator( appendModuleName('ACCESS_FORBIDDEN'));

const accessProvided  = actionGenerator( appendModuleName( 'ACCESS_PROVIDED'));

const doSignIn  =  actionGenerator( appendModuleName('DO_SIGN_IN'));

export default {
  Actions,
  SingCompInit,
  notLoggedIn,
  accessForbiden,
  accessProvided,
  doSignIn
};
