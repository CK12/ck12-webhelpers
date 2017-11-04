import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import FlexbookContainer, {intersect} from '../containers/Books';
import {getFlexbooks, isFlexbookLoaded, getFlexbookHandle, getAuth, isAuthFound, isTeacher, getSubjectLinks} from '../selectors/selectors';
import {getFlexbookInfo, getAuthInfo,} from '../actions/actions';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router'

var queryParams = {}

function abbriviate(string)
{
  var abb = {'languageSpanish' : "sp", 'languageEnglish' : "en" , "levelAtGrade" : "atgrade", "levelAdvanced" : "advanced", "levelBasic" : "basic", 'middleSchool':"ms", "highSchool":"hs"}
  if (string in abb)
    return abb[string];
  else
    return string;
}

function deabbriviate(string)
{
  var deabb = {"sp" : 'languageSpanish', "en" : 'languageEnglish', "atgrade" : "levelAtGrade", "advanced" : "levelAdvanced", "basic" : "levelBasic", "ms" : 'middleSchool', "hs" : "highSchool"}
  if (string in deabb)
    return deabb[string];
  else
    return string;
}

function getUrlParam(param)
{
  var urlParts = window.location.href.split('?')
  if (urlParts.length > 1)
  {
    var url = urlParts[1];
    url = url.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(url)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    if (param in params)
    {
      if (!(param in queryParams) &&
          (param == "lang" || param == "tab" || param == "level"))
      {
        queryParams[param] = abbriviate(params[param])
        return params[param];
      }
    }
  }
  return false;
}

function setQueryParams(key, value)
{
  queryParams[key] = abbriviate(value)
  hashHistory.push('/view_books?' + getQueryParams())
}

function getQueryParams()
{
  var returnString= ""
  for(var key in queryParams)
    returnString = returnString + key + "=" + queryParams[key] + "&"
  if (returnString.length > 0)
    return returnString.substring(0, returnString.length - 1);
  else
    return "";
}

function LevelDropDown(context, type) {
  var levelString;
  switch (context.state.level) {
  case 'all':
    levelString = 'All Levels';
    break;
  case 'levelBasic':
    levelString = 'Basic';
    break;
  case 'levelAtGrade':
    levelString = 'At Grade';
    break;
  case 'levelAdvanced':
    levelString = 'Advanced';
  }
  return(
    <div className={type + '-drop ' + ((type == 'hs') ? 'hide ' : '') + 'relative right'}>
      <div id={'level-help-' + type} className='right text-center pointer level-help' onClick={() => context.showHelp(true)}>
        <i className='icon-help2'></i>
      </div>
      <div className='button small split simple grade-filter-container right' data-dropdown={'grade-filter-dropdown-' + type} onClick={() => context.levelDropdownToggle()}><a className="grade-filter-label" data-level="All Levels">{levelString}</a><span className="js-close-drop-down"></span>
    </div>
    <ul style={{position: 'absolute', top: '24px'}} className={'f-dropdown tangerine-list simple grade-filter-dropdown' + ((context.state.showLevelDropdown) ? '' : ' hide')} id={'grade-filter-dropdown-' + type}>
      <li className={'js-grade-filter-level' + ((context.state.level == 'all') ? ' hide' : '')} data-difficulty="all levels" onClick={() => context.setLevel('all')}><a data-title="All Levels">All Levels</a></li>
      {((context.props.showmsBasic && context.state.grade == 'middleSchool') ||
        (context.props.showhsBasic && context.state.grade == 'highSchool')) &&
        <li className={'js-grade-filter-level' + ((context.state.level == 'levelBasic') ? ' hide' : '')} data-difficulty="basic" onClick={() => context.setLevel('levelBasic')}><a data-title="Basic" >Basic</a></li>
      }
      {((context.props.showmsAtGrade && context.state.grade == 'middleSchool') ||
        (context.props.showhsAtGrade && context.state.grade == 'highSchool')) &&
        <li className={'js-grade-filter-level' + ((context.state.level == 'levelAtGrade') ? ' hide' : '')} data-difficulty="at grade" onClick={() => context.setLevel('levelAtGrade')}><a data-title="At Grade">At Grade</a></li>
      }
      {((context.props.showmsAdvanced && context.state.grade == 'middleSchool') ||
        (context.props.showhsAdvanced && context.state.grade == 'highSchool')) &&
        <li className={'js-grade-filter-level' + ((context.state.level == 'levelAdvanced') ? ' hide' : '')} data-difficulty="advanced" onClick={() => context.setLevel('levelAdvanced')}><a data-title="Advanced">Advanced</a></li>
      }
    </ul>
  </div>
);

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var preventHandleClick = false;

class BooksTab extends Component {
  constructor(props) {
    super(props);
    var lang = deabbriviate(getUrlParam('lang'));
    var grade = deabbriviate(getUrlParam('tab'));
    var level =  deabbriviate(getUrlParam('level'));
    this.state = {language: ((lang) ? lang : "all"),
                  grade: (this.props.showSchoolTabs ? ((grade) ? grade : "middleSchool") : 'all'),
                  level: ((level) ? level : "all") ,
                  showLanguageDropdown:false, showLevelDropdown:false, showHelp: false};
    this.setLevel = this.setLevel.bind(this);
  }

  handleClickOutside() {
    if (preventHandleClick)
    {
      preventHandleClick = false;
    }
    else{
      this.setState(prevState => ({
        showLanguageDropdown: false,
        showLevelDropdown: false,
        showHelp:false
      }));
    }
  }

  languageDropdownToggle() {
    preventHandleClick = true;
    this.setState(prevState => ({
      showLevelDropdown: false,
      showLanguageDropdown: !this.state.showLanguageDropdown
    }));
  }

  levelDropdownToggle() {
    preventHandleClick = true;
    this.setState(prevState => ({
      showLanguageDropdown: false,
      showLevelDropdown: !this.state.showLevelDropdown
    }));
  }

  setLanguage(language) {
    preventHandleClick = true;
    setQueryParams('lang', language)
    this.setState(prevState => ({
      language: language,
      showLanguageDropdown: false
    }));
  }

  setGrade(grade) {
    preventHandleClick = true;
    setQueryParams('tab', grade)
    setQueryParams('level', 'all')
    this.setState(prevState => ({
      grade: grade,
      level: 'all'
    }));
  }

  setLevel(level) {
    preventHandleClick = true;
    setQueryParams('level', level)
    this.setState(prevState => ({
      level: level,
      showLevelDropdown: false
    }));
  }

  showHelp(option) {
    preventHandleClick = true;
    this.setState(prevState => ({
      showHelp: option
    }));
  }

  render() {
    var props = this.props;
    let {showHighSchool, showMiddleSchool} = props;
    var {grade} = this.state;
    if( showHighSchool && !showMiddleSchool ){
      grade = 'highSchool';
    }
    const middleSchoolTabClasses = (grade == 'middleSchool') ? 'school-tab-active ' : '';
    const middleSchoolShow = (grade == 'middleSchool') ? 'show ' : 'hide ';
    const highSchoolTabClasses = (grade == 'highSchool') ? 'school-tab-active ' : '';
    const highSchoolShow = (grade == 'highSchool') ? 'show ' : 'hide ';

    var languageString;

    switch (this.state.language) {
    case 'all':
      languageString = 'All Languages';
      break;
    case 'languageEnglish':
      languageString = 'English';
      break;
    case 'languageSpanish':
      languageString = 'Spanish';
    }

    if (!(props.loaded && props.authFound))
    {
      props.getFlexbookInfo();
      props.getAuthInfo();
      return (<div>Loading...</div>);
    }
    else
    {
      const showForIndia = (props.cbseUrl && 'country_long' in this.props.location && this.props.location.country_long == 'india')
      return (
        <div onClick={() => this.handleClickOutside()} >
          <div id="view_books_tab" aria-labelledby="ui-id-5" className="ui-tabs-panel ui-widget-content ui-corner-bottom" role="tabpanel" aria-expanded="true" aria-hidden="false" style={{display: 'block'}}>
            <div className={'browse-cbse-banner browse-cbse-banner-small left show-for-small' + ((!showForIndia) ? " hide-important" : "")} style={{width:"calc(100% - 30px)"}}>
              <a href={props.cbseUrl}>
                <img src="/media/cbse/images/flag.png" className="left"/>
              </a>
              <a className="left browse-cbse-text-wrapper text-left bold" href={props.cbseUrl}>
                <div>
                  <span className="cbse-heading"> CBSE </span>
                  <span> FlexBooks® </span>
                </div>
                <div> from Class 9 to 12 </div>
              </a>
            </div>

            {this.props.showSchoolTabs &&
	          <div className='math-flexbook-tabs'>
	            <div className='row collapse desktop_view math-tabs-grade-list' style={{display:'block'}}>
	              <div className="text-center hide-small mshs-tabs-container">
	                {this.props.showMiddleSchool &&
                    <div className={middleSchoolTabClasses + 'school-tab' + ((!this.props.showHighSchool) ? ' full-width' : '')} data-hide="hs" data-show="ms" onClick={() => this.setGrade('middleSchool')}>{capitalizeFirstLetter(props.collectionHandle) + ' FlexBook® for Middle School'}
  	                  <span className = {middleSchoolShow + 'school-tab-triangle'}></span>
  	                </div>
                  }
                  {this.props.showHighSchool &&
  	                <div className={highSchoolTabClasses + 'school-tab' + ((!this.props.showMiddleSchool) ? ' full-width' : '')} data-hide="ms" data-show="hs" onClick={() => this.setGrade('highSchool')}>{capitalizeFirstLetter(props.collectionHandle) + ' FlexBook® for High School'}
  	                  <span className = {highSchoolShow + 'school-tab-triangle'}></span>
  	                </div>
                  }
	              </div>
	              <div className="text-center show-small mshs-tabs-container">
	                {this.props.showMiddleSchool &&
                    <div className={middleSchoolTabClasses + 'school-tab js_mshs_tab left' + ((!this.props.showHighSchool) ? ' full-width' : '')} style={{fontSize:'15px'}} data-hide="hs" data-show="ms" onClick={() => this.setGrade('middleSchool')}>For Middle School
  	                  <span className = {middleSchoolShow + 'school-tab-triangle'}></span>
  	                </div>
	                }
                  {this.props.showHighSchool &&
                    <div className={highSchoolTabClasses + 'school-tab js_mshs_tab left' + ((!this.props.showMiddleSchool) ? ' full-width' : '')} style={{fontSize:'15px'}} data-hide="ms" data-show="hs" onClick={() => this.setGrade('highSchool')}>For High School
  	                  <span className = {highSchoolShow + 'school-tab-triangle'}></span>
  	                </div>
                  }
	              </div>
	            </div>
	          </div>
	        }


            <div className="desktop_view">

              <div className="row collapse grades-drop-container math-grades-drop-container">

                <div className={'browse-cbse-banner left hide-for-small' + ((!showForIndia) ? ' hide-important' : '')}>
                  <a href={props.cbseUrl}>
                    <img src="/media/cbse/images/flag.png" className="left"/>
                  </a>
                  <a className="left browse-cbse-text-wrapper text-left bold" href={props.cbseUrl}>
                    <div>
                      <span className="cbse-heading"> CBSE </span>
                      <span> FlexBooks® </span>
                    </div>
                    <div> from Class 9 to 12 </div>
                  </a>
                </div>


                {this.props.showLevels &&
                  <span>
                    {LevelDropDown(this, 'ms')}
                    {LevelDropDown(this, 'hs')}
                  </span>
                }
                <div id="level-tooltip-container" className={"level-tooltip-container" + ((this.state.showHelp) ? "" : " hide")}>
                  <div className="level-tooltip-header">
                    <span>Levels are CK-12's student achievement levels.</span>
                  </div>
                  <div className="level-tooltip-grade">
                    <span className="level-tooltip-grade-title">Basic</span>
                    <span>Students matched to this level have a partial mastery of prerequisite knowledge and skills fundamental for proficient work.</span>
                  </div>
                  <div className="level-tooltip-grade">
                    <span className="level-tooltip-grade-title">At Grade (Proficient)</span>
                    <span>Students matched to this level have demonstrated competency over challenging subject matter, including subject matter knowledge, application of such knowledge to real-world situations, and analytical skills appropriate to subject matter.</span>
                  </div>
                  <div className="level-tooltip-grade">
                    <span className="level-tooltip-grade-title">Advanced</span>
                    <span>Students matched to this level are ready for material that requires superior performance and mastery.</span>
                  </div>
                  <div className="pointer level-tooltip-close js-level-tooltip-close" onClick={() => this.showHelp(false)}>
                    <i className="icon-close"></i>
                  </div>
                </div>

                {this.props.showLanguages &&
                  <div className="language-drop right">
	                <div className="button small split simple language-filter-container right"  onClick={() => this.languageDropdownToggle()}>
	                  <a className="language-filter-label">{languageString}</a>
	                  <span className="js-close-drop-down close-drop-down"></span>
	                </div>
	                <ul style={{position: 'absolute', top: '24px'}} className={"f-dropdown tangerine-list simple language-filter-dropdown " + ((this.state.showLanguageDropdown) ? "" : " hide")} id="language-filter-dropdown">
	                  <li className={"js-language-filter-level" + ((this.state.language == "all") ? " hide" : "")} data-lang="all language"><a onClick={() => this.setLanguage('all')}>All Languages</a></li>
	                  <li className={"js-language-filter-level" + ((this.state.language == "languageEnglish") ? " hide" : "")} data-lang="english"><a onClick={() => this.setLanguage('languageEnglish')}>English</a></li>
	                  <li className={"js-language-filter-level" + ((this.state.language == "languageSpanish") ? " hide" : "")} data-lang="spanish"><a onClick={() => this.setLanguage('languageSpanish')}>Spanish</a></li>
	                </ul>
	              </div>
	          	}

              </div>

              <FlexbookContainer isTeacher={this.props.isTeacher} level={this.state.level} language={this.state.language} grade={grade} showCBSE={showForIndia}/>

            </div>
          </div>
        </div>
      );
    }
  }
};

const mapStateToProps = (state) => {
  return {
    loaded: isFlexbookLoaded(state),
    collectionHandle: getFlexbookHandle(state),
    showSchoolTabs: getFlexbooks(state, 'showSchoolTabs'),
	  showLanguages: getFlexbooks(state, 'showLanguages'),
    showMiddleSchool: (getFlexbooks(state, 'middleSchool').length != 0),
    showHighSchool: (getFlexbooks(state, 'highSchool').length != 0),
	  showLevels: getFlexbooks(state, 'showLevels'),
    authFound: isAuthFound(state),
    showmsBasic: (intersect(getFlexbooks(state, 'levelBasic'),
                             getFlexbooks(state, 'middleSchool')).length != 0),
    showmsAtGrade: (intersect(getFlexbooks(state, 'levelAtGrade'),
                             getFlexbooks(state, 'middleSchool')).length != 0),
    showmsAdvanced: (intersect(getFlexbooks(state, 'levelAdvanced'),
                             getFlexbooks(state, 'middleSchool')).length != 0),
    showhsBasic: (intersect(getFlexbooks(state, 'levelBasic'),
                            getFlexbooks(state, 'highSchool')).length != 0),
    showhsAtGrade: (intersect(getFlexbooks(state, 'levelAtGrade'),
                             getFlexbooks(state, 'highSchool')).length != 0),
    showhsAdvanced: (intersect(getFlexbooks(state, 'levelAdvanced'),
                             getFlexbooks(state, 'highSchool')).length != 0),
    auth: getAuth(state),
    isTeacher: isTeacher(state),
    cbseUrl: getSubjectLinks(state, 'cbseURL')
  };
};

export default connect(
  mapStateToProps,
  {
    getFlexbookInfo,
    getAuthInfo
  }
)(BooksTab);
