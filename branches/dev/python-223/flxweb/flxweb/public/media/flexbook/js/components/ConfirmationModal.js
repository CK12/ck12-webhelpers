import React, {Component, PropTypes} from 'react';
import Modal from 'react-modal';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import {Row, Column} from 'react-foundation';

export default class ConfirmationModal extends Component {
  constructor(){
    super();
    this.state = {
      isOpen: true
    };
  }
  handleClose(){
    this.setState({
      isOpen: false
    });
    typeof this.props.callback == 'function' && this.props.callback();
  }
  handleClick(){
    this.props.action();
    this.handleClose();
  }
  render(){
    return(
      this.state.isOpen &&
      <Modal className='confirm_modal' style={styles.modal} isOpen={this.state.isOpen} contentLabel='Confirmation-Modal'>
        <span style={styles.close} onClick={()=>this.handleClose()}>
          ×
        </span>
        <Header size='header3' style={styles.headerStyle}>{this.props.title}</Header>
        <Row>
          <Column small={12}>
            <div style={styles.message}>Are you sure you want to {this.props.message}?</div>
          </Column>
        </Row>
        <Row>
          <Column small={12} style={styles.buttonContainer}>
            <Button color='turquoise' style={styles.leftButton} handleClick={()=>this.handleClick()}>OK</Button>
            <Button color='turquoise' handleClick={()=>this.handleClose()}>CANCEL</Button>
          </Column>
        </Row>
      </Modal>
    );
  }
}

ConfirmationModal.PropTypes = {
  message: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired
};

const styles = {
  modal: {
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.45)'
    },
    content: {
      borderRadius: '5px',
      padding: '15px 20px',
      backgroundColor: 'rgba(255, 255, 255,1)',
      width: '480px',
      margin: '0 auto',
      left: 0,
      right: 0,
      overflow: 'visible',
      bottom: 0,
      position: 'relative',
      top: 160,
      textAlign:' center'

    }
  },
  buttonContainer: {
    textAlign: 'center'
  },
  close: {
    backgroundColor: '#56544D',
    borderRadius: '50%',
    color: '#CEC9BE',
    cursor: 'pointer',
    fontSize: '30px',
    textAlign: 'center',
    position: 'absolute',
    right: '-14px',
    top: '-14px',
    width: '30px',
    lineHeight: '30px'
  },
  headerStyle: {
    textAlign: 'center',
    display: 'block'
  },
  message: {
    color: '#8F8E8A',
    lineHeight: '1.5em',
    padding: '15px 0 30px',
    wordWrap: 'break-word'
  },
  leftButton: {
    marginRight: '20px'
  }
};
