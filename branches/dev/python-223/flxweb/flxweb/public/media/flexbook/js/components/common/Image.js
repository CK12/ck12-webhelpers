import React from 'react';
import {imageLocationToURL} from '../../utils/utils.js';

class Image extends React.Component {
  constructor(){
    super();
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    if (this.props.onClick){
      e.preventDefault();
      //to do for the click
    }
  }
  render(){
    let props = this.props;
    let url = imageLocationToURL(props);

    return (
      <img
        src={url}
        className={props.className}
        style={props.style || styles.default}
        alt={props.title || ''}
        onClick={this.onClick.bind(this)}
        >
        {props.children}
      </img>
    );
  }
}


const styles = {
  default:{
    maxWidth: '100%',
    ':hover': {
      textDecoration: 'none'
    }
  }
};

export default Image;
