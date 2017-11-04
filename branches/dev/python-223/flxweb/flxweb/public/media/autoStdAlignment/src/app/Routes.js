import React from 'react';
import App from './appContainer';

import Banner from '../containers/BannerContainer.jsx';
import Home from '../containers/HomeContainer.jsx';
import StandardsSelection from '../containers/StandardSelection.jsx';
import SelectSubjects from '../containers/SelectSubjects.jsx';
import AlignedConcepts from '../containers/AlignedConcepts.jsx';


let createComponentsWithProps = (Component, props) => {
  return ()=>React.createElement(Component,{...props});
};
const routes = (propConfig)=>({
  path: '/',
  component: App,
  indexRoute : {
    components: {
      banner: createComponentsWithProps(Banner, propConfig.banner),
      body:  createComponentsWithProps(Home, propConfig.login)
    }
  },
  childRoutes: [
    {
      path: 'standardSelection',
      components: {
        banner: createComponentsWithProps(Banner, propConfig.banner),
        body: createComponentsWithProps(StandardsSelection, propConfig.postLogin)
      }
    },
    {
      path: 'selectSubjects',
      components: {
        banner: createComponentsWithProps(Banner, propConfig.banner),
        body: createComponentsWithProps(SelectSubjects, propConfig.register)
      }
    },
    {
      path: 'alignedConcepts',
      components: {
        banner: createComponentsWithProps(Banner, propConfig.banner),
        body: createComponentsWithProps(AlignedConcepts, propConfig.register)
      }
    }
  ]
});


export  default routes;
