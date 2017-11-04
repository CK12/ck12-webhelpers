import React from 'react';
import {connect} from 'react-redux';
import LazyLoad from 'react-lazyload';
import {setLocation} from '../actions/location';
import {fetchBookWOCache} from '../actions/flexbook';
import {fetchColloborationDetails} from '../actions/actions';
import {fetchUser} from '../actions/user';
import {fetchGroups} from '../actions/groups';
import {fetchStandards} from '../actions/actions';
import {
  isBookLoaded,
  getErrorInfo,
  getArtifactID,
  getTOC,
  getRevisions,
  getLocationInfo,
  isNewSideNavigationBar,
  isPracticeLoading,
  getLoggedInUserInfo,
  isArtifactPublished,
  getFlexBookArtifact,
  getGroupEditingDetails,
  getArtifactStandards
} from '../selectors/selectors.js';
import {tocContainsOnlyChapters, isSectionPosition, requireSignin} from '../utils/utils.js';
import FlexBookTopTitle from '../containers/FlexBookTopTitle';
import FlexBookSidebar from '../containers/FlexBookSidebar';
import FlexBookSEOMeta from '../containers/FlexBookSEOMeta';
import Breadcrumbs from '../containers/Breadcrumbs';
import Feedback from '../containers/Feedback';
import FlexBookContentTabs from './FlexBookContentTabs';
import FlexBookBottomTitle from '../components/FlexBookBottomTitle';
import RecommendedModalities from '../components/RecommendedModalities';
import ShareOPlane from '../components/ShareOPlane';
import BackToTop from '../components/BackToTop';
import NotFound from '../components/NotFound';
import Details from '../components/Details';
import isEmpty from 'lodash/isEmpty';
import Spinner from './common/Spinner';
import {StyleRoot} from 'radium';

const Loading = () => {
  return (<Spinner/>);
};

class FlexBookDetails extends React.Component{
  componentWillMount(){
    let location = this.props.location || window.location.pathname;
    this.props.setLocation(location);
  }
  componentWillReceiveProps() {
    if(!this.props.isFetching)
      this.setState({ isFetching : true });
  }
  componentDidMount(){
    this.props.fetchUser(); //We call User and Group API after render and only once. Also irrespective of book loading data.
  }

  componentDidUpdate(){
    let location = window.location.pathname;
    let {locationInfo} = this.props;
    if(locationInfo && locationInfo.location!=location)
    {
      this.props.setLocation(location);
    }
  }

  componentWillUpdate(newProps){
    let {flexbookArtifactID, artifactID: newArtifactID, standards} = newProps;
    let {groupEditingDetails:{loading:{fetchingColloboration},isColloborater}} = this.props;
    let {user:{id}} = this.props;
    if (!isEmpty(newProps.locationInfo) && !newProps.loaded ){
      if(!this.state){
        newProps.fetchBookWOCache(newProps.locationInfo);
      }
    }

    if(flexbookArtifactID && !fetchingColloboration && typeof(isColloborater) == 'object'){
        this.props.fetchColloborationDetails(flexbookArtifactID,id);
    }
    if(this.props.artifactID != newArtifactID && !standards)
    {
      this.props.fetchStandards(newArtifactID);
    }
  }

  render(){
    let {
      errorInfo, 
      loaded, 
      isNewSideNav, 
      practiceLoading, 
      published, 
      user:{loggedIn},
      bookIsPublished
    } = this.props;
    if(errorInfo)
      return (
        <div>
          <FlexBookSEOMeta />
          <NotFound/>
        </div>
      );
    if (loaded){
      if (loggedIn || bookIsPublished || published){
        return (
          <StyleRoot>
          <div className={'row flexbookdetails'}>
            <FlexBookSEOMeta />
            <Breadcrumbs/>
            <div style={isNewSideNav?{position:'relative',right:'170px'}:{}}>
              <div className={'columns large-2 hide-for-small'}>
                {!practiceLoading && <FlexBookSidebar/>}
              </div>
              <div style={{marginTop: '30px'}} className={'columns large-10 small-12'}>
                  <FlexBookTopTitle/>
                  <FlexBookContentTabs />
                  <Details/>
                  <FlexBookBottomTitle />
                  <RecommendedModalities />
                  <LazyLoad offset={100}>
                    <Feedback />
                  </LazyLoad>
                  <BackToTop/>
              </div>
            </div>
            <ShareOPlane/>
          </div>
          </StyleRoot>
        );
      } else {
        requireSignin();
      }
    }
    return (<Loading />);
  }
}

const mapStateToProps = (state) => {
  let loaded = isBookLoaded(state),
    errorInfo = getErrorInfo(state),
    toc = getTOC(state),
    user = getLoggedInUserInfo(state),
    revisions = getRevisions(state),
    artifactID = getArtifactID(state),
    locationInfo = getLocationInfo(state),
    isNewSideNav = isNewSideNavigationBar(state),
    practiceLoading = isPracticeLoading(state),
    published = isArtifactPublished(state),
    book = getFlexBookArtifact(state),
    flexbookArtifactID = book && book.id,
    standards = getArtifactStandards(state),
    groupEditingDetails = getGroupEditingDetails(state);
  let {currentTOCSection, groups} = state;
  if(!isEmpty(toc)){
    if(tocContainsOnlyChapters(toc) && isSectionPosition(currentTOCSection))
    {
      loaded = false;
      errorInfo = '';
    }
    else if(!toc[currentTOCSection]){
      loaded = true;
      errorInfo = {
        error: true,
        type: 'Artifact not found'
      };
    }
  }
  let bookIsPublished = !!(book && book.revisions[0] && book.revisions[0].publishedTime);
  let newProps = {
    loaded,
    locationInfo,
    groups,
    errorInfo,
    artifactID,
    toc,
    revisions,
    isNewSideNav,
    practiceLoading,
    user,
    published,
    bookIsPublished,
    groupEditingDetails,
    flexbookArtifactID,
    standards
  };
  return newProps;
};

export default connect(
  mapStateToProps,
  {
    fetchUser,
    fetchGroups,
    fetchStandards,
    setLocation,
    fetchBookWOCache,
    fetchColloborationDetails
  }
)(FlexBookDetails);
