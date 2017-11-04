import React, {Component} from 'react';
import Link from './common/Link';
import {connect} from 'react-redux';
import {setFeedbackHelpfulness} from '../actions/feedback';
import {getCurrentArtifactID, getLoggedInUserInfo} from '../selectors/selectors';
import { showSigninDialog } from '../utils/requireBridge';
import Radium from 'radium';

@Radium
class ReviewHelpful extends Component{
  render(){
    let {positive = 0, negative = 0, helpful} = this.props;
    if(helpful){
      let {aggregateHelpfuls: {totalPositiveHelpfuls, totalNegativeHelpfuls}} = helpful;
      positive = totalPositiveHelpfuls;
      negative = totalNegativeHelpfuls;
    }
    return (
      <span className='reviewhelpful' style={styles.container}>
        <span style={styles.text}> Was this helpful? </span>
        <span onClick={()=>this.markHelfpul()}>
          <Link style={styles.link}> {`Yes ( ${positive} )`} </Link>
        </span>
        <span style={{paddingLeft:'5px'}} onClick={()=>this.markNotHelpful()}>
          <Link style={styles.link}> {`No ( ${negative} )`} </Link>
        </span>
      </span>
    );
  }

  markHelfpul(){
    this.showSigninDialogIfNotLoggedIn();
    this.props.loggedIn && this.changeHelpful(true);
  }

  markNotHelpful(){
    this.showSigninDialogIfNotLoggedIn();
    this.props.loggedIn && this.changeHelpful(false);
  }

  changeHelpful(value){
    let {reviewerID, artifactID, userID} = this.props;
    let isNewlySet = this.isValueNewlySet(value, userID),
      isUpdated;
    if(!isNewlySet)
      isUpdated = this.isValueUpdated(value, userID);
    (isNewlySet || isUpdated) && this.props.setFeedbackHelpfulness({userID, artifactID, memberID: reviewerID, isHelpful: value, isNewlySet, isUpdated});
  }

  isValueNewlySet(value, userID){
    let modified = this.getUserModification(userID);
    if(modified == undefined)
      return true;
    return false;
  }

  isValueUpdated(value, userID){
    let modified = this.getUserModification(userID);
    if(modified == value)
      return false;
    return true;
  }

  getUserModification(userID){
    let {modifiedHelpful = new Map()} = this.props;
    return modifiedHelpful.userID;
  }

  showSigninDialogIfNotLoggedIn(){
    if(!this.props.loggedIn)
      showSigninDialog();
  }
}

const mapStateToProps = (state) => {
  let artifactID = getCurrentArtifactID(state),
    {id: userID, loggedIn} = getLoggedInUserInfo(state);
  return {
    artifactID,
    userID,
    loggedIn
  };
};

const styles = {
  container: {
    marginLeft: 8,
    '@media screen and (max-width:425px)':{
      position: 'absolute',
      display: 'block',
      margin: '-5px 0px'
    }
  },
  link: {
    fontWeight: 'bold',
    fontSize: 12
  },
  text: {
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8
  }
};

// ReviewHelpful.propTypes = {
//   positive: React.PropTypes.number.isRequired,
//   negative: React.PropTypes.number.isRequired
// };

export default connect(
  mapStateToProps,
  {
    setFeedbackHelpfulness
  }
)(ReviewHelpful);
