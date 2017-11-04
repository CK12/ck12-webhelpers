import * as ActionTypes from '../actions/actionTypes';
import {combineReducers} from 'redux';
import isEmpty from 'lodash/isEmpty';

export const loaded = (state = false, action) => {
  if (action.type === ActionTypes.FEEDBACK_FETCH_SUCCESS) {
    return true;
  }
  return state;
};

export const score = (state = {}, action) => {
  switch(action.type){
  case ActionTypes.FEEDBACK_FETCH_SUCCESS:{
    let {feedback: feedbacks} = action.payload;
    return calculateScore(feedbacks);
  }
  case ActionTypes.ADD_FEEDBACK:{
    let {feedback} = action.payload;
    return calculateNewScore(state, feedback);
  }
  case ActionTypes.DELETE_FEEDBACK:{
    let {memberID} = action.payload;
    return calculateNewScoreAfterDeletion(state, memberID);
  }
  default:
    return state;
  }
};

export const reviews = (state = {}, action) => {
  if (action.type === ActionTypes.FEEDBACK_FETCH_SUCCESS) {
    return generateReviewInfo(action.payload);
  }
  if(action.type=== ActionTypes.ADD_FEEDBACK){
    let {feedback} = action.payload;
    if(feedback.comment)
      return generateNewReviewInfo(state, feedback);
  }
  if(action.type === ActionTypes.DELETE_FEEDBACK){
    let {memberID} = action.payload;
    return removeReview(state, memberID);

  }
  if(action.type == ActionTypes.SET_FEEDBACK_HELPFULNESS_SUCCESS){
    return modifyReview(state, action.payload);

  }
  if(action.type == ActionTypes.REPORT_FEEDBACK_ABUSE_SUCCESS){
    let {payload: {data}} = action;
    return modifyReviewAbuse(state, data);
  }
  return state;
};

export const replies = (state = {}, action) => {
  if (action.type === ActionTypes.FEEDBACK_FETCH_SUCCESS) {
    return generateReplies(action.payload);
  }
  if(action.type === ActionTypes.ADD_FEEDBACK_REPLY)
  {
    let data = action.payload;
    if(data.id)
    {
      return updateReplyID(data);
      
    }
    else
    {
      return addReply(data);
    }
  }
  if(action.type == ActionTypes.REPORT_FEEDBACK_REVIEW_ABUSE)
  {
    let {data} = action.payload;
    return modifyFeedbackReviewAbuse(state, data);
  }
  if(action.type == ActionTypes.DELETE_FEEDBACK_REVIEW_SUCCESS){
    let {data} = action.payload;
    return removeFeedbackReview(state, data);
  } 
  return state;
};

export const helpful = (state = {}, action) => {
  if (action.type === ActionTypes.FEEDBACK_FETCH_SUCCESS) {
    return generateHelpfuls(action.payload);
  }
  if(action.type === ActionTypes.SET_FEEDBACK_HELPFULNESS_SUCCESS)
  {
    return modifyHelpful(state, action.payload); 
  }
  if(action.type === ActionTypes.DELETE_FEEDBACK)
  {
    let {memberID} = action.payload,
    {userHelpfulMap} = state;
    delete userHelpfulMap[memberID];
    return {userHelpfulMap};
  }
  return state;
};

const generateReviewInfo = (data) => {
  let {feedback} = data;
  let reviews = feedback.filter((f)=>f.comment);
  let userReviewMap = {}, reviewsList = [];
  for(let i = 0; i < reviews.length; i++){
    let {creator: {id, name, surName}, comment, score, createdTime, abuseReports} = reviews[i];
    let abuseReporters = abuseReports.map(({reporter})=>reporter.id);
    let reviewObj = {comment, name: `${name} ${surName}`, score, createdTime, abuseReporters};
    userReviewMap[id] = reviewObj;
  }
  reviewsList = generateReviewListFromMap(userReviewMap);
  return {
    userReviewMap,
    reviewsList
  };
};



const generateNewReviewInfo = (state = {}, review)=>{
  let {userReviewMap} = state;
  let {memberID, name, comment, score, timestamp} = review;
  let reviewObj = {comment, name, score, createdTime: timestamp};
  userReviewMap[memberID] = reviewObj;
  let reviewsList = generateReviewListFromMap(userReviewMap);
  return {
    userReviewMap,
    reviewsList
  };
};

const removeReview = (state = {}, memberID) => {
  let {userReviewMap} = state;
  delete userReviewMap[memberID];
  let reviewsList = generateReviewListFromMap(userReviewMap);
  return {
    userReviewMap,
    reviewsList
  };
};

const generateReplies = (data) => {
  let {feedback} = data;
  let userRepliesMap = {};
  for(let i = 0; i < feedback.length; i++){
    let review = feedback[i];
    let {creator:{id}, reviews: replies} = review;
    if(!isEmpty(replies)){
      for(let j=0;j<replies.length;j++)
      {
        replies[j].abuseReporters = replies[j].abuseReports.map(({reporter})=>reporter.id);
      }
      userRepliesMap[id] = replies;
    }
  }
  return {
    userRepliesMap
  };
};

const generateHelpfuls = (data) => {
  let {feedback} = data;
  let userHelpfulMap = {};
  for(let i = 0; i < feedback.length; i++){
    let review = feedback[i];
    let {creator:{id}, aggregateHelpfuls, helpfuls} = review;
    if(!isEmpty(helpfuls)){
      userHelpfulMap[id] = {
        aggregateHelpfuls,
        helpfuls
      };
    }
  }
  return {
    userHelpfulMap
  };
};

const generateReviewListFromMap = (map) => {
  let reviewsList = [],
    keys = Object.keys(map);
  keys.forEach((key)=>{
    let obj = map[key];
    obj['id'] = key;
    reviewsList.push(obj);
  });
  return reviewsList.sort((one, two) => one.createdTime < two.createdTime);
};

const modifyReview = (state, data) => {
  let {reviewsList, ...rest} = state;
  let oldReviewIndex = reviewsList.findIndex((review)=> data.memberID == review.id);
  let oldReview = reviewsList[oldReviewIndex];
  let newReview = Object.assign({}, oldReview);
  let {isHelpful, isUpdated, userID: id} = data;
  newReview.modifiedHelpful = {id, isHelpful};
  if(!newReview.positiveHelpfuls)
  {
    newReview.positiveHelpfuls = 0;
  } 

  isHelpful?newReview.positiveHelpfuls++:newReview.negativeHelpfuls++;
  if(isUpdated)
  {
    isHelpful?newReview.negativeHelpfuls--:newReview.positiveHelpfuls--;
  }
  let newReviewsList = [...reviewsList.slice(0, oldReviewIndex), newReview, ...reviewsList.slice(oldReviewIndex+1)];

  return {
    ...rest,
    reviewsList: newReviewsList
  };
};

const modifyReviewAbuse = (state, data) => {
  let {reviewsList, ...rest} = state;
  let index = reviewsList.findIndex((review)=>review.id == data.reviewerID);
  let oldReview = reviewsList[index];
  let newReview = Object.assign({}, oldReview);
  let {abuseReporters} = newReview;
  (!abuseReporters) && (abuseReporters = []);
  let {userID} = data;
  if(abuseReporters.indexOf(userID) == -1){
    abuseReporters.push(userID);
    newReview.abuseReporters = [...abuseReporters];
  }
  return {
    ...rest,
    reviewsList: [...reviewsList.slice(0, index),newReview, ...reviewsList.slice(index+1)]
  };
};

const modifyFeedbackReviewAbuse = (state, data) => {
  let {userRepliesMap, ...rest} = state,
  {commenterID, memberID} = data;

  let replies = userRepliesMap[commenterID]
  let index = replies.findIndex((reply)=>reply.id == data.id);
  let oldReply = replies[index];
  let newReply = Object.assign({}, oldReply);
  let {abuseReporters} = newReply;
  (!abuseReporters) && (abuseReporters = []);
  if(abuseReporters.indexOf(memberID) == -1){
    abuseReporters.push(memberID);
    newReply.abuseReporters = [...abuseReporters];
  }
  userRepliesMap[commenterID][index] = newReply;
  return {
    ...rest,
    userRepliesMap
  };
};


const calculateScore = (feedbacks) => {
  let percentage, total;
  let userScoreMap = createUserScoreMap(feedbacks);
  let {upvotes, downvotes} = getUpvotesandDownvotes(userScoreMap);
  total = upvotes + downvotes;
  percentage = calculatePercentage({total, upvotes});
  return{
    upvotes,
    downvotes,
    total,
    percentage,
    userScoreMap
  };
};

const calculateNewScore = (state, feedback) => {
  let {userScoreMap, upvotes, downvotes} = state;
  let {memberID, score} = feedback,
    total, percentage;
  let oldScore = userScoreMap[memberID];
  if(oldScore == undefined)
    score == 1? upvotes++:downvotes++;
  else{
    if(oldScore == score)
      return state;
    score == 1?(upvotes++, downvotes--): (downvotes++, upvotes--);
  }
  userScoreMap[memberID] = score;
  total = upvotes + downvotes;
  percentage = calculatePercentage({total, upvotes});
  return {
    upvotes,
    downvotes,
    total,
    percentage,
    userScoreMap
  };
};

const calculateNewScoreAfterDeletion = (state,  memberID) => {
  let {userScoreMap, upvotes, downvotes, total} = state;
  let score = userScoreMap[memberID],
    newTotal, percentage;
  if(!score)
    return state;
  score == 1? upvotes--:downvotes--;
  newTotal = total--;
  percentage = calculatePercentage({total: newTotal, upvotes});
  delete userScoreMap[memberID];
  return {
    total: newTotal,
    upvotes,
    downvotes,
    userScoreMap,
    percentage
  };
};

const calculatePercentage = ({total, upvotes}) => {
  return total? Math.round(100 * upvotes/total): 0;
};
const getUpvotesandDownvotes = (scoreMap) => {
  let upvotes = 0, downvotes = 0;
  Object.values(scoreMap).forEach((score)=>{
    score == 1? upvotes++: downvotes++;
  });
  return {
    upvotes,
    downvotes
  };
};

const createUserScoreMap = (reviews) => {
  let map = {};
  reviews.forEach((review)=>{
    let {creator: {id: userID}, score} = review;
    map[userID]  = score;
  });
  return map;
};

const addReply = (data) => {
  let {userRepliesMap,  memberID, reviewComment, reviewersMemberID,name, surName} = data;
  if(isEmpty(userRepliesMap[memberID]))
    userRepliesMap[memberID] = [];
  userRepliesMap[memberID].push({
    createdTime: new Date(),
    reviewComment,
    reviewer: {
      id: reviewersMemberID,
      name,
      surName
    }
  });
  return {userRepliesMap};
};

const updateReplyID = (data) => {
  let {id, userRepliesMap,  memberID, reviewComment, reviewersMemberID,name, surName} = data,
  replies = userRepliesMap[memberID];
  replies[replies.length-1].id = id;
  userRepliesMap[memberID] = replies;
  return {userRepliesMap}
}

const removeFeedbackReview = (state, data) => {
  
  let {userRepliesMap, ...rest} = state,
  {commenterID, id:reviewID} = data;
  if(!isEmpty(userRepliesMap[commenterID]))
  {
    let replies = userRepliesMap[commenterID];
    let index = replies.findIndex((reply)=>reply.id === reviewID);
    let newReplies = [...replies.slice(0,index), ...replies.slice(index+1)];
    userRepliesMap[commenterID] = newReplies;
  }
  return {
    ...rest,
    userRepliesMap
  };  
};

const modifyHelpful = (state ={}, data) => {
  let {memberID, userID, isHelpful} = data;
  let memberFeedback = state.userHelpfulMap && state.userHelpfulMap[memberID];
  let newAggregateHelpfuls, newHelpfuls;
  if(!memberFeedback)
  {
    let newHelpful = {isHelpful,reviewer:{id:userID}},
    totalPositiveHelpfuls=0,totalNegativeHelpfuls=0;
    newHelpfuls = [newHelpful];

    isHelpful? ++totalPositiveHelpfuls : ++totalNegativeHelpfuls;
    newAggregateHelpfuls = {totalHelpfuls:1, totalPositiveHelpfuls, totalNegativeHelpfuls};
  }
  else
  {
    let {helpfuls, aggregateHelpfuls} = memberFeedback;
    let helpfulIndex = helpfuls.findIndex((helpful)=> userID == helpful.reviewer.id);
    let {totalHelpfuls, totalNegativeHelpfuls, totalPositiveHelpfuls} = aggregateHelpfuls;
    
    if(helpfulIndex==-1)
    {
      let newHelpful = {isHelpful,reviewer:{id:userID}};  
      helpfuls.push(newHelpful);
      isHelpful? ++totalPositiveHelpfuls: ++totalNegativeHelpfuls;
      ++totalHelpfuls;
    }
    else if(helpfuls[helpfulIndex].isHelpful!= isHelpful)
    {
      if(isHelpful){
        ++totalPositiveHelpfuls;
        --totalNegativeHelpfuls
      }
      else{
        ++totalNegativeHelpfuls;
        --totalPositiveHelpfuls;
      }
      helpfuls[helpfulIndex].isHelpful= isHelpful;
    }
    newHelpfuls = helpfuls;
    newAggregateHelpfuls = {totalHelpfuls, totalPositiveHelpfuls, totalNegativeHelpfuls};
  }
  state.userHelpfulMap[memberID] = {helpfuls: newHelpfuls, aggregateHelpfuls: newAggregateHelpfuls};
  return state;
}

//
// const removeFeedback = (state, data) => {
//   let {reviews, ...rest} = state;
//   let index = reviews.findIndex((review)=>review.reviewID === data.reviewID);
//   let newReviews = [...reviews.slice(0, index), ...reviews.slice(index+1)];
//   return {
//     ...rest,
//     reviews: newReviews
//   };
// };

// const calculateNewRatings = ({upvotes, downvotes, score}) => {
//   let newUpvotes = upvotes, newDownvotes = downvotes, newPercentage;
//   if(score == 1)
//     newUpvotes = upvotes + 1;
//   else if(score == -1)
//     newDownvotes = downvotes - 1;
//   newPercentage = Math.round(newUpvotes*100/(newUpvotes+newDownvotes));
//   return {
//     newUpvotes,
//     newDownvotes,
//     newPercentage
//   };
// };


export const feedback = combineReducers({
  reviews,
  replies,
  loaded,
  score,
  helpful
});
