require('../scss/standardSelections.scss');

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose} from 'redux';
import { appReducers } from './reducers/reducers';
import StandardsApp from './standardsApp';
import thunkMiddleware from 'redux-thunk';



export const init = (config) =>{
    let targetElmID = config.id;
    const composeEnhancers = process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose;
    ReactDom.render(
        <Provider store={
            createStore(
                appReducers,
                composeEnhancers(
                    applyMiddleware(
                        thunkMiddleware
                    )
                )
            )
        }>
            <StandardsApp backboneRouter={config.router} showBooks={config.callback} initData={config.initailizedData}/>
        </Provider>
    , document.getElementById(targetElmID));
};
