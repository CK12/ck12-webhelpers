import React, {Component} from 'react';

class Textarea extends Component{
  constructor(){
    super();
    this.state = {
      value: ''
    };
  }
  render(){
    return (
      <textarea
        value={this.state.value}
        onChange={(e)=>this.handleChange(e)}
        ref='input'
        style={styles}/>
    );
  }

  componentDidMount(){
    this.setState({
      value: this.props.value
    });
  }

  handleChange(e){
    this.setState({value: e.target.value});
  }
}

const styles = {
  margin: '10px 0px'
};

export default Textarea;
