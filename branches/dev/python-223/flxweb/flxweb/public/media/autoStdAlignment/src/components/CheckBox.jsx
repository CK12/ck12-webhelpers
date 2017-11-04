import React, { Component } from 'react';

class CheckBox extends Component {

  render() {
    const {
          isSelected,
          handleCheckBoxChange
        } = this.props;

    return (
      <div style={Styles.checkBox} onClick={handleCheckBoxChange}>
        { isSelected  &&
          <span style={Styles.checkStyle}>&#x2714;</span>
        }
      </div>
        )
  }
}
export default CheckBox;

CheckBox.defaultProps = {
  isSelected : false,
  handleCheckBoxChange : ()=>({})
};

const Styles = {
  checkBox:{
    display: 'inline-block',
    overflow:'hidden',
    width : '25px',
    borderRadius : '5px',
    userSelect : 'none',
    cursor : 'default',
    height : '25px',
    zIndex : 10,
    borderRadius : '3px',
    border : '2px solid lightgrey',
    backgroundColor : 'white'
  },
  checkStyle:{
    fontSize: "21px",
    color: '#00ABA4',
    width: '100%',
    height: '100%',
    position: 'relative',
    fontWeight: 'bold'
  }
}
