import React, { Component } from 'react';

import Button from '../common/components/Button.jsx';

class NextButton extends Component {
  constructor(){
    super();
    this.onClick =  this.onClick.bind(this);
  }
  shouldComponentUpdate( nextProps, nextState){
      return nextProps.isDisabled != this.props.isDisabled
  }
  render() {
    const {
          isDisabled
        } = this.props;

    const btnProps = {
      btnText : 'Next \u003E \u003E',
      handleClickEvent : this.onClick,
      btnStyle : Styles.btnStyle,
      btnDisabledStyle : Styles.btnDisabledStyle,
      isDisabled
    }
    return (
        <Button {...btnProps}/>
        )
  }
  onClick(e){
    const { handleClickEvent } = this.props;
    if( handleClickEvent ){
      handleClickEvent(e);
    }
  }
}
export default NextButton;

NextButton.defaultProps = {
  isDiabled : false,
  handleClickEvent : ()=>({})
};

const Styles = {
  btnStyle:{
    width: "180px",
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
