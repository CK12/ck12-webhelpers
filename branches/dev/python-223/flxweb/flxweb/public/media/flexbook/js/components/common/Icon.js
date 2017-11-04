import React from 'react';
import Radium from 'radium';

const Icon = ({dataTip, style, name, size='regular', color='inherit'}) =>
  <i data-tip={dataTip} className={`icon-${name}`} style={[{color: color}, styles[size], style]}/>;

const styles = {
  xxlarge: {
    fontSize: 30
  },
  xlarge:{
    fontSize: 25
  },
  large: {
    fontSize: 20
  },
  regular: {
    fontSize: 16
  },
  small: {
    fontSize: 14
  },
  xsmall: {
    fontSize: 12
  }
};

Icon.propTypes = {
  name: React.PropTypes.string.isRequired,
  size: React.PropTypes.string,
  color: React.PropTypes.string
};

export default Radium(Icon);
