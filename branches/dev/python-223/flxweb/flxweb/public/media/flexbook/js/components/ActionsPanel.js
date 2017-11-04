import React, {Component} from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import Link from './common/Link';
import { showSigninDialog, assignToClass } from '../utils/requireBridge';
import ShareToGroups from './ShareToGroups';
import AddToLibrary from './AddToLibrary';
import {connect} from 'react-redux';
import {userHasRole,
        isUserLoggedIn, 
        getSectionTitle, 
        isChapterPosition,
        getCurrentSectionArtifact,
        getCurrentArtifactRevisionID,
        getAssessmentScoreCard,
        getPracticeHandle,
        getFlexBookSubjects,
        getLastSubject,
        getCurrentArtifactType } from '../selectors/selectors';
import {checkRevisionAdded} from '../utils/utils';
import includes from 'lodash/includes';
import * as ArtifactTypes from '../constants/artifactTypes';
import {TEACHER, OPEN_IN_APP_LINK } from '../constants/constants';
import isEmpty from 'lodash/isEmpty';
import CircularProgressBar from './CircularProgressBar';

import Radium from 'radium';

@Radium
class ActionsPanel extends Component{
  constructor(){
    super();
    this.state = {
      showShareToGroups: false,
      showAddToLibrary: false
    };
  }

  openAddToLibrary(){
    let {revisionsAdded} = this.props;
    if(!revisionsAdded)
    {
      this.setState({
        showAddToLibrary: true
      });
    }
  }

  closeAddToLibrary(){
     this.setState({
      showAddToLibrary: false
    });
  }

  openShareToGroups(){
    this.setState({
      showShareToGroups: true
    });
  }

  closeShareToGroups(){
    this.setState({
      showShareToGroups: false
    });
  }

  handlePracticeClick(){
    let {subject, handle} = this.props;
    window.location.href = `/assessment/ui/?test/view/practice/${subject.toLowerCase()}/${handle}`;   
  }

  getMainButton(){
    let {isTeacher,assessment,handle, title, artifactID, loggedIn} = this.props,
    mainButton = null;
    if(isTeacher)
    {
      mainButton = (
        <Button color='turquoise' style={styles.mainButton} handleClick={()=>{
            loggedIn? assignToClass(title, artifactID): showSigninDialog();
        }}>
          <Icon name='grps_assgnmts' color='#0089A6' style={styles.assignToClassIcon}/>
          <span>Assign to Class</span>
        </Button>
      );
    }
    else if(handle!='' && !isEmpty(assessment))
    {
      let {pointsAndAwards, attemptsCount} = assessment;
      pointsAndAwards = pointsAndAwards || {};
      let {goal, correctAnswers, answersToComplete} = pointsAndAwards;
      goal = goal || answersToComplete || 0;
      let score = goal == 0? 0: correctAnswers/goal,
      isGoalAccomplished = (score>=1);
      let practiceText = attemptsCount? isGoalAccomplished ? 'Keep Practicing': 'Keep Going'
                        :'Practice';
      let newCircleStyles = isGoalAccomplished?Object.assign({},styles.innerCircle,{borderColor:'#B8D543'}):styles.innerCircle;                         
      if(attemptsCount)
      {
        mainButton= (
          <div style={styles.practiceContainer}>
            <div style={styles.practiceBox}>
              <span style={[styles.alignMiddle,{color:'#AFABA2',fontSize:'10px'}]}>PROGRESS</span>
              <span style={styles.alignMiddle}>
                <CircularProgressBar progress={score || 0.0} borderColor='#EFEDE7' color={isGoalAccomplished?'#B8D543':'#FF6633'} style={styles.innerCircle}/>
              </span>
              <span style={styles.alignMiddle}>{score*100}%</span>
              <Button color='tangerine' style={[styles.mainButton,{marginLeft:'5%'}]} handleClick={()=>{
                this.handlePracticeClick();}}>  
                <span>{practiceText}</span>
              </Button>
            </div>
          </div>
        )
      }
      else
      {
        mainButton = (
          <Button color='tangerine' style={styles.mainButton} handleClick={()=>{
            this.handlePracticeClick();}}>
            <span>{practiceText}</span>
          </Button>
        )
      }
      
    }
    return mainButton;
  }

  render(){
    let {loggedIn, isChapter, revisionsAdded, artifactType, artifactRevisionID} = this.props;
    let plusColor=(revisionsAdded)?'#8e8774':'#00cccc';
    return(
      <div style={styles.container}>
        {!includes(ArtifactTypes.BOOK_TYPES, artifactType) && !isChapter && this.getMainButton()}
        <div style={styles.floatedButtons}>
          <Button color='white' style={[styles.nextButton, styles.whiteButtons]} handleClick={()=>{
            loggedIn? this.openShareToGroups() : showSigninDialog();
          }}> Share </Button>
          {this.state.showShareToGroups && <ShareToGroups isMobile={true} style={styles.sharetogroups} callbackParent={()=>{this.closeShareToGroups()}}/>}
          {this.state.showAddToLibrary &&  <AddToLibrary callbackParent={()=>this.closeAddToLibrary()}/>}
          {!isChapter ?(
            <Button
              color='white'
              style={[styles.nextButton, styles.whiteButtons]}
              handleClick={()=>{
                loggedIn? this.openAddToLibrary(): showSigninDialog();
              }}>
              <Icon name='plus' size='xsmall' color={plusColor} style={styles.plusIcon}/>
                Add to Library
            </Button>
            ): null
          }
          {includes(ArtifactTypes.BOOK_TYPES, artifactType) && (
            <Button
              color='turquoise'
              style={styles.whiteButtons}>
              <Link style={{color:'white'}} href={OPEN_IN_APP_LINK + artifactRevisionID}>
                Open in App
              </Link>
            </Button>)
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let {loggedIn} = isUserLoggedIn(state),
  artifact = getCurrentSectionArtifact(state),
  {id:artifactID} = artifact,
  revisionsAdded = checkRevisionAdded(loggedIn, artifact.revisions),
  assessment = getAssessmentScoreCard(state),
  isTeacher = userHasRole(state,TEACHER),
  handle = getPracticeHandle(state),
  flexbookSubjects = getFlexBookSubjects(state),
  subject = getLastSubject(state) || (flexbookSubjects[0] && flexbookSubjects[0].name),
  artifactType = getCurrentArtifactType(state);
  return {
    loggedIn,
    revisionsAdded,
    artifactID,
    title: getSectionTitle(state),
    isChapter: isChapterPosition(state),
    artifactRevisionID: getCurrentArtifactRevisionID(state),
    artifactType,
    isTeacher,
    handle,
    subject,
    assessment
  };
};

const styles = {
  alignMiddle:{
    flexDirection:'column',
    display: 'flex',
    justifyContent: 'center',
    marginRight: '4%',
    marginLeft: '4%'
  },
  innerCircle:{
    position: 'relative',
    left: 'auto',
    top: 'auto',
    height: '25px',
    width: '25px'
  },
  practiceContainer: {
    borderBottom: '3px solid #b5b1a8',
    boxShadow:'0 0 0 1px #b5b1a8' 
  },
  practiceBox:{
    display: 'flex',
    minHeight: '56px',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  sharetogroups: {
    top: '35px',
    position: 'relative',
    right: '275px',
    float: 'right'
  },
  container: {
    paddingTop: '15px',
    '@media screen and (min-width: 768px)':{
      display: 'none'
    },
    '@media screen and (max-width: 767px)':{
      display: 'block',
      width: '100%'
    }
  },
  nextButton: {
    marginLeft: '8px'
  },
  assignToClassIcon: {
    position: 'relative',
    top: 3,
    marginRight: 5
  },
  whiteButtons: {
    fontWeight: 500,
    lineHeight: '20px',
    float: 'right'
  },
  plusIcon: {
    marginRight: 2
  },
  floatedButtons: {
    paddingTop: '15px'
  },
  mainButton: {
    width: '100%'
  }
};

export default connect(
  mapStateToProps,
  null
)(ActionsPanel);
