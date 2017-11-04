import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';


import {
    Actions,
    ActionMethods
} from '../actions/'

const {
    SubSelectionCompInit,
    SubSelectionCheckChanged,
    SubSelectionProceedForward
        } = ActionMethods; // destructuring the methods required to send

class BreadCrumb extends Component {

  render() {
    const {
          currentStandardCode,
          currentCountryCode,
          currentRegionCode
        } = this.props;
    return (
          <div>
            <span ><a>Standards</a></span>  >
            <span ><a>{currentCountryCode}</a></span>  >
            <span >{currentStandardCode}</span>
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
      SubSelectionCompInit,
      SubSelectionCheckChanged,
      SubSelectionProceedForward
    }, dispatch)
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(BreadCrumb);

const Styles = {
  checkBox:{
    display: 'inline-block',
    overflow:'hidden',
    width : '25px',
    borderRadius : '5px',
    userSelect : 'none',
    cursor : 'default',
    height : '25px',
    zIndex : 10,
    borderRadius : '3px',
    border : '1px solid',
    backgroundColor : 'white'
  },
  checkStyle:{
    fontSize: "24px",
    color: '#00ABA4',
    width: '100%',
    height: '100%',
    position: 'relative',
    fontWeight: 'bold'
  }
}
