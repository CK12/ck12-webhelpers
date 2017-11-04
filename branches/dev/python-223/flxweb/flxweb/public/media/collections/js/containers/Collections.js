import React from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import BrowseHeader from './BrowseHeader';
import MetaData from './MetaData';
import BrowseTabs from '../components/BrowseTabs';
import {getCollectionInfo, getFlexbookInfo, getLMSContext} from '../actions/actions';
import {isCollectionAndFlexbookLoaded, errorCollectionAndFlexbook} from '../selectors/selectors';
import Loader from '../components/Loader';

function topFunction() {
    document.body.scrollTop = 0; // For Chrome, Safari and Opera
    document.documentElement.scrollTop = 0; // For IE and Firefox
}

const CollectionsContainer = (props) => {
  if (props.loaded){
    if (props.bothErrored)
      return (<div className="toptitleWrapper" style={{textAlign:"center"}}>
                <h3 className="toptitle">Oops! We can't find the page you're looking for.</h3>
                <h3 className="toptitle">But don't let us get in your way! Continue browsing below.</h3>
              </div>);
    else
      return (
        <div className="small-12 columns">
        <BrowseHeader />
        <MetaData />
        <div>
          <div className="row collapse" id="details_contentwrap">
            <div className="spacetoplarge" /></div>
            <BrowseTabs />
          </div>
          <div className="small-12 columns">
            <div className="backtotop clear">Back to the <a onClick={topFunction} title="Back to top of the page">top of the page ↑</a></div>
          </div>
        </div>
      );
  } else {
    props.getCollectionInfo();
    props.getFlexbookInfo();
    props.getLMSContext();
    //TODO: create a pure-react CK-12 loading animation component and use it here...
    return (<div className="loaderContainer"><Loader /></div>);
  }

};

const mapStateToProps = (state) => {
  return {
    loaded: isCollectionAndFlexbookLoaded(state),
    bothErrored: errorCollectionAndFlexbook(state)
  };
};

export default connect(
  mapStateToProps,
  {
    getFlexbookInfo,
    getCollectionInfo,
    getLMSContext
  }
)(CollectionsContainer);
