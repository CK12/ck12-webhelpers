import React from 'react';
import Icon from './common/Icon';

const EmailSuccess = () =>
  <div className="successpanel hide" style={styles.container}>
    <div style={styles.header}>Success!</div>
    <Icon style={styles.successpanel} name='checkmark' color='#b6d820'/>
    <div>Check your email for the app download link.</div>
  </div>;


const styles = {
  successpanel:{
    color: '#b6d820',
    fontSize: '16px',
    padding: '5px',
    border: '3px solid',
    borderRadius: '20px',
    display: 'inline-block',
    margin: '5px'
  },
  container: {
    width: '80%',
    margin: '0 auto',
    padding: '35px 0 0 0',
    textAlign: 'center',
    fontSize: '14px'
  },
  header: {
    color: '#b6d820'
  }
};

export default EmailSuccess;
