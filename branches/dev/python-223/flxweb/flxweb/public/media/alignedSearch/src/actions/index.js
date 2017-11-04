import CommonActions from './CommonActions';
import QueryActions from './QueryActions';
import ModalityActions from './ModalityActions';
import CarouselActions from './CarouselActions';

let ActionsArray =  [
  CommonActions,
  CarouselActions,
  QueryActions,
  ModalityActions
];

let ActionTypes  = {} ;
let ActionMethods = {};

ActionsArray.forEach( actionsClass=>{
  const  { Actions, ...actionMethodList } =  actionsClass;
  ActionTypes =  { ...Actions, ...ActionTypes };
  ActionMethods =  { ...actionMethodList, ...ActionMethods };
});

/**
* In here we merge all Actions into one and all all
*
*/
export {
  ActionTypes,
  ActionMethods
};
