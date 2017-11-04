import * as ActionTypes from './actionTypes.js';
import * as ArtifactServices from '../services/artifact.js';

const fetchFeedbackSuccess = (feedback) => {
  return {
    type: ActionTypes.FEEDBACK_FETCH_SUCCESS,
    payload: {feedback}
  };
};

const fetchFeedbackError = (error) => {
  return {
    type: ActionTypes.FEEDBACK_FETCH_ERROR,
    payload: {error},
    error: true
  };
};

const addFeedback = (feedback) => {
  return {
    type: ActionTypes.ADD_FEEDBACK,
    payload: {feedback}
  };
};


export const postFeedbackError = (error) => {
  return {
    type: ActionTypes.POST_FEEDBACK_ERROR,
    payload: {error},
    error: true
  };
};

const removeFeedback = (data) => {
  return {
    type: ActionTypes.DELETE_FEEDBACK,
    payload: data
  };
};

const reportFeedbackAbuseSuccess = (data) => {
  return {
    type: ActionTypes.REPORT_FEEDBACK_ABUSE_SUCCESS,
    payload: {data}
  };
};

const deleteFeedbackReviewSuccess = (data) => {
  return {
    type: ActionTypes.DELETE_FEEDBACK_REVIEW_SUCCESS,
    payload: {data}
  };
};

const reportFeedbackReviewAbuseSuccess = (data) => {
  return{
    type: ActionTypes.REPORT_FEEDBACK_REVIEW_ABUSE,
    payload: {data}
  }
}

const addFeedbackReply = (data) => {
  return {
    type: ActionTypes.ADD_FEEDBACK_REPLY,
    payload: data
  };
};


const setFeedbackHelpfulnessSuccess = (data) => {
  return {
    type: ActionTypes.SET_FEEDBACK_HELPFULNESS_SUCCESS,
    payload: data
  };
};

const setFeedbackHelpfulnessError = (data) => {
  return{
    type: ActionTypes.SET_FEEDBACK_HELPFULNESS_ERROR,
    payload: data
  };
};

export const fetchFeedback = (bookInfo) => {
  return (dispatch) => {
    ArtifactServices.fetchFeedback(bookInfo)
    .then((response) => {
      dispatch(fetchFeedbackSuccess(response));
    }, (err) => {
      dispatch(fetchFeedbackError(err));
    });
  };
};

export const postFeedback = (data) => {
  return (dispatch) => {
    dispatch(addFeedback(data));
    let {id:artifactID, name: memberName, time, comment, ...rest} = data;
    ArtifactServices.postFeedback({artifactID, memberName, comments: comment, creationTime: new Date().toISOString(), ...rest})
    .then((response) => {

    }, (err) => {
      dispatch(postFeedbackError(err));
    });
  };
};


export const deleteFeedback = (data) => {
  return (dispatch) => {
    dispatch(removeFeedback(data));
    ArtifactServices.deleteFeedback(data)
    .then((response) => {

    }, (err) => {
    });
  };
};

export const reportFeedback = (data) => {
  return (dispatch) => {
    ArtifactServices.reportFeedbackAbuse(data)
    .then((response) => {
      dispatch(reportFeedbackAbuseSuccess(data));
    }, (err) => {
    });
  };
};


export const deleteFeedbackReview = (data) => {
  return (dispatch) => {
    ArtifactServices.deleteFeedbackReview(data)
    .then((response) => {
      dispatch(deleteFeedbackReviewSuccess(data));
    }, (err) => {
    });
  };
};

export const reportFeedbackReview = (data) => {
  return (dispatch) => {
    ArtifactServices.reportFeedbackReviewAbuse(data)
    .then((response) => {
      dispatch(reportFeedbackReviewAbuseSuccess(data));
    }, (err) => {
    });
  };
};

export const replyToFeedback = (data) => {
  return(dispatch) => {
    dispatch(addFeedbackReply(data));
    ArtifactServices.replyToFeedback(data).
    then((response)=>{
      let {feedbackReview:{id}} = response;
      data.id = id;
      dispatch(addFeedbackReply(data));
    })
  };
};


export const setFeedbackHelpfulness = (data) => {
  return(dispatch) => {
    dispatch(setFeedbackHelpfulnessSuccess(data));
    ArtifactServices.setFeedbackHelpfulness(data)
    .then((response)=>{
      //do nothing
    }, (err) => {
      dispatch(setFeedbackHelpfulnessError(data));
    });
  };
};
