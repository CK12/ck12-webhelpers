import React, { Component } from 'react';

class ReviewBox extends Component {
  
  shouldComponentUpdate( nextProps, nextState){
    return false;
  }
  render() {
    const {
      boxStyle,
      artifactID,
      question,
      showButtonText,
      positiveReviewText,
      negativeReviewText
    } = this.props;

    const loadStyle   = { ...Styles.boxStyle, ...boxStyle};

    return (            
      <div className="review-wrapper" style={loadStyle}>
        <div className="review-vote">        
            <span className="washelpful_js  show "><span>Did this answer your question?</span></span>          
            <a id="review_up" className="dxtrack-user-action artifactfeedbackaction artifactfeedbackaction_js" title="Helpful" data-dx-desc="ask_ck12_review" data-dx-artifactID={artifactID} data-dx-review="thumbs_up" data-dx-question={question}>
                <span className="icon-like artifactfeedbackaction" style={Styles.actionButton}></span>
                {positiveReviewText && (<span> {{positiveReviewText}} </span>)}
            </a>
            <a id="review_down" className="dxtrack-user-action artifactfeedbackaction artifactfeedbackaction_js" title="Not helpful"  data-dx-desc="ask_ck12_review"  data-dx-artifactID={artifactID} data-dx-review="thumbs_down" data-dx-question={question}>
                <span className="icon-unlike artifactfeedbackaction" style={{...Styles.actionButton, ...Styles.unlikeButton}}></span>
                {negativeReviewText && (<span> {{negativeReviewText}} </span>)}
            </a>
        </div>
      </div>
    );
  }
}
export default ReviewBox;

ReviewBox.defaultProps = {
  boxStyle : {},
  positiveReviewText: '',
  negativeReviewText: ''
}

const Styles = {
  boxStyle : {
    textAlign: 'center',
    fontSize: '1.1em',
    marginBottom: '20px'
  },
  actionButton: {
    color: '#000',
    fontSize: '1.2em',
    marginLeft: '12px'
  },
  unlikeButton: {
    top: '3px'
  }
}
