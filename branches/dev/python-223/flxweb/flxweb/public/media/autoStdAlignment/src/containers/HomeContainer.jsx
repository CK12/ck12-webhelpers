import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';
import { Link } from 'react-router';

import {
    ActionTypes,
    ActionMethods
} from '../actions/'

const {
    SingCompInit,
    doSignIn
        } = ActionMethods; // destructuring the methods required to send
// Components

import Loader from '../common/components/Loader.jsx';

class HomeContainer extends Component {

  constructor(props) {
    super(props);
    this.doSignIn = this.doSignIn.bind(this);
  }
  componentWillMount(){
    const { action } = this.props;
    action.SingCompInit();
  }
  render() {
    const { isLoginLoading, isSingedIn, isStdAdmin }  = this.props;
    return (
            <div>
                <div style={Styles.loginHeaderTxt}>
                      Welcome to CK-12 Automatic
                      Standards Alignment!
                </div>
                  { (isLoginLoading) &&
                      <div style={Styles.loginInstructionTxt}>
                        <Loader/>
                    </div>
                  }
                  { (!isLoginLoading && !isSingedIn) &&
                      <div style={Styles.loginInstructionTxt}>
                        Please <a onClick={this.doSignIn}>Sign In</a> to get started!
                    </div>
                  }
                  { isStdAdmin &&
                      <div style={Styles.loginInstructionTxt}>
                        Redirecting you to next page!
                    </div>
                  }
                  { (isSingedIn && !isStdAdmin)&&
                      <div style={Styles.loginInstructionTxt}>
                        Sorry, you are not authorized!
                    </div>
                  }
                <div style={Styles.stdMarketingContainer}>
                  Some HTML Text explaining what the product is
                </div>
            </div>

        )
  }

  doSignIn(val) {
    const { action } = this.props;
    action.doSignIn();
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
      SingCompInit,
      doSignIn
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);


const Styles = {
  loginHeaderTxt : {
    overflowWrap :'normal',
    width: '90%',
    left: '5%',
    height: '40px',
    fontSize: '34px',
    position: 'relative',
    marginTop : '30px'
  },
  loginInstructionTxt : {
    overflowWrap :'normal',
    width: '60%',
    left: '20%',
    height: '30px',
    fontSize: '28px',
    position: 'relative',
    marginTop : '10px'
  },
  stdMarketingContainer:{
    width: '80%',
    left: '10%',
    height: '500px',
    borderRadius : '20px',
    // background : "linear-gradient(white,lightgrey)",
    position: 'relative',
    fontSize : '30px',
    lineHeight : '500px',
    marginTop : '20px',
    boxShadow: '0px 3px 5px lightgrey'
  }
}
