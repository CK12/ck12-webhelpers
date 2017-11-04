import KeyMirror from '../utils/KeyMirror';

const moduleName = 'CAROUSEL';

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
    'EXPAND'
  ];

const Actions = KeyMirror( _actions.map(val=>appendModuleName(val)));

const CarouselCompInit =  actionGenerator(appendModuleName('COMP_INIT'));

const SelectCarouselIndex =  actionGenerator(appendModuleName('SELECT'), true);

const ToggleExpand = actionGenerator(appendModuleName('EXPAND'), true);

export default {
  Actions,
  CarouselCompInit,
  SelectCarouselIndex,
  ToggleExpand
};