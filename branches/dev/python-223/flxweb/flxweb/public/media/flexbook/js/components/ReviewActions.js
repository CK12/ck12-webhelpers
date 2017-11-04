import React, {Component, PropTypes} from 'react';
import ReactTooltip from 'react-tooltip';
import Icon from './common/Icon';
import { showSigninDialog } from '../utils/requireBridge';
import AbusePopup from './AbusePopup';
import ConfirmationModal from './ConfirmationModal';
import {connect} from 'react-redux';
import {getLoggedInUserInfo} from '../selectors/selectors';

class ReviewActions extends Component{
  constructor(){
    super();
    this.state = {
      showAbusePopup: false,
      showDeleteModal: false
    };
  }

  render(){
    let {canDelete, canAbuse, style} = this.props;
    let {showAbusePopup, showDeleteModal} = this.state;
    let DeleteIcon = (<span data-tip='Delete' id='tt-delete' onClick={()=>this.handleDelete()}>
    <Icon style={Object.assign({},styles.icon, styles.remove)} color='#999' name='remove' size='xsmall'/>
  </span>);
    let FlagIcon = (
      <span id='tt-abuse' onClick={()=>this.handleAbuse()}>
        <Icon dataTip='Report Abuse'  style={Object.assign({},styles.icon, styles.abuse)} color='#999' name='flag' size='xsmall'/>
        {showAbusePopup && <AbusePopup closePopup = {()=> this.closePopup()} reportComment={this.props.reportComment}/>}
      </span>);
    return(
  <div className='reviewactions' style={Object.assign({},styles.container,style)}>
    {canDelete ?<div style={styles.iconDiv}>{DeleteIcon}<ReactTooltip data-for='tt-delete'/></div>: null}
    {showDeleteModal && <ConfirmationModal
      title='Delete Comment'
      message='delete this comment'
      action={this.props.deleteComment}
      callback={()=>this.deleteCloseCallback()}/>}
    {canAbuse?<div style={styles.iconDiv}>{FlagIcon}<ReactTooltip data-for='tt-abuse'/></div>:null}
  </div>
    );
  }

  handleAbuse(){
    this.showSigninDialogIfNotLoggedIn();
    if(this.props.loggedIn){
      this.setState({
        showAbusePopup: true
      });
    }
  }

  closePopup(){
    this.setState({
      showAbusePopup: false
    });
  }

  handleDelete(){
    this.showSigninDialogIfNotLoggedIn();
    if(this.props.loggedIn){
      this.setState({
        showDeleteModal: true
      });
    }
  }

  deleteCloseCallback(){
    this.setState({
      showDeleteModal: false
    });
  }

  showSigninDialogIfNotLoggedIn(){
    if(!this.props.loggedIn)
      showSigninDialog();
  }
}

ConfirmationModal.PropTypes = {
  reportComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  let {loggedIn} = getLoggedInUserInfo(state);
  return {
    loggedIn
  };
};

const styles = {
  container:{
    float: 'right'
  },
  icon: {
    marginLeft: 5,
    marginRight: 5,
    cursor: 'pointer'
  },
  iconDiv: {
    display: 'inline-block'
  },
  abuse: {
    ':hover':{
      color: '#ff0000'
    }
  },
  remove: {
    ':hover':{
      color: '#1aaba3'
    }
  }
};

export default (connect(
  mapStateToProps,
  null
)(ReviewActions));
