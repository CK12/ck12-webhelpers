import React, {PropTypes} from 'react';
import Radium from 'radium';
import Icon from './Icon';

/*Dumb Tooltip element to that displays an error or success message on the side*/ 

const Tooltip = ({show = false,children, type, message, icon}) => {
  return(
    <div style={styles.container}>
    <div style={[styles.tooltip, styles[type].style, show?[]: styles.hide]}>
      <span style={[styles.before.style, styles.before[type]]}/>
      <span style={styles.tooltipTriangle}/>
      <span style={[styles.after.style, styles.after[type]]}/>
      {message}
    </div>
      {children}
      {icon && show && <Icon name={icon} style={[styles.icon, styles[type].color]}/>}
    </div>
  );
};



const styles = {
  container: {
    display: 'relative'
  },
  icon: {
    position: 'absolute',
    right: '20px',
    zIndex: 10,
    bottom: '112px'
  },
  tooltip: {
    position: 'absolute',
    display: 'block',
    width: '163px',
    zIndex: 10
  },
  before:{
    style:{
      content: '',
      position: 'absolute',
      width: 0,
      height: 0,
      borderWidth: '10px',
      borderStyle: 'solid',
      top: '7px',
      left: '-20px'
    },
    error: {
      borderColor: 'transparent  #d0241b transparent transparent'
    }
  },
  after:{
    style:{
      content: '',
      position: 'absolute',
      width: 0,
      height: 0,
      borderWidth: '9px',
      borderStyle: 'solid',
      top: '8px',
      left: '-18px'
    },
    error: {
      borderColor: 'transparent  #ffeaef transparent transparent'
    }
  },
  borderColour: {
    error: '#d0241b'
  },
  error: {
    style: {
      backgroundColor: '#ffeaef',
      fontSize: '16px',
      padding: '5px',
      border: '1px solid #d0241b',
      left: '98%'
    },
    color: {
      color: '#d0241b'
    }
  },
  hide: {
    display: 'none'
  }
};

Tooltip.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  show: PropTypes.bool,
  icon: PropTypes.string
};

export default Radium(Tooltip);
