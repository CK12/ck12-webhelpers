import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import reducers from '../reducers/';

reducers.routing = routerReducer;

export default  () =>{
  return combineReducers( reducers );
};
