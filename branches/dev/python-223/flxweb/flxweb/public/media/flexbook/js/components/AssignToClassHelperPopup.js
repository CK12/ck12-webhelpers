import React, {Component} from 'react';
import Button from './common/Button';
import Header from './common/Header';
import Popup from './common/Popup';
import {NEW_FEATURE, ASSIGN_TO_CLASS} from '../constants/tooltips';

class AssignToClassHelperPopup extends Component{
  render(){
    let {closePopup} = this.props;
    return (
      <Popup style={styles.container}>
        <div className='assigntoclasshelperpopup'>
          <Header size='header5'>{NEW_FEATURE}</Header>
          <div style={styles.text}> {ASSIGN_TO_CLASS} </div>
          <Button color='tangerine' style={styles.button} handleClick={()=>closePopup()}>OK</Button>
        </div>
      </Popup>
    );
  }

}

const styles = {
  container: {
    height: 'auto',
    width: '173px',
    border: '1px solid #d4d4d5',
    padding: '15px',
    borderRadius: '10px',
    zIndex: '10',
    position: 'relative',
    right: '10px'
  },
  text: {
    paddingTop: '8px',
    paddingBottom: '18px',
    fontSize: '14px'
  },
  button: {
    width: '100%'
  }
};

AssignToClassHelperPopup.propTypes = {
  closePopup: React.PropTypes.func
};

export default AssignToClassHelperPopup;
