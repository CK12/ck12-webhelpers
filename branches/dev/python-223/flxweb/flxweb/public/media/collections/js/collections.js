import React from 'react'; // eslint-disable-line no-unused-vars
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import Collections from './containers/Collections';
import Subjects from './components/Subjects';
import {MathBrowse, ScienceBrowse, EnglishBrowse} from './components/SubjectBrowse';
import configureStore from './store/store';
import {browserHistory, Router, Route} from 'react-router';


let  collectionStore = configureStore();

const init = (elm) => {
  render( (
    <Provider store={collectionStore}>
      <Router history={browserHistory}>
        <Route path="/browse" component={Subjects} />
        <Route path="/math" component={MathBrowse} />
        <Route path="/science" component={ScienceBrowse} />
        <Route path="/english" component={EnglishBrowse} />
        <Route path="/c(/:realm)/:subject" component={Collections} />
      </Router>

    </Provider>
  ), elm);
};

export {
  init,
  collectionStore
};
