import React from 'react';

class Select extends React.Component {
  constructor(props){
    super(props);
    let {value} = this.props;
    this.state = {
      value
    };
  }

  render(){
    let {options,style} = this.props;
    let optionsHtml = options.map((o)=>
    <option key={o.value} value={o.value}>
      {o.label}
    </option>
  );
    return(
    <select
      style={style}
      value = {this.state.value}
      onChange={(event)=>this.handleChange(event)}>
      {optionsHtml}
    </select>
    );
  }

  handleChange(event){
    let value = event.target.value;
    this.setState({
      value
    });
    this.props.onChange(value);
  }
}

export default Select;
