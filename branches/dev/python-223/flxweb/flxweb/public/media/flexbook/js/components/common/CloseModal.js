import React from 'react';
import Radium from 'radium';

const CloseModal = ({onClick}) =>
<div style={styles} onClick={()=>onClick()}>
  &#10005;
</div>;

const styles = {
  color: '#eee',
  background: '#b3b3b3',
  position: 'absolute',
  top: 0,
  right: 0,
  cursor: 'pointer',
  borderRadius: '0px',
  margin: '0px',
  width: '20px',
  height: '20px',
  fontSize: '16px',
  fontWeight: 'bold',
  ':hover':{
    background: '#707070'
  }
};

export default Radium(CloseModal);
