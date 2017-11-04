import React, {Component} from 'react';
import Radium from 'radium';

@Radium
class Input extends Component{
  constructor(){
    super();
    this.state = {
      value: ''
    };
  }
  render(){
    let {style, placeholder='', type='text', label=''} = this.props;
    return (
      <span>
      <input
        type={type}
        style={[styles,style]}
        value={this.state.value || ''}
        onChange={(e)=>this.handleChange(e)}
        ref='input'
        placeholder={placeholder}
        onFocus={()=>this.handleFocus()}>
      </input>
      <span>{label}</span>
      </span>
    );
  }

  handleFocus(){
    let {handleFocus} = this.props;
    handleFocus && handleFocus();
  }

  componentDidMount(){
    this.setState({
      value: this.props.value
    });
  }

  handleChange(e){
    let value = e.target.value;
    this.setState({value});
    this.props.handleChange && this.props.handleChange({value});
  }
}

const styles = {
  fontSize: '1em',
  height: 39,
  padding: '7px 15px',
  border: '2px solid #CDCCCA',
  borderRadius: 5,
  color: '#56544D',
  width: '100%'
};
export default Input;
