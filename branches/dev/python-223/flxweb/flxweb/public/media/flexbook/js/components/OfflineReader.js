import React from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import Button from './common/Button.js';
import {getFlexBookArtifact} from '../selectors/selectors.js';
import {isEmailValid} from '../utils/utils';
import EmailSuccess from './EmailSuccess';
import {sendEmail} from '../utils/requireBridge';
import Input from './common/Input';
import Link from './common/Link';
import * as Constants from '../constants/tooltips';
class OfflineReader extends React.Component {
  constructor () {
    super();
    this.state = {
      open: false,
      error: false,
      success:false
    };
  }

  openModal () {
    this.setState({open: true});
  }

  componentDidMount(){
     this.openModal();
  }

  closeModal () {
    let val = false;
    this.setState({open: val});
    this.props.callbackParent(val);
  }

  sendEmail(){
    let email = this._input.state.value;
    if(isEmailValid(email)){
      this.setState({
        success:true
      });
      sendEmail(email)
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

  render() {
    let {flexbookID} = this.props,
    {error, success} = this.state;
    return (
      <Modal contentLabel='OfflineReader-Modal' isOpen={this.state.open} style={customStyles}>
        <div style={styles.close} onClick={()=>this.closeModal()}>
          <img src="/media/reader/images/close_x.png"/>
        </div>
        <div style={styles.leftContainer}>
          <div style={styles.leftHeader}>
            Open immediately in the FlexBook® Reader
          </div>
          <div className="reader-dialog-leftpanel-logo">
            <img src="/media/reader/images/flexbook_logo_white.png"/>
          </div>
          <ul style={{margin:'20px 125px'}}>
            <li style={styles.list}> - Read FlexBooks® Offline</li>
            <li style={styles.list}> - Manage Books In One Place</li>
            <li style={styles.list}> - Distraction-Free Interface</li>
          </ul>
          <Link target='_blank' href={'/reader/reader-index.html#book/'+flexbookID}>
            <Button
              style={{top:'5px',padding: '10px 30px'}}
              color='tangerine'>
              Open in Reader
            </Button>
          </Link>
        </div>
        <div style={styles.rightContainer}>
          <div style={styles.rightHeader}>
            Download <br/> CK-12 FlexBooks® App
          </div>
          <div style={styles.store}>
            <Link title="Download on the app store" href="https://itunes.apple.com/us/app/flexbook/id1011793723?mt=8" target="_blank">
              <img src="/media/reader/images/apple_store.png"/>
            </Link>
          </div>
          <div style={styles.store}>
            <Link title="Get it on Google play" href="https://play.google.com/store/apps/details?id=org.ck12.reader" target="_blank">
              <img src="/media/reader/images/google_play.png"/>
            </Link>
          </div>
          <div style={styles.flexbookApp}>
            <img style={{width:'75px'}} src="/media/reader/images/flexbook_app_logo.png"/>
          </div>
          <br/>
          {!success?
          (<div style={{padding:'30px 15px',fontSize:'14px'}}>
            Enter your email address below to be sent a download link:
            <div className="tooltip-left hide">{Constants.INVALID_EMAIL}</div>
            <div style={{paddingTop:'10px'}}>
              <Input  ref={(input)=>this._input = input} 
                      style={styles.input} 
                      placeholder="Email Address"
                      handleFocus={()=>this.handleFocus()}/>
              {error && 
                (<span>
                  <div className='tooltip-left' style={styles.tooltip}>Invalid Email Address</div>
                  <i style={styles.icon} className="icon-notification"/>
                </span>)
              }
            </div>
            <Button
              color="blue"
              style={styles.sendButton}
              handleClick={()=>this.sendEmail()}>
              Send Link
            </Button>
          </div>):
          <EmailSuccess/>}
        </div>
      </Modal>
    );
  }
}

const customStyles = {
  overlay : {
    top: '0px',
    bottom: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  content : {
    textAlign: 'center',
    width: '700px',
    height: '400px',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    marginTop: '190.5px',
    margin: 'auto',
    background: '#FFFFF',
    position: 'relative',
    top:'0px',
    overflow: 'visible'
  }
};

const styles = {
  tooltip:{
    backgroundColor: '#ffeaef',
    position: 'absolute',
    left: '-190px',
    width: '200px',
    fontSize: '16px',
    fontWeight: 'normal',
    padding: '5px',
    border: '1px solid #d0241b',
    bottom: '75px'
  },
  icon:{
    color: '#D9491A',
    fontSize: '24px',
    bottom: '80px',
    right: '25px',
    position:'absolute'
  },
  input:{
    backgroundColor: '#F2F2F3',
    textAlign: 'center',
    fontSize: '16px',
    border:'none'
  },
  sendButton:{
    padding:'10px 65px',
    whiteSpace:'nowrap',
    fontSize:'16px'
  },
  store:{
    width:'105px',
    marginLeft: '30px',
    paddingTop:'5px'
  },
  flexbookApp:{
    right:'30px',
    top:'105px',
    position:'absolute'
  },
  rightContainer:{
    position:'absolute',
    right:'0px',
    top:'0px',
    left: '465px',
    background: '#FFFFFF',
    height: '100%'
  },
  leftContainer:{
    background: '#328dc7',
    width:'465px',
    position: 'absolute',
    left: '0px',
    top: '0px',
    height: '100%'
  },
  list:{
    lineHeight: '19px',
    listStyleType: 'none',
    margin: '0px',
    color:'#FFFFFF',
    textAlign: 'left',
  },
  leftHeader:{
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    lineHeight: '22px',
    margin: '0 auto',
    width: '50%',
    padding: '50px 0 25px 0'
  },
  rightHeader:{
    color: '#00000',
    fontSize: '18px',
    fontWeight: 'bold',
    lineHeight: '22px',
    margin: '0 auto',
    padding: '50px 0 20px 0'
  },
  close:{
    cursor: 'pointer',
    position: 'absolute',
    right: '10px',
    top: '10px',
    zIndex: 1
  }
};

const mapStateToProps = (state) =>{
  let {id:flexbookID} = getFlexBookArtifact(state);
  return {
    flexbookID,
  };
};

export default connect(
  mapStateToProps,
  null
)(OfflineReader);
