import React, { Component } from 'react';

class Loader extends Component {

  render() {
    const { top, left, width, height, position} = this.props;
    return (
            <div style={{'top': top, 'height': height, "width": width, "left": left,
              'marginLeft': 'auto','marginRight': 'auto', position:position}}>
                <img src='https://media.giphy.com/media/lijuimVKUcwRa/giphy.gif'/>
            </div>
        )
  }
}
export default Loader;

Loader.defaultProps = {
  top : '100px',
  left : '100px',
  width : '100px',
  height : '100px',
  position :'relative'
}
