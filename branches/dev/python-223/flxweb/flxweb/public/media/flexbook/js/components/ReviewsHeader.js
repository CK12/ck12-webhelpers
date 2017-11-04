import React from 'react';
import RatingsActions from './RatingsActions';
import Review from './Review';
import Header from './common/Header';


const ReviewsHeader = () => {
  return (
    <div
      className='reviewsheader'
      style={styles.container}>
      <Header style={styles.header} size='header2'>Reviews</Header>
      <RatingsActions/>
    </div>
  );
};

const styles = {
  container: {
    marginTop: 60
  },
  header: {
    verticalAlign: 'top'
  }
};
export default ReviewsHeader;
