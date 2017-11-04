import { combineReducers } from 'redux';
import reducers from '../reducers/';


export default  () =>{
  return combineReducers( reducers );
};
