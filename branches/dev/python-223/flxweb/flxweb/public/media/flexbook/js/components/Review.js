import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import Link from './common/Link';
import Separator from './common/Separator';
import ReviewInfo from './ReviewInfo';
import ReviewHelpful from './ReviewHelpful';
import ReviewActions from './ReviewActions';
import CommentBox from './CommentBox';
import Replies from './Replies';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import {replyToFeedback, deleteFeedback, reportFeedback} from '../actions/feedback';
import {
  getCurrentSectionArtifactID,
  getLoggedInUserInfo,
  getReplies
} from '../selectors/selectors.js';
import { showSigninDialog } from '../utils/requireBridge';
import {formatDate} from '../utils/utils';

class Review extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showReplies: false,
      showCommentBox: false
    };
  }


  render(){
    let {replies, comment = '', id: reviewerID, reviewersMemberID: memberID, userHelpfulMap, modifiedHelpful, abuseReporters, createdTime, ...other} = this.props;
    let numReplies = isEmpty(replies)? 0: replies.length;
    createdTime = formatDate(createdTime);
    let canDelete = reviewerID ==  memberID,
      canAbuse = !includes(abuseReporters, memberID);
    let helpful = userHelpfulMap[reviewerID];
    return (
      <div className='review'>
        <ReviewInfo createdTime={createdTime} {...other}/>
        <div style={styles.comment}>{comment}</div>
        <Link style={styles.link} onClick={()=>this.toggleComments()}> {`${numReplies} ${numReplies==1?'Comment': 'Comments'}`} </Link>
        <Link style={[styles.replyText, styles.link]} onClick={()=>this.showCommentBox()}> Reply </Link>
        <ReviewHelpful modifiedHelpful={modifiedHelpful} reviewerID={reviewerID} helpful={helpful}/>
        <ReviewActions canDelete={canDelete} canAbuse={canAbuse} reportComment={()=>this.reportComment()} deleteComment={()=>this.deleteComment()}/>
        <Separator/>
        {this.state.showCommentBox && <CommentBox postComment={(comment)=>this.postComment(comment)} cancelComment={()=>this.handleCommentCancellation()}/>}
        {this.state.showReplies && <Replies isLatest={this.state.isLatest} reviewerID={reviewerID} replies = {replies}/> }
      </div>
    );
  }

  toggleComments(){
    let {showReplies,isLatest} = this.state;
    showReplies = !showReplies;
    if(isLatest)
    {
      showReplies = true;
    }

    this.setState({
      showReplies,
      isLatest: false
    });
  }

  showCommentBox(){
    if(!this.props.loggedIn)
      showSigninDialog();
    this.props.loggedIn && this.setState({showCommentBox: true});
  }

  handleCommentCancellation(){
    this.setState({showCommentBox: false});
  }

  postComment(comment){
    //memberID is the ID of the user who has written the review
    //reviewersMemberID is the ID of the user who posts a reply
    let {reviewersMemberID, artifactID, id: memberID, userRepliesMap, firstName, lastName} = this.props;
    this.props.replyToFeedback({
      userRepliesMap,
      reviewComment: comment,
      memberID,
      artifactID,
      reviewersMemberID,
      name:firstName,
      surName: lastName});
    this.setState({
      showCommentBox: false,
      showReplies: true,
      isLatest: true
    });
  }

  deleteComment(){
    let {artifactID: id, reviewersMemberID: memberID} = this.props;
    this.props.deleteFeedback({id, memberID});
  }

  reportComment(){
    let {artifactID, id: reviewerID, reviewersMemberID: userID} = this.props;
    this.props.reportFeedback({artifactID, reviewerID, userID});
  }
}

const styles = {
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  time: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
    marginRight: 4
  },
  link: {
    fontWeight: 'bold',
    fontSize: 12
  },
  replyText: {
    marginLeft: 5
  },
  comment: {
    wordWrap: 'break-word'
  }

};

const mapStateToProps = (state, props) => {
  let {id: reviewID} = props;
  let artifactID = getCurrentSectionArtifactID(state),
    {id: reviewersMemberID, loggedIn, firstName, lastName} = getLoggedInUserInfo(state),
    {feedback: {helpful: {userHelpfulMap}, reviews: {userReviewMap}}} = state,
    userRepliesMap = getReplies(state),
    replies = userRepliesMap && userRepliesMap[reviewID];
  return {replies, artifactID, reviewersMemberID, loggedIn, userRepliesMap, userHelpfulMap, userReviewMap, firstName, lastName};
};

export default Radium(connect(
  mapStateToProps,
  {
    replyToFeedback,
    deleteFeedback,
    reportFeedback
  }
)(Review));
