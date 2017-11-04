import React from 'react';
import Radium from 'radium';

const ButtonPair = ({position, children}) => {
  return (
    <div style={styles[position]}>
      {children}
    </div>
  );
};

const styles = {
  left: {
    float: 'left'
  },
  right:{
    float: 'right'
  }
};

export default Radium(ButtonPair);
