import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';

import {
    Actions,
    ActionMethods
} from '../actions/'

const { BannerCompInit } = ActionMethods; // destructuring the methods required to send


class BannerContainer extends Component {

  componentWillMount(){
    const { action } = this.props;
    action.BannerCompInit();
  }
  render() {
    return (
          <div style={style.bannerContainer}>
          </div>
        )
  }
}

let mapStateToProps = (state, ownProps)=> {
  let instance = ownProps['instance'];
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  let instance = ownProps['instance'];
  return {
    action: bindActionCreators({
      BannerCompInit
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(BannerContainer)


const style = {
  bannerContainer :{
    height : '15px',
    width : '100%'
  }
}
