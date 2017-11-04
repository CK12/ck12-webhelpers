import React from 'react';
import Ratings from '../components/Ratings';
import Reviews from '../components/Reviews';
import ReviewsHeader from '../components/ReviewsHeader';
import Separator from '../components/common/Separator';
import {fetchFeedback} from '../actions/feedback.js';
import {connect} from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import Spinner from '../components/common/Spinner';
import {isChapter} from '../utils/utils';
import {Row} from 'react-foundation';

class Feedback extends React.Component{
  componentWillMount(){
    if (!isEmpty(this.props.locationInfo) && !this.props.loaded){
      this.props.fetchFeedback(this.props.locationInfo);
    }
  }

  componentWillReceiveProps(newProps){
    let {currentTOCSection} = newProps;
    if(currentTOCSection != this.props.currentTOCSection){
      let [chapterPos, sectionPos] = currentTOCSection.split('.');
      this.props.fetchFeedback({...this.props.locationInfo, chapterPos, sectionPos});
    }
  }


  render(){
    let {loaded, score, reviews, currentTOCSection} = this.props;
    //  let {reviews} = feedback;
    let {upvotes, downvotes, percentage, total} = score;
    /*if(isChapter(currentTOCSection))
      return null;
    */
    if(loaded){
      return (
        <div className='feedback'>
          <ReviewsHeader/>
          <div className='show-for-large'>
            <Separator size='mini'/>
          </div>
          <Ratings
            upvotes={upvotes}
            downvotes={downvotes}
            percentage={percentage}
            total={total}/>
          <Reviews reviews={reviews}/>
        </div>
      );
    }
    return (
      <Spinner/>
    );
  }
}

const mapStateToProps = (state) => {
  let {currentTOCSection, locationInfo, feedback} = state;
  let {loaded, score, reviews} = feedback;
  return {currentTOCSection, locationInfo, loaded, score, reviews, ...feedback};
};

export default connect(
  mapStateToProps,
  {
    fetchFeedback
  }
)(Feedback);
