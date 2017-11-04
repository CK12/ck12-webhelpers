import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailSuccess from './EmailSuccess';
import Separator from './common/Separator';
import Input from './common/Input';
import Button from './common/Button';
import Link from './common/Link';
import Tooltip from './common/Tooltip';
import {readerDialog, sendEmail} from '../utils/requireBridge';
import {getCurrentArtifactID} from '../selectors/selectors';
import {isEmailValid} from '../utils/utils';
import * as Constants from '../constants/tooltips';

class FlexBookReader extends Component{
  constructor(){
    super();
    this.state = {
      error: false,
      success: false
    };
  }

  render(){
    let {success,error} = this.state;
    return (
      <div className='flexbookappinfo' style={styles.container}>
        <Separator/>
        <div style={styles.text}>Get the FlexBook® app for your mobile devices</div>
        <a target="_blank" href="https://itunes.apple.com/us/app/flexbook/id1011793723">
          <img style={styles.image} alt={Constants.DOWNLOAD_ON_APPSTORE} src="/media/common/images/apple-app-store.svg"/>
        </a>
        <a target="_blank" href="https://play.google.com/store/apps/details?id=org.ck12.reader">
        <img  style={styles.image} alt={Constants.DOWNLOAD_ON_GOOGLE_PLAY} src="/media/common/images/google-play-badge.png"/>
        </a>
        <Separator message='OR'/>
        {!success?
        (<div className='email-panel'>
          <div style={styles.emailText}>
            Enter email to get app download link:
          </div>
          <Tooltip type='error' message={Constants.INVALID_EMAIL} show={error} icon='notification'>
            <Input ref={(input)=>this._input = input} style={styles.input} placeholder='Email Address' handleFocus={()=>this.handleFocus()}/>
          </Tooltip>
          <Button
              color="blue"
              style={styles.button}
              handleClick={()=>this.sendEmail()}>
              Send Link
          </Button>
        </div>
        ):<EmailSuccess/>}
        <Separator/>
        <div onClick={()=>this.openDialog()}>
          <Link style={styles.link}>Looking for PDF?</Link>
        </div>
      </div>
    );
  }

  openDialog(){
    let {artifactID} = this.props;
    let options = {
      data: {
        artifactID
      }
    };
    readerDialog(options);
  }

  sendEmail(){
    let email = this._input.state.value;
    if(isEmailValid(email)){
      sendEmail(email);
      this.setState({
        success:true
      }); 
    }
    else
      this.raiseError();
  }

  raiseError(){
    this.setState({
      error: true
    });
  }

  handleFocus(){
    this.setState({
      error: false
    });
  }
}

const styles = {
  text:{
    textAlign:'center',
    paddingBottom:'10px'
  },
  emailText:{
    textAlign:'center',
    paddingBottom:'10px'
  },
  container: {
    fontSize: '13px'
  },
  icon: {
    color: '#00aba4',
    fontSize: '16',
    borderRadius: '20px',
    border: '3px solid',
    display: 'inline-block',
    margin: '5px',
    padding: '5px'
  },
  image: {
    width: 145,
    height: 43
  },
  link: {
    textAlign: 'center',
    display: 'block'
  },
  button: {
    width: '100%'
  },
  input: {
    marginBottom: 10
  }
};

const mapStateToProps = (state) => {
  let artifactID = getCurrentArtifactID(state);
  return {
    artifactID
  };
};

export default connect(
  mapStateToProps,
  null
)(FlexBookReader);
