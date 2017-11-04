import React from 'react';
import {isEmpty} from 'lodash';
import Reply from './Reply';

const Replies = ({replies, isLatest, reviewerID}) => {
  if(isEmpty(replies))
    return false;
  let replys = !isLatest?
    replies.map((r, index)=>{
      return <Reply key={`reply-${index}`}{...r} reviewerID={reviewerID}/>
    })  :
    (<Reply {...replies[replies.length-1]} reviewerID={reviewerID}/>) 
  return (
    <div className='replies' style={styles.container}>
      {replys}
    </div>
  );
};

const styles = {
  container: {
    marginLeft: 50
  }
};

export default Replies;
