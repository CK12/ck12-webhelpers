import React, { Component } from 'react';

class Button extends Component {

  render() {
    const {
          isDisabled,
          handleClickEvent,
          text,
          btnStyle
        } = this.props;

    const disabledStyle  = isDisabled ? Styles.btnDisabledStyle : {};

    const aggBtnStyle  = { ...Styles.btnStyle, ...btnStyle, ...disabledStyle}
    return (
      <button disabled={isDisabled} style={aggBtnStyle} onClick={handleClickEvent}>{text}</button>
        )
  }
}
export default Button;

Button.defaultProps = {
  isDiabled : false,
  handleClickEvent : ()=>({}),
  text : 'Next \u003E \u003E',
  btnStyle : {}
};

const Styles = {
  btnStyle:{
    width: "150px",
    borderRadius: "5px",
    backgroundColor: "#00aba4",
    height: "50px",
    fontWeight: 700,
    fontSize : '18px',
    borderWidth :'0px',
    backgroundColor : '#0086C3'
  },
  btnDisabledStyle:{
    'backgroundColor':'lightgrey'
  }
}
