import React, { Component } from 'react';

import AlignedCheckBox from '../components/AlignedCheckBox.jsx';

class SidNode extends Component {
  constructor(){
    super();
    this.onClick = this.onClick.bind(this);
    this.onCheckBoxCheck = this.onCheckBoxCheck.bind(this);
  }
  shouldComponentUpdate( nextProps, nextState){
    return nextProps.sIdData.standardID != this.props.sIdData.standardID
            || nextProps.isSelected != this.props.isSelected ;
  }
  render() {
    const {
          isSelected,
          sIdData
        } = this.props;

    const checkBoxProps = {
        isSelected,
        handleCheckBoxChange : this.onCheckBoxCheck
    }
    const defaultSpanStyle = {
        'color': '#0086C3',
        marginLeft:'10px',
    }
    const spanStyle  = isSelected ? { 'fontWeight':'bold'} : {};

    return (
        <div onClick={this.onClick} style={{marginTop:'3px', cursor:'default'}}>
          <AlignedCheckBox {...checkBoxProps} />
          <span style={{...defaultSpanStyle,...spanStyle}}>{sIdData.standardID}</span>
        </div>
        )
  }
  onClick(e){
    const { handleOnClick , sIdData }  = this.props;
    handleOnClick( e, sIdData.standardID, sIdData.subjectCode||'BIO', sIdData.standardTitle)
  }
  onCheckBoxCheck(e){
    const { handleCheckBoxClick , sIdData }  = this.props;
    handleCheckBoxClick( e, sIdData.standardID, sIdData.subjectCode || 'BIO', sIdData.standardTitle )
  }
}
export default SidNode;

SidNode.defaultProps = {
  isDiabled : false,
  handleOnClick : ()=>({}),
  handleCheckBoxClick : ()=>({})
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
