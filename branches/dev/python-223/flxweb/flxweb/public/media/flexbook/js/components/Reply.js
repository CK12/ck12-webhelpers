import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReviewInfo from './ReviewInfo';
import ReviewActions from './ReviewActions';
import Separator from './common/Separator';
import {deleteFeedbackReview, reportFeedbackReview} from '../actions/feedback';
import {formatDate} from '../utils/utils';
import {getLoggedInUserInfo} from '../selectors/selectors.js';
import includes from 'lodash/includes';
import {LOADINGICON} from '../constants/constants';

class Reply extends Component{
  render(){
    let {memberID, reviewer:{name, surName, id:reviewID}, createdTime, reviewComment: comment, id, abuseReporters} = this.props;
    createdTime  = formatDate(createdTime);
    let canDelete = (memberID === reviewID) && id,
        canAbuse = !includes(abuseReporters, memberID) && id;
    return(
      <div className='reply'>
        {!id && <img style={styles.loading} src={LOADINGICON} width="43" height="11"/>}
        <ReviewInfo name={`${name} ${surName}`} createdTime={createdTime} isIcon={false} />
        <ReviewActions style={{marginTop:'-30px'}} canDelete={canDelete} canAbuse={canAbuse} reportComment={()=>this.reportFeedbackReview()} deleteComment={()=>this.deleteFeedbackReview()}/>
        <div style={styles.comment}>{comment}</div>
      <Separator/>
      </div>
    );
  }

  reportFeedbackReview(){
    let {reviewerID: commenterID, id, memberID} = this.props;
    this.props.reportFeedbackReview({commenterID, id, memberID});
  }

  deleteFeedbackReview(){
    //commenterID is the id of parent Review
    //id is the feedbackID
    let {reviewerID: commenterID, id} = this.props;
    this.props.deleteFeedbackReview({commenterID, id});
  }
}

const styles = {
  loading: {
    float: 'right'
  },
  comment:{
    wordWrap: 'break-word'
  }
}

const mapStateToProps = (state) => {
  let {id: memberID} = getLoggedInUserInfo(state);
  return {memberID};
};

export default connect(
  mapStateToProps,
  {
    deleteFeedbackReview,
    reportFeedbackReview
  }
)(Reply);
