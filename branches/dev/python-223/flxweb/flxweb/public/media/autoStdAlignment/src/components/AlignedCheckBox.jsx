import React, { Component } from 'react';

import CheckBox from '../common/components/CheckBox.jsx';


class AlignedCheckBox extends Component {

  shouldComponentUpdate( nextProps, nextState){
    return nextProps.isSelected != this.props.isSelected;
  }
  render() {
    const {
          isSelected,
          handleCheckBoxChange,
          checkBoxStyle
        } = this.props;

    const checkBoxProps = {
      isSelected,
      handleOnChange : handleCheckBoxChange,
      checkBoxStyle : {...Styles.checkBox, ...checkBoxStyle},
      checkBoxTickStyle : Styles.checkStyle
    }
    return (
          <CheckBox {...checkBoxProps}/>
        )
  }
}
export default AlignedCheckBox;

AlignedCheckBox.defaultProps = {
  isSelected : false,
  handleCheckBoxChange : ()=>({}),
  checkBoxStyle: {}
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
    backgroundColor : 'rgba(220,220,220, 0.25)'
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
