import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Select extends Component {

  constructor(){
    super();
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.toggleOpenState  = this.toggleOpenState.bind(this);
  }
  componentWillMount(){
    this.setState({
          isOptionsListOpen : false,
          selectHash : Select.hash

    })
    if ( window && window.document){
      window.document.addEventListener('click', this.closeOptionState.bind(this))
    }
  }
  componentWillUnMount(){
    if ( window && window.document){
      window.document.removeEventListener('click', this.closeOptionState);
    }
  }
  shouldComponentUpdate(nextProps, nextState){
      return nextState.isOptionsListOpen != this.state.isOptionsListOpen
            || nextProps.isDisabled != this.props.isDisabled
            || nextProps.currentText!= this.props.currentText;
  }
  static get hash(){
    return Select.hashId++;
  }
  render() {
    const {
          defaultText,
          optionsData,
          currentText,
          handleOptionChange,
          isDisabled,
          style,
          selectedOptionsDisabled,
          selectorTextDisabled,
          dropDownIconDisabled,
        } = this.props;

    const { isOptionsListOpen, selectHash }  =  this.state;

    let listStyle = isOptionsListOpen ? {} : { 'display':'none' }
    const text =  currentText || defaultText;

    const optionsList  = optionsData.map((val, idx)=>{
          return <li key={idx} value={val.value} className={val.class}
                    style={val.style} onClick={this.handleOptionClick} data-key={idx} data-rx-select={selectHash}>
                    {val.label}
                 </li>
    });

    const selectorText =  isDisabled  ?  selectorTextDisabled : {};

    const dropDownIcon =  isDisabled  ?  dropDownIconDisabled : {};

    const selectedOptions =  isDisabled ? selectedOptionsDisabled : {};


    return (
      <div style={{...Styles.selectorDiv, ...style}} data-rx-select={selectHash}>
        <div style={{...Styles.selectedOptions,...selectedOptions}} onClick={this.toggleOpenState} data-rx-select={selectHash}>
            <div style={{...Styles.selectorText, ...selectorText}} data-rx-select={selectHash}>{text}</div>
            <div style={{...Styles.dropDownIcon, ...dropDownIcon}} data-rx-select={selectHash}>
              <span style={Styles.selectIcon}> &#x25bc;</span>
            </div>
        </div>
        <div style={{position:'absolute',width:'255px',zIndex:'22',...listStyle}}>
            <span style={{'fontSize':'30px', color:'#0086C3', float:'right', marginRight:'10px','position':'absolute',zIndex:-1,right:'10px',top:'-20px'}}>
              &#9650;
            </span>
          <ul style={{ ...Styles.listStyle,  }} onClick={this.toggleOpenState} data-rx-select={selectHash}>
            {optionsList}
          </ul>
        </div>

      </div>
        )
  }
  handleOptionClick(e){
      this.toggleOpenState(e)
      const { handleOptionChange, optionsData } = this.props;
      if (handleOptionChange){
          let key  = e.target.getAttribute('data-key');
          let options =  optionsData[key] ? optionsData[key]['attribute'] : {};
          handleOptionChange( e , options);
      }
  }
  toggleOpenState(e){
      const { isDisabled } = this.props;
      if ( !isDisabled ){
        const { isOptionsListOpen } =  this.state;
        this.setState({isOptionsListOpen: !isOptionsListOpen})
      }
  }
  closeOptionState(e){

    const currentHash  = e.target.getAttribute('data-rx-select');
    const {
        isOptionsListOpen ,
        selectHash
      } =  this.state;

    if( isOptionsListOpen && currentHash != selectHash ){
      this.setState({isOptionsListOpen : false});
    }
  }
}
export default Select;

Select.hashId = 1;

Select.defaultProps = {
  defaultText : 'Select',
  optionsList : [],
  currentText : '',
  height : '100px',
  position :'relative',
  style:{},
  isDisabled : false,
  selectedOptionsDisabled: {
    cursor: 'default',
  },
  selectorTextDisabled:{
    'backgroundColor': '#A9A9A9'
  },
  dropDownIconDisabled:{
    'backgroundColor': '#DCDCDC'
  }
};

const Styles = {
  selectorDiv:{
    display: 'inline-block',
    overflow:'hidden',
    width : '255px',
    borderRadius : '5px',
    marginRight : '40px',
    height : '50px',
    zIndex : 10
  },
  selectedOptions:{
    height: '50px',
    marginBottom: '10px',
    borderRadius: '5px',
    color: 'white',
    fontSize: '20px',
    lineHeight: '50px',
    cursor: 'pointer',
    userSelect : 'none'
  },
  selectIcon:{
    width: '25px',
    height : '40px'
  },
  listStyle:{
    // position: 'absolute',
    width : '255px',
    maxHeight: '250px',
    overflowY: 'scroll',
    borderRadius : '4px',
    backgroundColor: '#0086C3',
    zIndex : 11
  },
  selectorText:{
    backgroundColor: "#0086C3",
    width: "210px",
    display: "inline-block",
    margin: 0,
    padding: 0,
    color: "white"
  },
  dropDownIcon:{
    width: "45px",
    height: "50px",
    display: "inline-block",
    backgroundColor: "#005177",
    color: "white"
  }
}
