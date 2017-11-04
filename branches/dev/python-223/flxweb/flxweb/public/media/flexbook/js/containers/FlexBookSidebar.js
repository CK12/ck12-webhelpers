import React from 'react';
import {connect} from 'react-redux';
import {
  getCurrentSectionArtifact,
  getCoverImage,
  isNewSideNavigationBar,
  //isUserLoggedIn
 } from '../selectors/selectors.js';
import BookCover from '../components/BookCover.js';
import SideNav from '../components/SideNav';
import {isBookRelatedArtifact, formatHandle} from '../utils/utils';

const FlexBookSidebar = (props) => {

  let cover = (<BookCover {...props}/>);
  let {artifactType, isNewSideNav} = props;
  if (!isBookRelatedArtifact(artifactType)){
    cover = ( <img style={{height:'auto'}} src={props.coverImage} /> );
  }
  return (
    <div className='flexbooksidebar'>
      {!isNewSideNav? <div style={{paddingTop: 30}}>{cover}</div> : <div style={{paddingTop:'100px'}}/>}
      <SideNav/>
    </div>
  );
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  let coverImage = getCoverImage(artifact);
  let {title} = artifact;
  let artifactType = ((artifact.type || {}).name || artifact.type);
  let isNewSideNav = isNewSideNavigationBar(state);
  //let loggedIn = isUserLoggedIn(state);
  // if (artifactType === 'chapter'){
  //   let bookArtifact = getFlexBookArtifact(state);
  //   console.log(bookArtifact);
  //   ({coverImage} = bookArtifact);
  // }

  return {
    coverImage,
    title:formatHandle(title),
    artifactType,
    isNewSideNav
  };
};

FlexBookSidebar.propTypes = {
  coverImage: React.PropTypes.string,
  title: React.PropTypes.string,
  artifactType: React.PropTypes.string
};

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlexBookSidebar);
