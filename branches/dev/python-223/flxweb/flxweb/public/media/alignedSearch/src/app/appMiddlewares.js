/**
 * Created by pratyush on 18/06/16.
 */
import { applyMiddleware } from 'redux';

import reduxLogger from 'redux-logger';

import middlewares from '../middlewares/';

let combineMiddlewares =  ()=>{
  return [
    ...middlewares
  ].concat( __DEV__ ? [reduxLogger()]: []);
};


export default  (history) => {
  return applyMiddleware.apply(null, combineMiddlewares());
};
