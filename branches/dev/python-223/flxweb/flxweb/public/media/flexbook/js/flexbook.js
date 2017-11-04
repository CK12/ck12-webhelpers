import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import FlexBookDetails from './components/FlexBookDetails.js';
import ShareOPlane from './components/ShareOPlane';


import configureStore from './store/store';

var  flexBookStore = configureStore();

const init = (location, elm) => {
  location = decodeURI(location);
  render( (
    <Provider store={flexBookStore}>
      <FlexBookDetails location={location} />
    </Provider>
  ), elm);
  render( (
    <Provider store={flexBookStore}>
      <ShareOPlane/>
    </Provider>
  ),document.getElementById('sharePlaneWrapper'));
};

export {
  init,
  flexBookStore
};
