/**
 * Created by pratyush on 18/06/16.
 */
import { applyMiddleware } from 'redux';

import reduxLogger from 'redux-logger';

import { browserHistory } from 'react-router';

import { routerMiddleware } from 'react-router-redux';


// const routingMiddleware =

import middlewares from '../middlewares/';

let finalMiddlewares =  [
  ...middlewares
  // routingMiddleware
].concat( LOG_ENABLED ? [reduxLogger()]: []);

export default  (history) => {
  return applyMiddleware.apply(null, finalMiddlewares);
};
