/*
How to use the TopNotification
  content: It is the content of the top notification
  callbackParent: Notify the parent on animation end
*/

import React from 'react';
import Radium from 'radium';

class TopNotification extends React.Component {
  constructor(){
    super();
    this.callbackParent = this.callbackParent.bind(this);
  }

  componentWillUnmount(){
    document.getElementById('top_notification').removeEventListener("animationend", this.callbackParent);
  }

  callbackParent(){
    this.props.callbackParent();
  }

  componentDidMount(){
    document.getElementById('top_notification').addEventListener("animationend", this.callbackParent);
  }
  
  render(){
    return (
     <div id='top_notification' style={styles.content}>
        {this.props.content}  
        <span style={styles.close} onClick={()=> this.callbackParent()}>+</span>
      </div>
    );
  }
}

const notificationKeyFrames = Radium.keyframes({
  '50%': {
    marginTop: '0px'
  }
});

const styles = {
  close:{
    transform: 'rotate(45deg)',
    float: 'right',
    color: '#aec796',
    fontSize: '30px',
    width: '30px',
    height: '30px',
    lineHeight: '30px',
    fontWeight: 'normal',
    cursor: 'pointer'
  },
  content:{
    position: 'fixed',
    zIndex: '101',
    top: '0px',
    left: '0px',
    right: '0px',
    textAlign: 'center',
    backgroundColor: '#78a250',
    fontWeight: 'bold',
    height: '42px',
    width: 'auto',
    padding: '10px',
    marginTop: '-50px',
    animation: 'x 5s',
    animationName: notificationKeyFrames
  }
};

export default Radium(TopNotification);
