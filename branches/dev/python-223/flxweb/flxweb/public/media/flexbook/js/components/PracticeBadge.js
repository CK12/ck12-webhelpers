import React, {Component} from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import {fetchAssessmentScore, 
  togglePracticeWidget, 
  fetchPracticeUrl,
  stopPracticeLoading} from '../actions/practice.js';
import {  userHasRole,
  getCurrentSectionArtifact,
  getAssessmentScoreCard,
  getPracticeHandle,
  getSectionDomain,
  getLastSubject,
  getFlexBookSubjects,
  getCollectionInfo,
  isCustomFlexBook,
  showPracticeBadge,
  isSectionArtifact} from '../selectors/selectors.js';
import * as constants from '../constants/constants';
import Header from './common/Header';
import Button from './common/Button';
import Icon from './common/Icon';
import CircularProgressBar from './CircularProgressBar';
import {Row, Column} from 'react-foundation';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import {formatHandle, removePracticeKeyword} from '../utils/utils';
import {isMobile} from '../utils/utils';
import {assignToClass} from '../utils/requireBridge';
import SelectButton from '../components/common/SelectButton';

@Radium
class PracticeBadge extends Component{
  constructor(){
    super();
    this.toggleMaximize = this.toggleMaximize.bind(this);
    this.toggleMinimize = this.toggleMinimize.bind(this);
  }
  
  componentWillReceiveProps(newProps){
    let {handle: newHandle, assessment: newAssessment, practice, artifact, domain} = newProps,
      {handle, subject, assessment, artifact:{encodedID}, collections, isTeacher, isCustom} = this.props;
    if(artifact && (artifact.domainCollectionContexts || artifact.isDraft) && !domain && practice.loading)
    {
      this.props.stopPracticeLoading();
    }
    if(newHandle != '' && newHandle != handle)
    {
      this.props.fetchAssessmentScore(newHandle);
    }
    if(!isEmpty(newAssessment) && newAssessment!=assessment)
    {
      if(isTeacher || isCustom || isMobile())
      {
        this.props.stopPracticeLoading();   
      }
      else{
        let {pointsAndAwards}  = newAssessment;
        let collectionInfo;
        if(!isEmpty(collections)){
          let {collectionCreatorID, collectionHandle, conceptCollectionHandle} = collections;
          collectionInfo = '&collectionCreatorID=' + collectionCreatorID + '&collectionHandle=' + collectionHandle + '&conceptCollectionHandle=' + conceptCollectionHandle;
        } 
        this.props.fetchPracticeUrl({
          practiceHandle: handle, 
          branchHandle: subject, 
          encodedID, 
          pointsAndAwards, 
          collectionInfo,
          spacedSchedule:true
        });
      }
    }
  }

  componentDidUpdate(prevState, prevProps){
    let {practice:{toggle:oldToggle}, artifact:{revisionID}} = prevState;
    let {practice:{toggle, url}, isSection} = this.props;
    let {currentRevisionID} = this.state;
    if(revisionID!=currentRevisionID)
    {
      url!='' && this.props.togglePracticeWidget(true);
      if(url!='' || !isSection)
      {
        this.setState({
          currentRevisionID: revisionID
        });
      }
    }
    if(toggle && toggle!=oldToggle)
    {
      this.initWidget();
    }
  }

  initWidget(){ 
    let {practice:{url:practiceUrl}} = this.props;
    if(practiceUrl!='')
    {
      let settings = {
         "onMinimize" : this.toggleMinimize,
         "onMaximize" : this.toggleMaximize,
         "onNormalize" : this.toggleMaximize
      };
      window.practiceWidgetRenderer && window.practiceWidgetRenderer.render('practiceWidget',practiceUrl,settings); 
    }
  } 

  toggleMaximize(){ 
    let widgetWindow = document.getElementsByClassName("widget-iframe")[0].contentWindow;
    let practiceWidget = document.getElementById("practiceWidget");
    if(practiceWidget.classList.contains("practiceWidget-static-class"))
    {
      practiceWidget.classList.remove("practiceWidget-static-class");
      this.setState({
        isMaximised: false
      });
    }
    else
    {
      this.setState({
        isMaximised: true
      });
      practiceWidget.classList.add("practiceWidget-static-class");  
    }
    if(widgetWindow && widgetWindow.handleReportView){
      widgetWindow.setTimeout(function(){
          widgetWindow.handleReportView();
      },500);
    }
  }

  toggleMinimize(value=false){
    let {handle} = this.props;
    if(!value)
    {
      this.props.fetchAssessmentScore(handle);
    }
    this.props.togglePracticeWidget(value);
  }

  render(){
    let { artifact, assessment, title, isTeacher, handle, practice:{toggle}, showBadge} = this.props;
    let {eta, pointsAndAwards, attemptsCount, title: practiceTitle} = assessment,
      mins = eta? Math.round(eta/60) : 10;
    pointsAndAwards = pointsAndAwards || {};
    let {goal, correctAnswers, answersToComplete} = pointsAndAwards,
      score;//default to 10 mins
    goal = goal || answersToComplete || 0;
    score = goal == 0? 0: correctAnswers/goal;
    let isGoalAccomplished = (score>=1);
    let buttonText =  isTeacher?'Select'
                      :attemptsCount?
                        (isGoalAccomplished?'Keep Practicing':'Get ' + answersToComplete +' more correct')
                        :'Practice';

    title = !practiceTitle?title : removePracticeKeyword(practiceTitle).trim();
    if (showBadge){
      if(!toggle){
        return(
          <Row isCollapsed>
            <div className='practicebadge' style={styles.container}>
              <Column large={5}>
                <div style={styles.left}>
                <img style={styles.img}  src='/media/flexbook/images/practice_image.png'/>
                <CircularProgressBar progress={isTeacher? 0.0 : score || 0.0} color={!isTeacher && isGoalAccomplished?'#B8D543':'#FF6633'} style={{zIndex: 10}}/>
                <CircularProgressBar progress={1} color={'#FFF'}/>
                {isTeacher || !attemptsCount ?(
                    <span style={styles.eta}> Estimated <br/><span style={styles.time}>{mins}</span> mins <br/> to complete </span>
                  ):(
                    <span style={styles.score}>{score*100}%</span>
                  )
                }
                <div style={styles.label}>progress</div>
                </div>
              </Column>
              <Column large={7}>
                <div style={styles.right}>
                  {isTeacher || !attemptsCount ?(
                      <div style={{textAlign: 'center'}}>
                        <span style={{fontWeight:'bold'}}>Practice</span>
                        <span style={{wordBreak:'break-word'}}> {title}</span></div>
                    ):(
                      <span style={styles.right}>
                        <div>
                          <Icon size='large' color='#FFCF2A' name='running'/>
                        </div>
                        <Header size='header5'>Improve your score</Header>
                      </span>
                    )
                  }
                  {!isTeacher?
                    (<Button
                      style={styles.practiceButton}
                      color='tangerine'
                      arrow={{type:'right', color: '#D9491A'}}
                      handleClick={()=>this.handleClick()}>
                      {buttonText}
                    </Button>):
                    (<SelectButton style={styles.practiceSelectButton}
                      color='tangerine'
                      arrow={{type:'down', color: 'white'}}
                      handleSelectClick={(val)=>this.handleClick(val)}
                      value={buttonText}
                      options={constants.PRACTICE_OPTIONS}>
                    </SelectButton>)
                  }
                </div>
              </Column>
            </div>
          </Row>
        );
      }
      else{
        return(<span id='practiceWidget' style={this.state.isMaximised?{}:styles.practiceWidget}></span>);
      }
    }
    else{
      return(<div></div>);
    }
  }

  handleClick(val){
    let {subject, handle, domain: artifactHandle, isTeacher, practice:{id}, isCustom} = this.props;
    if(isTeacher)
    {
      if(val == 'Preview')
      {
        window.location.href = `/${subject.toLowerCase()}/${artifactHandle}/asmtpractice/${handle}`;  
      }
      else if(val == 'Assign Practice')
      {
        assignToClass(formatHandle(handle), id);
      }
    }
    else if(isCustom || isMobile())
    {
      window.location.href = `/assessment/ui/?test/view/practice/${subject.toLowerCase()}/${handle}`;  
    }
    else{
      this.toggleMinimize(true);
    }
  }
}

const styles = {
  practiceButton:{
    top:'5px',
    padding: '7px 10px 9px 10px'
  },
  practiceSelectButton:{
    top:'5px',
    padding: '7px 52px 9px',
    color: 'white',
    fontWeight: 'bold'
  },
  practiceWidget: {
    width: '40%',
    position: 'absolute',
    left: '690px',
    top: '135px'
  },
  container: {
    backgroundColor: '#FFF',
    borderBottom: '5px solid #b5b1a8',
    boxShadow: '0 0 0 1px #b5b1a8',
    display: 'inline-block',
    float: 'right',
    height: 'auto',
    width: 320,
    marginTop:'-20px',
    '@media screen and (max-width:767px)':{
      display: 'none'
    }
  },
  left: {
    float: 'left'
  },
  right: {
    float: 'right',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'center',
    padding: 10
  },
  img:{
    width: 131,
    height: 91
  },
  label: {
    color: '#AFABA2',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  score:{
    position: 'absolute',
    top: 35,
    left: 35,
    color: 'white',
    width: '50%',
    lineHeight: '85%',
    textAlign: 'center',
    fontSize: '24px'
  },
  eta: {
    position: 'absolute',
    top: 28,
    left: 35,
    fontWeight: 'bold',
    color: 'white',
    width: '50%',
    lineHeight: '85%',
    textAlign: 'center',
    fontSize: '12px'
  },
  time: {
    fontSize:'16px',
    lineHeight:'13px'
  }
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state),
    {title} = artifact,
    collections = getCollectionInfo(state),
    assessment = getAssessmentScoreCard(state),
    handle = getPracticeHandle(state),
    domain = getSectionDomain(state),
    flexbookSubjects = getFlexBookSubjects(state),
    subject = getLastSubject(state) || (flexbookSubjects[0] && flexbookSubjects[0].name),
    isTeacher = userHasRole(state,constants.TEACHER),
    isCustom = isCustomFlexBook(state),
    showBadge = showPracticeBadge(state),
    {practice} = state,
    isSection = isSectionArtifact(state);
    title=formatHandle(title);
  return { 
    artifact,
    assessment,
    handle,
    domain,
    title,
    isTeacher,
    subject,
    practice,
    collections,
    isCustom,
    showBadge,
    isSection
  };
};


export default connect(
  mapStateToProps,
  {
    fetchAssessmentScore,
    togglePracticeWidget,
    fetchPracticeUrl,
    stopPracticeLoading
  }
)(PracticeBadge);
