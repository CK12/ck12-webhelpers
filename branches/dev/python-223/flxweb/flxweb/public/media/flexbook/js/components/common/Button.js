import React from 'react';
import Radium from 'radium';
import Icon from './Icon';

class Button extends React.Component{
  constructor(props){
    super(props);
    let {arrow} = props;
    arrow && (this.state = {arrowColor: arrow.color});
  }

  handleMouseOver(){
    this.props.arrow && this.setState({arrowColor: '#FFF'});
  }

  handleMouseOut(){
    this.props.arrow && (this.setState({arrowColor: this.props.arrow.color}));
  }

  handleClick(){
    this.props.handleClick && this.props.handleClick();
  }

  render(){
    let {style, size, color, arrow, children} = this.props;
    return(
      <button
        style={[styles.default, styles[size] , styles[color], style]}
        onClick={()=>this.handleClick()}>
      <span> {children} </span>
      {arrow &&
        <Icon
          name={`arrow_${arrow.type}`}
          size='small'
          color={this.state.arrowColor}
          style={[arrow.style,styles.defaultIcon]}/>}
      </button>
    );
  }
}

const styles = {
  default: {
    borderRadius: 3,
    borderColor: 'transparent',
    borderTop: 'none',
    fontSize: 14
  },
  white: {
    backgroundColor: '#fff',
    color: '#8e8774',
    borderWidth: '1px',
    borderColor: '#e0ddd5',
    borderStyle: 'solid',
    borderTopColor: '#e0ddd5',
    '@media screen and (max-width: 767px)':{
      padding: '3px 8px'
    }
  },
  tangerine: {
    backgroundColor: '#FF6633',
    borderBottom: '3px solid #D9491A',
    ':hover': {
      backgroundColor: '#D9491A',
      borderBottom: '3px solid #FF6633',
      color: '#FFF'
    }
  },
  turquoise: {
    backgroundColor: '#00ABA4',
    borderBottom: '3px solid #0089A6',
    ':hover': {
      backgroundColor: '#4DCCC4',
      borderBottom: '3px solid #00ABA4'
    },
    '@media screen and (max-width: 767px)':{
      padding: '3px 8px'
    }
  },
  turquoiseMobile: {
    backgroundColor: '#00ABA4',
    borderBottom: '3px solid #0089A6',
    ':hover': {
      backgroundColor: '#4DCCC4',
      borderBottom: '3px solid #00ABA4'
    },
    '@media screen and (max-width: 767px)':{
      padding: '6px 40px'
    }
  },
  blue: {
    backgroundColor:'#328dc7',
    borderBottom: '3px solid #116295',
    ':hover': {
      backgroundColor: '#116295',
      borderBottom: '3px solid #328dc7'
    }
  },
  grey: {
    backgroundColor: '#A9B1BE',
    borderBottom: '3px solid #858B95',
    ':hover': {
      backgroundColor: '#BDC5D2',
      borderBottom: '3px solid #858B95'
    },
    '@media screen and (max-width: 767px)':{
      padding: '3px 8px'
    }
  },
  disabled: {
    backgroundColor: '#DDD',
    borderBottom: '3px solid #CCC',
    color: '#56544D',
    fontWeight: 'normal'
  },
  standard:{
    padding: '7px 16px 9px 16px'
  },
  defaultIcon:{
    verticalAlign: 'text-bottom'
  }
};

export default Radium(Button);
