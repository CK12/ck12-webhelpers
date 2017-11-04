import React, { Component } from 'react';

class Loader extends Component {
  
  shouldComponentUpdate( nextProps, nextState){
    return false;
  }
  render() {
    const {
      loaderStyle,
      loaderImgSrc
    } = this.props;

    const loadStyle   = { ...Styles.loaderStyle, ...loaderStyle};

    return (
            <div style={loadStyle}>
                <img src={loaderImgSrc}/>
            </div>
        )
  }
}
export default Loader;

Loader.defaultProps = {
  loaderStyle : {},
  loaderImgSrc: '/media/images/loader.gif'
}

const Styles = {
  loaderStyle : {
    top : '100px',
    left : '100px',
    width : '100px',
    height : '100px',
    position :'relative',
    marginLeft : 'auto',
    marginRight : 'auto'
  }
}
