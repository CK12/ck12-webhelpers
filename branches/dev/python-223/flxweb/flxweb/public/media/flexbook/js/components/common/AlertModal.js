/*
How to use the Alert Modal
  HeaderText: It is the heading of the alert notification.
  contentBody: It is the content of the alert.
  onRequestClose: Click elsewhere to close the modal. Default it is false.
  callbackParent: Notify the parent of closing of the modal.
  state: Pass the state to activate the modal.
*/

import React from 'react';
import Modal from 'react-modal';

class AlertModal extends React.Component {
  constructor () {
    super();
    this.state = {
      open: false,
      onRequestClose: false
    };
  }

  shouldComponentUpdate(nextProps){
    return nextProps.state;
  }

  componentDidMount(){
    this.setState({open: this.props.state});
  }

  componentWillReceiveProps(){
    let requestState = !!this.props.onRequestClose;
    this.setState({open: this.props.state,onRequestClose: requestState});
  }

  closeModal () {
    let val = false;
    this.setState({open: val});
    this.props.callbackParent(val);
  }

  requestCloseFn(){
    if(this.props.onRequestClose){
      this.closeModal();
    }
  }

  render() {
    let headText = (this.props.headerText) ? this.props.headerText : '';
    let bodyText = (this.props.contentBody) ? this.props.contentBody : '';
    return (
      <div>
        {   <Modal contentLabel='Alert-Modal' isOpen={this.state.open} onRequestClose={()=>this.requestCloseFn()} style={customStyles}>
        <div style={styles.zholder}>
          <div style={styles.header}>{headText}</div>
          <div style={styles.close} onClick={()=>this.closeModal()}>+</div>
          <div style={styles.content}>{bodyText}</div>
          <div style={styles.modalActions}><div className="button turquoise" onClick={()=>this.closeModal()}>OK</div></div>
        </div>
      </Modal>
    }
  </div>
    );
  }
}

const customStyles = {
  overlay : {
    top: '0px',
    bottom: '0px',
    left: '0px',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(204, 204, 204,0.6)',
  },
  content : {
    textAlign: 'center',
    width: '480px',
    color: '#000',
    border: '2px solid #ccc',
    borderRadius: '5px',
    marginTop: '190.5px',
    margin: 'auto',
    maxWidth: '93%',
    maxHeight: '95%',
    minWidth: '270px',
    minHeight: '75px',
    background: '#fff',
    position: 'relative',
    top: '40vh',
    overflow: 'visible'
  }
};

const styles = {
  mcontainer:{
    display: 'block',
    position: 'fixed',
    cursor: 'pointer',
    background: '#000',
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px',
    bottom: '0px',
    right: '0px',

  },
  zholder:{
    zIndex: '10000',
  },
  header:{
    color: '#56544D',
    fontSize: '1.2em',
    fontWeight:'bold',
    paddingTop:'15px',
  },
  close:{
    background: '#56544D',
    borderRadius: '30px',
    color: '#CEC9BE',
    cursor: 'pointer',
    fontFamily: 'times new roman',
    fontSize: '30px',
    lineHeight: '30px',
    fontWeight: 'normal',
    padding: '0px',
    position: 'absolute',
    right: '-14px',
    top: '-14px',
    width: '30px',
    height: '30px',
    textAlign: 'center',
    textShadow: 'none',
    transform: 'rotate(45deg)'
  },
  content:{
    color: '#8F8E8A',
    lineHeight: '1.5em',
    padding: '15px 0 30px',
    wordWrap: 'break-word'
  },
  modalActions:{
    textAlign: 'center'
  }
};

export default AlertModal;
