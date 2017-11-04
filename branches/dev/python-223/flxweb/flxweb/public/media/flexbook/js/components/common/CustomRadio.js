import React, {Component} from 'react';
import Radium from 'radium';

@Radium
class CustomRadio extends Component{
  render(){
    let {options} = this.props;
    let optionEls = options.map(({value, label}, index)=>
    {
      let {selected} = this.state,
      selectedStyles = selected == value? styles.selected: {};

      return (<div key={index}>
      <div style={styles.outer}>
        <div key={`cr-${index}`}
          onClick={()=> this.handleClick(value)}
          style={[styles.radio, selectedStyles]}>
        </div>
      </div>
      <span onClick={()=> this.handleClick(value)} 
            style={styles.label}>
            {label}
      </span>
    </div>);
  });
    return(
      <div>
      {optionEls}
      </div>
    );
  }

  handleClick(value){
    let {selected} = this.state;
    this.setState({
      selected: value
    });
    this.props.handleClick(value);
  }
}

const styles = {
  label:{
    cursor: 'pointer'
  },
  radio: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: '2px',
    ':hover': {
      backgroundColor: 'black'
    }
  },
  outer: {
    border: '1px solid #666',
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    position: 'relative',
    marginRight: '5px'
  },
  selected: {
    backgroundColor: 'black'
  }
}

export default CustomRadio;
