import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class DownloadButton extends Component {

  constructor(){
    super();
    this.toggleOpenState  = this.toggleOpenState.bind(this);
  }
  shouldComponentUpdate( nextProps, nextState){
    return nextProps.isDisabled != this.props.isDisabled
            || nextState.isOptionsListOpen != this.state.isOptionsListOpen;
  }
  componentWillMount(){
    this.setState({
          isOptionsListOpen : false,
          selectHash : DownloadButton.hash

    })
    if ( window && window.document){
      window.document.addEventListener('click', this.closeOptionState.bind(this))
    }
  }
  componentWillUnMount(){
    if ( window && window.document){
      window.document.removeEventListener('click', this.closeOptionState, this);
    }
  }
  static get hash(){
    return DownloadButton.hashId++;
  }
  render() {
    const {
          isDisabled,
          handleCSVClick,
          handleGenerateFlexbook,
          handleGenerateCourse,
          style,
          selectedOptionsDisabled,
          selectorTextDisabled,
          dropDownIconDisabled
        } = this.props;

    const { isOptionsListOpen, selectHash }  =  this.state;

    let listStyle = isOptionsListOpen ? {} : { 'display':'none' };

    const optionsData =  [
        { label:'Download CSV', onClickCb: handleCSVClick},
        { label:'Generate FlexBook', onClickCb: handleGenerateFlexbook},
        { label:'Generate Course', onClickCb: handleGenerateCourse}

    ];

    const optionsList  = optionsData.map((val, idx)=>{
          return <li key={idx} value={val.value} className='auto-aligned-options option-list'
                    style={Styles.optionStyle} onClick={val.onClickCb} data-key={idx} data-rx-select={selectHash}>
                    {val.label}
                 </li>
    });

    const selectorText =  isDisabled  ?  selectorTextDisabled : {};

    const dropDownIcon =  isDisabled  ?  dropDownIconDisabled : {};

    const selectedOptions =  isDisabled ? selectedOptionsDisabled : {};


    return (
      <div style={{...Styles.selectorDiv, ...style}} data-rx-select={selectHash}>
        <button style={{...Styles.selectorText, ...selectorText}} disabled={isDisabled}
          onClick={this.toggleOpenState} data-rx-select={selectHash}>DOWNLOAD
          <span style={{...Styles.dropDownIcon, ...dropDownIcon}} data-rx-select={selectHash}>
            <span style={Styles.selectIcon}> &#x25bc;</span>
          </span>
        </button>
        <div style={{position:'absolute',width:'100%',zIndex:'22', marginTop:'10px',...listStyle}}>
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
export default DownloadButton;

DownloadButton.hashId = 234;

DownloadButton.defaultProps = {
  optionsList : [],
  height : '100px',
  position :'relative',
  style:{},
  isDisabled : false,
  selectedOptionsDisabled: {
    cursor: 'default',
  },
  selectorTextDisabled:{
    'backgroundColor': '#A9A9A9',
  },
  dropDownIconDisabled:{
    'backgroundColor': '#DCDCDC'
  },
  handleGenerateFlexbook: ()=>{},
  handleCSVClick : ()=>{},
  handleGenerateCourse : ()=>{}
};

const Styles = {
  selectorDiv:{
    // display: 'inline-block',
    // overflow:'visible',
    // width : '100%',
    borderRadius : '5px',
    // marginRight : '40px',
    height : '50px',
    zIndex : 10,
    position:'relative',
    marginTop:'30px'
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
    // width : '100%',
    maxHeight: '100%',
    overflowY: 'visible',
    borderRadius : '4px',
    backgroundColor: '#0086C3',
    zIndex : 11,
    listStyleType:'none',
    borderRadius:'5px',
    border:'1px solid #0086C3'
  },
  optionStyle:{
    paddingLeft:'10px'
  },
  selectorText:{
    backgroundColor: "#0086C3",
    width: "100%",
    // display: "inline-block",
    margin: 0,
    padding: 0,
    color: "white",
    height:'50px',
    fontSize: '20px',
    lineHeight: '50px',
    borderRadius: '5px',
    // marginLeft: '15px',
    // marginRight: '15px',
    border: 'none',
  },
  dropDownIcon:{
    width: "45px",
    // height: "50px",
    display: "inline-block",
    backgroundColor: "#005177",
    color: "white",
    float: 'right',
    // marginRight: '5px',
    borderTopRightRadius: '5px',
    borderBottomRightRadius: '5px'
  }
}
