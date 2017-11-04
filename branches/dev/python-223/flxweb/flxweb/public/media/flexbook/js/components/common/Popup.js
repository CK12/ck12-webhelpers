import React, {Component} from 'react';
import Radium from 'radium';

@Radium
class Popup extends Component{
  render(){
    let {children, style, className} = this.props;
    return (
      <div
        style={[styles.container, style]}
        className={className}>
        {children}
      </div>
    );
  }
}

const styles = {
  container: {
    backgroundColor: 'white',
    boxShadow: '0 0 20px #ccc',
    height: 200,
    position: 'absolute',
    right: 0,
    width: 500,
    zIndex: 100
  }
};

export default Popup;
