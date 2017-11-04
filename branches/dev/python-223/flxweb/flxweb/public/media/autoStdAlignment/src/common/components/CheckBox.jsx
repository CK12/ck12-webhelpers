import React, { Component } from 'react';

class CheckBox extends Component {
  
  shouldComponentUpdate( nextProps, nextState){
    return nextProps.isSelected != this.props.isSelected;
  }
  render() {
    const {
          isSelected,
          handleOnChange,
          checkBoxStyle,
          checkBoxTickStyle,
          tickContent
        } = this.props;

    return (
      <div style={checkBoxStyle} onClick={handleOnChange}>
        { isSelected  &&
          <span style={checkBoxTickStyle}>{tickContent}</span>
        }
      </div>
        )
  }
}
export default CheckBox;

CheckBox.defaultProps = {
  isSelected : false,
  handleOnChange : ()=>({}),
  checkBoxStyle : {},
  checkBoxTickStyle : {},
  tickContent:'\u2714'
};
