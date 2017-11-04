import React, {Component} from 'react';
import Radium from 'radium';
import Icon from './Icon';
import * as InputTypes from '../../constants/inputTypes';
import Textarea from './Textarea';
import Input from './Input';

class EditableInput extends Component{
  constructor(){
    super();
    this.state = {
      read: true,
      value: null
    };
  }

  render(){
    let {label, type, text, width, style} = this.props;
    let {read, value} = this.state,
      textValue = value || text,
      isEditMode = !textValue || !read;
    let inputField = this.getInputField({textValue,type});
    return (
      <div onClick={(e)=>this.disableEditing(e)}>
        <div style={styles.width[width]}>
          <span style={styles.label}>{label}</span>
          <span style={isEditMode?styles.hide:styles.showInline}>
            <span style={style && style.value}>{textValue}</span>
            <span onClick={(e)=>this.enableEditing(e)}>
              <Icon
                name='edit'
                size='small'
                style={styles.icon}/>
            </span>
          </span>
        </div>
        <div style={isEditMode?styles.showBlock:styles.hide}>
          {inputField}
        </div>
      </div>
    );
  }

  getInputField({type, textValue}){
    switch(type){
    case InputTypes.SINGLE_LINE_INPUT:
      return <Input ref='input' value={textValue}/>;
    case InputTypes.MULTIPLE_LINE_INPUT:
      return <Textarea ref='input' value={textValue}/>;
    default:
      return null;
    }
  }

  enableEditing(e){
    this.setState({
      read: false
    });
    e.stopPropagation();
  }

  disableEditing(e){
    let input = this.refs.input.refs.input;
    if(e.target == this.refs.input.refs.input)
      return;
    this.setState({
      read: true,
      value: input.value
    });
    e.stopPropagation();
  }
}


const styles = {
  showInline : {
    display: 'inline'
  },
  showBlock: {
    display: 'block'
  },
  hide: {
    display: 'none'
  },
  label: {
    color: '#B4B0A5',
    fontSize: 14,
    marginRight: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  icon: {
    marginLeft: 10,
    color: '#00ABA4',
    cursor: 'pointer'
  },
  width: {
    full: {
      width: '100%'
    }
  }
};

export default Radium(EditableInput);
