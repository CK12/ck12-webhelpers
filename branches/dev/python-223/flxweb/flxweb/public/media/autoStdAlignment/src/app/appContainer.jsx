/**
 *  Acts as the base template around which nested routing will take place.
 */
import { connect } from 'react-redux';

import React, { Component } from 'react';

import { bindActionCreators } from 'redux';

import {
    ActionMethods
} from '../actions/'

const {
    AppInit
        } = ActionMethods; // destructuring the methods required to send

class AppContainer extends Component{
  constructor( props ){
    super( props )
  }
  componentWillMount(){
    const { action } = this.props;
    action.AppInit();
  }
  render(){
    let { banner, body } =  this.props;
    return (
        <div>
            <div style={Styles.bannerContainer}>
                {banner}
            </div>
            <div style={Styles.bodyContainer}>
                {body}
            </div>
        </div>
    )
  }
}
let mapStateToProps = (state, ownProps)=> {
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  return {
    action: bindActionCreators({
      AppInit
    }, dispatch)
  }
};

// export default AppContainer;
export default connect(mapStateToProps,mapDispatchToProps)(AppContainer)
const Styles =  {
    bannerContainer : {

    },
    bodyContainer : {
      textAlign  : 'center',
      position : 'relative',
      top : '10px'
    }
}
