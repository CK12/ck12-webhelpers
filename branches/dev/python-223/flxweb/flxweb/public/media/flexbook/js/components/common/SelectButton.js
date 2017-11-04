import React from 'react';
import Radium from 'radium';
import Icon from './Icon';

class SelectButton extends React.Component{
  constructor(props){
    super(props);
    let {arrow} = props;
    this.state = {
      arrowColor: arrow.color,
      show: false
    };
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
  }

  handleMouseOver(){
    this.props.arrow && this.setState({arrowColor: '#FFF'});
  }

  handleMouseOut(){
    this.props.arrow && (this.setState({arrowColor: this.props.arrow.color}));
  }

  handleClickOutside(event){
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleClick(false);
    }
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClick(val=true){
    let {show} = this.state;
    this.setState({
      show: val && !show
    })
  }

  handleSelectClick(value){
    this.props.handleSelectClick && this.props.handleSelectClick(value);
  }

  componentWillMount(){
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount(){
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  render(){
    let {style, size, color, arrow, value, options} = this.props;
    let {show} = this.state;
    let optionsHtml = options.map((o)=>
      <li style={styles.option} key={o} onClick={()=>this.handleSelectClick(o)}>
        {o}
      </li>
    );
    let displayStyles = show? {display:'block'} : {display: 'none'};
    return(
      <span ref={this.setWrapperRef} style={{position:'relative'}}>
        <button
          style={[styles.default, styles[size] , styles[color], style]}
          onClick={()=>this.handleClick()}>
          <span style={{marginLeft:'-35px'}}> {value} </span>
          {arrow &&
            (<span>
              <span style={styles.divider}> </span>
              <Icon
                name={`arrow_${arrow.type}`}
                color={this.state.arrowColor}
                style={[arrow.style,styles.defaultIcon]}/>
            </span>)
          }
        </button>
        <div style={[styles.selectContainer, displayStyles]}>
          <ul style={{listStyleType:'none', cursor: 'pointer'}}>
            <span style={styles.before}/>
            {optionsHtml}
            <span style={styles.after}/>
          </ul>
        </div>
      </span>
    );
  }
}

const styles = {
  option:{
    padding: '6px 8px',
    textAlign: 'left',
    ':hover':{
      backgroundColor: '#FFFAD3'
    }
  },
  before:{
    content: "",
    display: 'block',
    position: 'absolute',
    top: '-15px',
    right: '15px',
    left: 'initial',
    width: 0,
    borderWidth: '0 15px 15px 15px',
    borderStyle: 'solid',
    borderColor: '#d4d4d5 transparent'
  },
  after :{
    content: "",
    display: 'block',
    position: 'absolute',
    top: '-12px',
    right: '17px',
    left: 'initial',
    width: 0, 
    borderWidth: '0 12px 12px 14px',
    borderStyle: 'solid',
    borderColor: '#fff transparent'
  },
  selectContainer: {
    position: 'absolute',
    zIndex: '10',
    backgroundColor: '#FFF',
    border: '2px solid #d4d4d5',
    right: 0,
    top: '60px',
    width: '175px',
    height: '78px'
  },
  divider: {
    backgroundColor: 'white',
    margin: '-25px 40px',
    width: '1px',
    height: '34px',
    display: 'inline-block',
    position: 'absolute'
  },
  tangerine: {
    backgroundColor: '#FF6633',
    borderColor: '#FF6633',
    borderBottom: '3px solid #D9491A',
    ':hover': {
      backgroundColor: '#D9491A',
      borderBottom: '3px solid #FF6633',
      color: '#FFF'
    }
  },
  defaultIcon:{
    verticalAlign: 'text-bottom',
    fontSize: '12px',
    margin: '-15px 52px',
    position: 'absolute'

  }
};

export default Radium(SelectButton);
