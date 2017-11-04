import React , { Component } from 'react';
import { Provider }  from 'react-redux';
import configureStore from './Store';
import App from '../containers/app.jsx';
import { Router, Route, hashHistory } from 'react-router';

class AppContainer extends Component {
  constructor(props) {
    super(props);
    let { instances }  =  this.props;
    this.store = configureStore(instances );
    MathJax.Hub.Config(props.mathJaxConfig);

  }

  render() {
    let props  =  this.props;
    return (
            <Provider store = {this.store}>
              <Router history={hashHistory}>    
                <Route path="/" component={App}/>            
                <Route path="/:query" component={App}/>
              </Router>
            </Provider>
        );
  }
}

export default AppContainer;
