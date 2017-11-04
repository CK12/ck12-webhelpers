import React, {Component} from 'react';
import Modal from 'react-modal';
import Link from '../components/common/Link';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import {Row, Column} from 'react-foundation';

export default class  MessageModal extends Component {
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
    this.props.callback && this.props.callback();
  }
  render(){
    let {title, content, icon, styled,loading, iconClass, isMobile} = this.props;
    if(isMobile)
    {
      styles.modal.content.width = '100%';
      styles.modal.content.height = '100%';
    }

    let modalStyles = styled? this.modifyModalStyles(): styles.modal;
    return(
      this.state.isOpen &&
      <Modal contentLabel='MessageModal' style={modalStyles} isOpen={this.state.isOpen}>
        <div style={styles.headerStyle}>{title}</div>
        {
            icon && (
              <Row>
                <Column small={12} style={styles.iconContainer}>
                  <div className={iconClass}>
                    <Icon style={styles.icon} size='xlarge' name={icon}/>
                  </div>
                </Column>
              </Row>
            )
        }
        <Row>
          <Column small={12} style={{textAlign:'center'}}>
            {content}
          </Column>
        </Row>
        {!loading && <Row>
          <Column small={12} style={styles.buttonContainer}>
            <Button color={isMobile?'turquoiseMobile':'turquoise'} handleClick={()=>this.handleClose()}>OK</Button>
          </Column>
        </Row>}
      </Modal>
    );
  }

  modifyModalStyles(){
    let newStyles = Object.assign({}, styles.modal);
    newStyles.content.width = '400px';
    newStyles.content.padding = '15px 0px';
    return newStyles;
  }
}

const styles = {
  modal: {
    overlay: {
      top: '0px',
      bottom: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: 'rgba(0,0,0,0.45)',
      zIndex:1001
    },
    content: {
      borderRadius: '5px',
      padding: 30,
      backgroundColor: 'rgba(255, 255, 255,1)',
      width: '60%',
      margin: '0 auto',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      position: 'relative'
    }
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: 20
  },
  iconContainer: {
    textAlign: 'center',
    lineHeight: '46px'
  },
  headerStyle: {
    textAlign: 'center'
  },
  icon: {
    position:'absolute',
    margin: '12px -12px'
  }
};
