import React from 'react';
import Radium from 'radium';


const Header = ({children, size, style, weight='bold'}) =>
  <div style={[styles[size], styles[weight], styles['base'], style]}> {children} </div>;

const styles = {
  header1: {
    fontSize: 30
  },
  header2: {
    fontSize: 24
  },
  header3: {
    fontSize: 21
  },
  header4: {
    fontSize: 18
  },
  header5: {
    fontSize: 16
  },
  bold: {
    fontWeight: 'bold'
  },
  normal: {
    fontWeight: 'normal'
  },
  base: {
    display: 'inline-block'
  }
};

export default Radium(Header);
