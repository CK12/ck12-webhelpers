import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';
import { Link } from 'react-router';
import QueryCarouselView from '../components/QueryCarouselView';

import styles from '../../css/alignedSearch.css';

import { Router, Route, hashHistory } from 'react-router'

import {
  ActionTypes,
  ActionMethods
} from '../actions/'

const {
  QueryCompInit,
  SelectQuery,
  ChangeQuery,
  FetchContentsForQuery,
  SelectCarouselIndex,
  ToggleExpand
} = ActionMethods; // destructuring the methods required to send

class App extends Component {

  constructor(props) {
    super(props);
    this.changeQueryQuestion = this.changeQueryQuestion.bind(this);
    this.fetchContentsForQuery = this.fetchContentsForQuery.bind(this);
    this.clearQuery = this.clearQuery.bind(this);
    this.fetchOnEnter = this.fetchOnEnter.bind(this);
  }
  componentWillMount(){
    const { action , params : {query: urlQuery = ''}} = this.props;
    action.QueryCompInit();
    if(urlQuery){
      action.SelectQuery(decodeURIComponent(urlQuery));
    }
    
  }

  componentWillReceiveProps(nextProps){    
    let {params : {query: urlQuery = ''}, currentQuery, action} = nextProps;    
    urlQuery = decodeURIComponent(urlQuery);
    if(urlQuery != currentQuery){
      action.SelectQuery(urlQuery);
    }
  }


  render() {
    const {            
      currentQuery,
      inputQuery,
      modalitiesByQuery,
      modalities,
      carouselExpanded,
      action
    }  = this.props;

    const dynamicStyle = {
      carouselView : (carouselExpanded ? {width: '100%'} : {width: '70%'}),
      questionsView : (carouselExpanded ? {width: '0%'} : {width: '30%'}),
      alignedSearchContainer : (currentQuery ? Styles.alignedSearchContainerResultsStyle : {}),
      alignedSearchBox : (currentQuery ? {width: "95%"} : {width: "60%"})
    }

    const sliderData = modalitiesByQuery[currentQuery];
    const slidesData = sliderData && sliderData.items && sliderData.items.map(item => modalities[item]);

    const queryCarouselProps = {
      currentQuery,
      sliderData,
      slidesData,
      carouselExpanded,
      beforeSlide : (index) => {
        action.SelectCarouselIndex(index+1);
      },
      toggleExpandCarousel: () => {
        action.ToggleExpand(!carouselExpanded);
      }
    }                                            

    return (
      <div style={Styles.topContainer}>
        <div id="seach-container" style={{...Styles.alignedSearchContainer, ...dynamicStyle.alignedSearchContainer}}>
          { !currentQuery 
            && 
            (<div style={Styles.searchTitleStyle}>
              <span style={Styles.titleAskSpanStyle}>Ask</span>
              <img src={Styles.titleImageStyle.src} style={Styles.titleImageStyle.style}/>
              </div>)
          }
          <div id="search-input-box" style={{...Styles.alignedSearchBox, ...dynamicStyle.alignedSearchBox}}>
            <input placeholder="Ask your question here..." 
              value={inputQuery}
              onChange={this.changeQueryQuestion}
              onKeyPress={this.fetchOnEnter}
              style={{...Styles.alignedSearchInputField}}/>
            <div className="pointer search-button-large"  style={Styles.actionBox}>
            { currentQuery 
              ? 
              (<i className='icon-close2' style={{...Styles.actionButtonStyle, ...Styles.closeButtonStyle}} onClick={this.clearQuery}></i>) 
              : 
              (<i className='icon-search' style={{...Styles.actionButtonStyle, ...Styles.searchButtonStyle}} onClick={this.fetchContentsForQuery}></i>)
            }
            </div>
          </div>                    
        </div>
        { currentQuery && (<div style={Styles.modalitiesContainer}>
          <div id="carouselView" style={{...Styles.carouselView, ...dynamicStyle.carouselView}}>
            <QueryCarouselView {...queryCarouselProps}/>
          </div>
          <div id="relatedQuestionsView" style={{...Styles.relatedQuestionsView, ...dynamicStyle.questionsView}}>
          </div>
        </div>)}
      </div>
      )
  }

  changeQueryQuestion(e) {
    const { action } = this.props;
    action.ChangeQuery(e.target.value);
  }  

  fetchContentsForQuery(e){
    const { action, inputQuery } = this.props;
    const trimmedQuery = inputQuery.trim();
    //Trimming the query to remove unnecessary spaces    
    hashHistory.push('/'+encodeURIComponent(trimmedQuery));
  }
  
  fetchOnEnter(e){
    if(e.charCode === 13){
      this.fetchContentsForQuery(e);
    }
  }

  clearQuery(e){
    hashHistory.push('/');
  }
}

let mapStateToProps = (state, ownProps)=> {
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  return {
    action: bindActionCreators({
      QueryCompInit,
      SelectQuery,
      ChangeQuery,
      FetchContentsForQuery,
      SelectCarouselIndex,
      ToggleExpand
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);


const Styles = {
  topContainer: {
    'top': '50px', 
    'height': "700px", 
    "overflowY": "hidden"
  },
  alignedSearchContainer : {
    textAlign: "center",
    marginRight:"auto",
    marginLeft :"auto",
    "marginTop": "200px"
  },
  alignedSearchContainerResultsStyle:{
    marginTop : "20px"
  },
  alignedSearchBox: {
    position: 'relative', 
    margin: "auto"
  },
  alignedSearchInputField:{
    width: "100%",
    height: "60px",
    borderRadius: "5px",
    border: "2px solid lightgrey",
    fontSize: "21px",
    paddingLeft: "10px",
    color : "#A9A9A9"
  },
  modalitiesContainer:{
    display : 'inline-block',
    width : '100%',
    height : '640px',
    padding: "22px"
  },
  actionBox: {
    top : "10px", 
    position: "absolute", 
    right: "2px"
  },
  actionButtonStyle: {
    height: "56px", 
    width: "56px", 
    fontSize: "30px", 
    padding: "13px"
  },
  closeButtonStyle: {
    position: 'absolute',
    right: '0',
    top: "-8px",
    color: "#577dba"
  },
  searchButtonStyle: {
    backgroundColor: "#577dba"
  },
  searchTitleStyle: {
    "width":'100%', 
    "height":'60px', 
    "marginLeft":"auto", 
    "marginRight":"auto", 
    "marginTop": "20px", 
    marginBottom: "30px"
  },
  titleAskSpanStyle: {
    fontWeight: "bold", 
    fontSize: "55px", 
    paddingRight: "10px"
  },
  titleImageStyle: {
    src: '/media/common/images/logo_ck12.svg',
    style: {
      "height":"40px", 
      "verticalAlign":"baseline"
    }
  },
  carouselView: {
    // width: "100%",
    height: '100%',
    
    // padding: '.21%',
    float: 'left',
    borderRadius: '5px'
    // paddingTop: '10px'

  },
  relatedQuestionsView: {
     // border: "1px solid red",
     // width: "0%",
     height: '100%',
     // marginLeft: '60%',
     boxSizing: 'border-box',
     float: 'left',
     height: '100%'

  }
}
