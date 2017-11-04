import React from 'react';
import Radium from 'radium';

const Topic = ({url, label}) => (
  <a title={label} className='subject-icon' style={styles.container} href={'/'+url+'/'}>
    <div style={styles.box}>
      <span style={styles.image} className={url}/>
      <span style={styles.label}>{label}</span>
    </div>
  </a>
);
const styles = {
  container: {
    cursor: 'pointer',
    margin: '10px 0 10px 0',
    ':hover': {
      background: '#d0f1e8'
    }
  },
  label:{
    whiteSpace: 'nowrap',
    color: '#00aba4',
    fontSize: '18px'
  },
  image:{
    margin:'-20px 20px'
  },
  box:{
    paddingLeft: '40px',
    paddingBottom: '40px'
  }
};

export default Radium(Topic);
