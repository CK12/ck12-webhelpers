import React from 'react';
import {FEEDBACK_PLACEHOLDER} from '../constants/placeholders';
import Input from './common/Input';

class ReviewInput extends React.Component{
  constructor(){
    super();
    this.state = {
      value: ''
    };
  }

  render(){
    let {value} = this.state;
    return (
      <div
        className='reviewinput'
        style={styles.container}>
        <textarea
          ref='textarea'
          placeholder={FEEDBACK_PLACEHOLDER}
          value={value}
          onChange={(e)=>this.handleChange(e)}>
        </textarea>

      </div>
    );
  }

  componentDidMount(){
    this.setState({
      value: this.props.value
    });
  }

  handleChange(e){
    let value = e.target.value;
    this.setState({value});
  }
}

const styles = {
  container: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20
  }
};

export default ReviewInput;
