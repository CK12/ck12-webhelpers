import KeyMirror from '../utils/KeyMirror';

const moduleName = 'BANNER';

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
    'COMP_INIT'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const BannerCompInit =  actionGenerator(appendModuleName('COMP_INIT'));


export default {
  Actions,
  BannerCompInit
};
