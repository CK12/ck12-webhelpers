import React from 'react';
import Icon from './common/Icon';
import Link from './common/Link';
import ReviewPopup from './ReviewPopup';
import {getLoggedInUserInfo,getCurrentSectionInfo} from '../selectors/selectors';
import { showSigninDialog } from '../utils/requireBridge';
import {connect} from 'react-redux';
import {postFeedback} from '../actions/feedback';
import Radium from 'radium';

@Radium
class RatingsActions extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isPopupOpen: false,
      rating: this.props.score
    };
  }
  render(){
    let {canEdit, oldComment} = this.props;
    return (
      <div className='ratingactions' style={styles.container}>
        <span> {canEdit?<span onClick={()=>this.handleEdit()}><Link>Edit review</Link></span>: 'Was this helpful?'} </span>
        <div style={styles.iconContainer} onClick={()=>this.handleUpvote()}>
          <Icon name='like' size='xxlarge' color='#1aaba3' style={styles.icon}/>
          <span title='Helpful' style={styles.likeContainer}> Yes </span>
        </div>
        <div style={styles.iconContainer} onClick={()=>this.handleDownvote()}>
          <Icon style={[styles.unlikeIcon, styles.icon]} name='unlike' size='xxlarge' color='#ff6633'/>
          <span title='Not helpful' style={styles.unlikeContainer}> No </span>
        </div>
        {
          this.state.isPopupOpen && 
          <ReviewPopup oldComment={oldComment} score={this.state.rating} closePopup={(isRemoved)=>this.closePopup(isRemoved)}/>
        }
      </div>
    );
  }

  componentWillReceiveProps(newProps){
    let {oldComment: newComment} = newProps;
    let {oldComment} = this.props;
    if(!newComment && oldComment){
      this.setState({
        rating: 0,
        rated: false
      });
    }
  }

  handleUpvote(){
    if(!this.props.loggedIn){
      showSigninDialog();
      return;
    }
    if(this.state.rating != 1){
      this.setState({
        isPopupOpen: true,
        rating: 1,
        rated: true
      });
      this.addFeedback(1);
    }
  }

  handleDownvote(){
    if(!this.props.loggedIn)
      showSigninDialog();
    if(this.props.loggedIn){
      if(this.state.rating != -1){
        this.setState({
          isPopupOpen: true,
          rating: -1,
          rated: true
        });
        this.addFeedback(-1);
      }
    }
  }

  handleEdit(){
    this.setState({
      isPopupOpen: true
    });
  }

  addFeedback(score){
    let {id, userID} = this.props;
    this.props.postFeedback({
      score,
      memberID: userID,
      id,
      type: 'vote'
    });
  }

  closePopup(isRemoved){
    let rating = isRemoved? 0 : this.state.rating; 
    this.setState({
      isPopupOpen: false,
      rating
    });
  }
}

const mapStateToProps = (state) => {
  let {feedback: {score: {userScoreMap}, reviews: {userReviewMap}}} = state;
  let {artifact:{id}} = getCurrentSectionInfo(state);
  let {id:userID, loggedIn} = getLoggedInUserInfo(state);
  let canEdit = (userScoreMap[userID])? true: false,
    oldReview = userReviewMap[userID],
    oldComment = oldReview && oldReview.comment,
    score = oldReview && oldReview.score
  return {
    canEdit,
    id,
    userID,
    loggedIn,
    oldComment,
    score
  };

};

const styles = {
  container: {
    float: 'right',
    verticalAlign: 'top',
    '@media screen and (max-width: 767px)':{
      float: 'none'
    }
  },
  iconContainer: {
    cursor: 'pointer',
    display: 'inline-block',
    marginLeft: 10
  },
  likeContainer: {
    color: '#1aaba3'
  },
  unlikeContainer: {
    color: '#ff6633'
  },
  icon: {
    '@media screen and (max-width: 767px)':{
      fontSize: 16
    }
  },
  unlikeIcon: {
    position: 'relative',
    top: 10,
    '@media screen and (max-width: 767px)':{
      top: 4
    }
  }
};
export default connect(
  mapStateToProps,
  {
    postFeedback
  }
)(RatingsActions);
