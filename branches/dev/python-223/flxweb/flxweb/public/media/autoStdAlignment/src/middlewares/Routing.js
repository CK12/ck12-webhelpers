import {ActionTypes} from '../actions/';

import { getHistory } from '../app/history';

let history;

const init = ( store, action )=>{
  history =  getHistory();
};

const routeChange = ( store, action) => {
  const path  = action.payload;
  history.push(path);
};

export default store =>  next => action => {
  
  switch ( action.type ){
  case ActionTypes.APP_INIT :
    init(store, action);
    break;
  case ActionTypes.TRIGGER_ROUTE_CHANGE :
    routeChange(store, action);
    break;
  }
  next(action);
};
