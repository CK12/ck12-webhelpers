import CommonActions from './CommonActions';
import SignInPageActions from './SignInPageActions';
import BannerActions from './BannerActions';
import StandardSelectionActions from './StandardSelectionActions';
import SubjectSelectionActions from './SubjectSelectionActions';
import AlignedActions from './AlignedActions';
import ModalActions from './ModalActions';
import RouteActions from './RouteActions';

let ActionsArray =  [
  CommonActions,
  SignInPageActions,
  BannerActions,
  StandardSelectionActions,
  SubjectSelectionActions,
  AlignedActions,
  ModalActions,
  RouteActions
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
