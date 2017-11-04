import React , { Component } from 'react';
import { Provider }  from 'react-redux';
import configureStore from './Store';
import Routes from './Routes';
import { createHistory } from 'history';
import { Router, Route, browserHistory, useRouterHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import {setHistory} from './history';

class App extends Component {
  constructor(props) {
    super(props);
    let { instances }  =  this.props;
    this.store = configureStore(instances );
    let history = useRouterHistory(createHistory)({
      basename: '/autoStandard'
    });
    this.history =  syncHistoryWithStore( history,this.store );
    this.history.listen(location => console.log(location.pathname));
    setHistory(this.history);
  }

  render() {
    let props  =  this.props;
    return (
            <Provider store = {this.store}>
                <Router history = {this.history} routes={Routes(props)}>
                </Router>
            </Provider>
        );
  }
}

export default App;
