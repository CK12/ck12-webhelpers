import React, { Component } from 'react';

class SearchBar extends Component {

  constructor(){
    super();
    this.changeInputText  = this.changeInputText.bind(this);
  }
  componentWillMount(){
    this.setState({
      inputText : ''
    });
  }
  render() {
    const {
          optionsData,
          handleSelectConcept
        } = this.props;

    const {
      inputText
    }  = this.state;

    let optionXML,
        filteredData,
        shouldInputBeDisabled =  optionsData.length==0;
    if(!inputText){
        optionXML = [];
    }else{
      const regExp =  new RegExp(inputText.replace(/^\s+|\s+$|\s+(?=\s)/g, ""), 'gi'); // TODO ignore case

     filteredData  =  optionsData.filter(val=> regExp.test(val.name) );

       optionXML  =  filteredData.map((node, idx)=>{
            let val =  node.name;
            let matchingSubStrings = val.match(regExp);
            let textbits  = val.split(regExp).map((val,idx)=><span key={idx}>{val}</span>);
            let finalTextBits = [];
            let index  = 0;
            while( textbits.length > 0
                  && matchingSubStrings.length>0 ){
                finalTextBits.push(textbits.shift())
                finalTextBits.push(<strong key={index+1000}>{matchingSubStrings.shift()}</strong>)
                index++;
            }
            finalTextBits =  [...finalTextBits, ...textbits];

            return <li key = {idx} style={Styles.optionRowStyle} onClick={(e)=>{handleSelectConcept(node.EID)}} className='search-bar-row'>
                      <span style={Styles.bulbIconContainer}>
                        <img style={{maxHeight:'100%',maxWidth:'100%'}} src='/media/autoStdAlignment/images/ConceptIcon.png'/>
                      </span>
                      <span>{finalTextBits}</span>
                    </li>
      })
    }
    const style  =  filteredData && filteredData.length > 0 ? {} : {'border':'0px'};
    return (
          <div style={{marginTop:'75px'}}>
            <input type='text' disabled={shouldInputBeDisabled} placeholder='Search For Concepts...'
              value={inputText} onChange={(e)=>this.changeInputText(e)}
              style={Styles.searchBarStyle}/>
              <ul style={{...Styles.listStyle,...style}}>
                  {optionXML}
              </ul>

          </div>
        )
  }
  changeInputText(e){
      let val  = e.target.value;
      this.setState({
        inputText : val
      })
      this.render()  // TODO
  }
}
export default SearchBar;

SearchBar.defaultProps = {
  optionsData : [],
  handleSelectConcept: ()=>{}
};

const Styles = {
  inputFieldStyle:{

  },
  highlightText:{
    fontWeight:'bolder'
  },
  listStyle:{
    listStyleType:'none',
    fontSize:'18px',
    border:'1px solid grey',
    borderRadius:'5px',
    'color':'#0086C3',
    textAlign:'left',
    maxHeight:'150px',
    overflowY:'auto'
  },
  searchBarStyle:{
    height:'50px',
    border:'2px solid grey',
    color:'grey',
    fontWeight:600,
    fontSize:'18px',
    marginBottom:'0px'
  },
  optionRowStyle:{
    cursor:'pointer',
    width:'100%',
    height:'40px',
    'marginBottom':'5px',
    'paddingTop':'2px',
    paddingBottom:'2px',
    marginTop:'8px'
  },
  bulbIconContainer:{
    width:'15px',
    height:'20px',
    top: '10px',
    display:'inline-block',
    marginLeft:'10px',
    marginRight:'10px'
  }

}
