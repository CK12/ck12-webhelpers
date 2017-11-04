import React from 'react';
import Radium from 'radium';

const Separator = ({style,className, size='default', message=''}) =>{
  if(message)
    return (
      <div style={styles.messageContainer}>
        <div style={styles.message}>{message}</div>
      </div>
    );
  return (
    <div
      className={className}
      style={[styles.base, styles[size], style]}/>);

};

const styles = {
  base: {
    borderTop: '1px solid #ddd'
  },
  default:{
    marginTop: '1.25em',
    marginBottom: '1.1875em'
  },
  mini: {
    marginTop: '6px',
    marginBottom: '6px'
  },
  medium: {
    margin: '10px 0'
  },
  message: {
    textTransform: 'uppercase',
    position: 'absolute',
    left: '50%',
    top: '-8px',
    background: '#F9F9F5',
    transform: 'translateX(-50%)',
    width: 30,
    fontSize: '16px',
    textAlign: 'center'
  },
  messageContainer: {
    position: 'relative',
    borderTop: '1px solid #328dc7',
    margin: '20px 0'
  }
};
export default Radium(Separator);
