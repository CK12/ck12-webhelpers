import {ActionMethods, ActionTypes} from '../actions/';

const { TriggerRouteChange } = ActionMethods;
/**
* The role of this middleware is to
1. intercept actions , validate the current store state and then trigger route change events
2. on APP_INIT. validate the current store state with respect to current url state and redirect if needed
*
*/

const _validateRouteToStdSelection = (store, action, pathname)=>{
  //should be admin
  const storeRef =  store.getState();
  const isAdmin  =  storeRef['isStdAdmin'];
  return isAdmin;
};

const _postValidationProcessing   = ( store, action , pathname)=>{
  if( !isAdmin ){
    store.dispatch(TriggerRouteChange('/'));
  }else{

  }
};

const _validateRouteToSubjectSelection = ( store, action )=>{
  const storeRef = store.getState();
  const isAdmin  =  storeRef['isStdAdmin'];
  const pathname = storeRef.routing.locationBeforeTransitions.pathname;

  if( !isAdmin ){
    store.dispatch(TriggerRouteChange('/'));
  }else{
    if( !currentCountry || !currentStandardCode ){
      store.dispatch(TriggerRouteChange('/standardSelection'));
    }
  }
};

const _validateRouteToContentSelection = ( store, action )=>{
  const storeRef = store.getState();
  const isAdmin  =  storeRef['isStdAdmin'];
  const pathname = storeRef.routing.locationBeforeTransitions.pathname;

  if( !isAdmin ){
    store.dispatch(TriggerRouteChange('/'));
  }else{

  }
};


const _validateRouting = ( store, action, pathname)=>{
  switch (pathname) {
  case '/standardSelection':
    _validateRouteToStdSelection( store, action, pathname);
    break;
  default:

  }
};

const init = ( store, action )=>{
  // get the current route and based on store state, redirect
  // based on the current state we can ask for validations
  const storeRef = store.getState();
  const pathname = storeRef.routing.locationBeforeTransitions.pathname;
  _validateRouting( store, action , pathname );

};

const routeChange = ( store, action) => {
  const type  = action.type;
  switch ( type ){
  case ActionTypes.SIGN_IN_PAGE_ACCESS_PROVIDED :
    _validateRouting( store, action , '/standardSelection' );
    break;
  case ActionTypes.STD_SELECTION_PROCEED_FORWARD:
    _validateRouting( store, action , '/selectSubjects' );
    break;
  case ActionTypes.SUB_SELECTION_PROCEED_FORWARD:
    _validateRouting( store, action , '/alignedConcepts' );
    break;
  }
};

export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.APP_INIT :
    // init(store, action); TODO
    break;
  case ActionTypes.SIGN_IN_PAGE_ACCESS_PROVIDED :
  case ActionTypes.ROUTE_MOVE_TO_STD_SELECTION:
    store.dispatch(TriggerRouteChange('standardSelection'));
    break;
  case ActionTypes.STD_SELECTION_PROCEED_FORWARD:
  case ActionTypes.ROUTE_MOVE_TO_SUB_SELECTION:
    store.dispatch(TriggerRouteChange('selectSubjects'));
    break;
  case ActionTypes.SUB_SELECTION_PROCEED_FORWARD:
  case ActionTypes.ROUTE_MOVE_TO_ALIGNED_CONCEPTS:
    store.dispatch(TriggerRouteChange('alignedConcepts'));
    break;
  }
};
