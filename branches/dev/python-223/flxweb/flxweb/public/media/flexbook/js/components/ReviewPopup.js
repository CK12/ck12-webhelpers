import React, {Component} from 'react';
import Button from './common/Button';
import Link from './common/Link';
import Separator from './common/Separator';
import ReviewInput from './ReviewInput';
import {postFeedback, deleteFeedback} from '../actions/feedback';
import {connect} from 'react-redux';
import {formatDate} from '../utils/utils';
import {getCurrentSectionInfo} from '../selectors/selectors';
import Popup from './common/Popup';
import Radium from 'radium';

@Radium
class ReviewPopup extends Component{
  render(){
    let {oldComment} = this.props;
    return (
      <Popup style={styles.mobilePopup}>
        <ReviewInput ref='review' value={oldComment}/>
        <Separator/>
        <div style={styles.buttonContainer}>
          <Button color='turquoise' style={styles.submitButton} handleClick={()=>this.submitReview()}>Submit Review</Button>
          <Button handleClick={()=>this.postFeedback()} color='grey'>Skip Review</Button>
        </div>
        <Link style={styles.removeLink} onClick={()=>this.removeFeedback()}>Remove</Link>
      </Popup>
    );
  }

  submitReview(){
    let {review:{refs:{textarea}}} = this.refs;
    let comment = textarea.value;
    if(comment){
      this.postFeedback(comment);
    }
  }

  postFeedback(comment=''){
    let data = this.getCommentData();
    this.props.postFeedback({
      comment,
      ...data
    });
    this.props.closePopup();
  }

  getCommentData(){
    let {score, id, userInfo} = this.props,
      {firstName, lastName, id: memberID} = userInfo,
      timestamp = formatDate(new Date());
    let name = `${firstName} ${lastName}`;
    return {
      score, id, name, timestamp, replies: [], memberID, type: 'vote'
    };


  }

  removeFeedback(){
    let {id, memberID} = this.props;
    this.props.deleteFeedback({id, memberID});
    this.props.closePopup(true);
  }
}



const styles = {
  mobilePopup:{
    '@media screen and (max-width:425px)':{
      width: '320px'
    }
  },
  buttonContainer: {
    textAlign: 'center',
    '@media screen and (max-width:425px)':{
      float: 'left',
      paddingLeft: '8px'
    }
  },
  submitButton: {
    marginRight: 10
  },
  removeLink: {
    float: 'right',
    position: 'relative',
    bottom: 30,
    right: 30,
    '@media screen and (max-width:425px)':{
      bottom: '0px'
    }
  }
};

ReviewPopup.propTypes = {
  closePopup: React.PropTypes.func
};

const mapStateToProps = (state) => {
  let {artifact:{id}} = getCurrentSectionInfo(state);
  let {userInfo: {id: memberID}} = state;
  return {
    id,
    memberID,
    ...state
  };
};


export default connect(
  mapStateToProps,
  {
    postFeedback,
    deleteFeedback
  }
)(ReviewPopup);
