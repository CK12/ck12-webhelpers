import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  isBookLoaded,
  getCurrentSectionArtifact,
  getCoverImage,
  isUserLoggedIn
} from '../selectors/selectors.js';
import {formatHandle} from '../utils/utils';
import {showShareOPlaneDialog} from '../utils/requireBridge';
import {ATBIMAGEICON} from '../constants/constants';
import {BOOK} from '../constants/artifactTypes';

class ShareOPlane extends Component{
  shouldComponentUpdate(nextProps){
    let {userSignedIn, coverImage} = nextProps;
    if(this.props.userSignedIn != userSignedIn || this.props.coverImage !=coverImage)
      return true;
    return false;
  }

  render(){
    let {userSignedIn, title, coverImage: shareImage,artifactType} = this.props;
    if(!shareImage)
    {
      shareImage = ATBIMAGEICON;
    }
    let context = (artifactType==BOOK)?'Share this Flexbook® Textbook':'Share this Resource';
    let formattedTitle = formatHandle(title);
    window.optionsSharePlane = (window.optionsSharePlane) ? optionsSharePlane : {};
    optionsSharePlane.shareData = {
      'shareImage': shareImage,
      'shareUrl': window.location.href,
      'shareTitle': formattedTitle,
      'context': context,
      'payload': { memberID : '2', page : 'browse' },
      '_ck12': true,
      userSignedIn
    };
    return <div/>;
  }
}

const mapStateToProps = (state) => {
  let loaded = isBookLoaded(state),
    artifact = null,
    coverImage = '',
    title = '',
    artifactType = '',
    userSignedIn = isUserLoggedIn(state).loggedIn;
  if(loaded)
  {
    artifact = getCurrentSectionArtifact(state);
    coverImage = getCoverImage(artifact);
    title = artifact.title;
    artifactType = artifact.type.name;
  }
  return {
    title,
    coverImage,
    userSignedIn,
    artifactType
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export  default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareOPlane);
