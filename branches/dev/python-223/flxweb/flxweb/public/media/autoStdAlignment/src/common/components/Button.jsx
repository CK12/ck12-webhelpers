/**
* Generic Button Component
* props :
*  isDisabled : Boolean
*       The boolean decides whether the disabled button state
*  handleClickEvent : Function
*       The function has the callback when the button gets clicked
*  btnText : String
*       The string describes the text to be shown at the button
*  btnStyle : Object
*       The object has style attributes to be applied onto the button
*  btnClass : String
*       The string is the className to be added to the button
*  btnDisabledStyle : Object
*       The object has style attributes to be applied onto the button in disbabled state
*  btnDisabledClass : String
*       The string is the className to be added to the button in disabled state
*/


import React, { Component } from 'react';

class Button extends Component {
  
  shouldComponentUpdate( nextProps, nextState){
    return nextProps.isDisabled != this.props.isDisabled;
  }
  render() {
    const {
          isDisabled,
          handleClickEvent,
          btnText,
          btnStyle,
          btnClass,
          btnDisabledStyle,
          btnDisabledClass
        } = this.props;

    const disabledStyle  = isDisabled ? btnDisabledStyle : {};

    const disabledClass =  isDisabled ? btnDisabledClass : '';

    return (
        <button disabled={isDisabled} className={`${btnClass} ${disabledClass}`}
          style={{...btnStyle, ...disabledStyle}} onClick={handleClickEvent}>
          {btnText}
        </button>
        )
  }
}
export default Button;

Button.defaultProps = {
  isDiabled : false,
  handleClickEvent : ()=>({}),
  btnText : '',
  btnStyle : {},
  btnClass : '',
  btnDisabledStyle : {},
  btnDisabledClass : ''
};
