import React, {Component} from 'react';

class Checkbox extends Component{
  constructor(){
    super();
    this.state = {
      isChecked: false
    };
  }

  render(){
    let {isChecked} = this.state;
    let newCheckBoxStyles = Object.assign({}, styles.checkbox),
    newTickStyles = Object.assign({}, styles.tick);
    if(isChecked)
    {
      newCheckBoxStyles = Object.assign({}, newCheckBoxStyles,{backgroundColor:'#00ABA4', borderColor: '#00ABA4'});
      newTickStyles = Object.assign({}, newTickStyles,{display:'block'});
    }

    return(
      <span style={newCheckBoxStyles} onClick={()=>this.onClick()}>
        <i className="icon-validated" style={newTickStyles}></i>
      </span>
    );
  }

  onClick(){
    let {value} = this.props;
    let checked = !this.state.isChecked;
    this.setState({isChecked: checked});
    this.props.onClick({id: value, isSelected: checked});
  }
}

const styles = {
  checkbox:{
    background: 'none 0px 0px repeat scroll rgb(255, 255, 255)', 
    border: '2px solid',
    borderColor: 'rgb(204, 204, 204)',
    borderRadius: '2px',
    display: 'inline-block', 
    height: '18px',
    position: 'relative',
    top: '4px', 
    width: '18px',
    overflow: 'hidden'
  },
  tick:{
    content: '\e9cc',
    display: 'none',
    fontSize: '20px',
    left: '-3px',
    position: 'relative',
    top: '-3px',
    color: '#00ABA4',
    background: '#FFF'
  }
}

export default Checkbox;
