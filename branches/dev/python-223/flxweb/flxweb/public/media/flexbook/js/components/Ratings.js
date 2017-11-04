import React from 'react';
import Radium from 'radium';
import Icon from './common/Icon';
import {Row, Column} from 'react-foundation';

const Ratings = ({upvotes = 0, downvotes = 0, percentage = 0}) => {
  return (
    <div className='ratings' style={styles.container}>
      <div className='show-for-large' style={styles.infoContainer}>
        <span style={styles.info}>{`${percentage}% of people thought this content was helpful.`}</span>
      </div>
      <div>
        <Icon style={styles.icon} name='like' size='xxlarge' color='#b5b1a8'/>
        <span style={styles.value}>{upvotes}</span>
        <Icon style={[styles.unlikeIcon, styles.icon]} name='unlike' size='xxlarge' color='#b5b1a8'/>
        <span style={styles.value}>{downvotes}</span>
      </div>
    </div>
  );
};

Ratings.propTypes = {
  upvotes: React.PropTypes.number,
  downvotes: React.PropTypes.number,
  total: React.PropTypes.number,
  percentage: React.PropTypes.number
};

const styles = {
  info: {
    fontWeight: 'bold'
  },
  infoContainer: {
    float: 'left',
    lineHeight: '50px'
  },
  value: {
    color: '#b5b1a8',
    fontWeight: 'bold'
  },
  icon: {
    marginLeft: 10,
    marginRight: 10,
    '@media screen and (max-width: 767px)':{
      fontSize: 16
    }
  },
  unlikeIcon: {
    position: 'relative',
    top: 10,
    '@media screen and (max-width: 767px)':{
      top: 5
    }
  },
  container: {
    marginTop: '10px'
  }
};

export default Radium(Ratings);
