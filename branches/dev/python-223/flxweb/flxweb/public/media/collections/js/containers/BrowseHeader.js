import React from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import BrowseBreadcrumbs from '../components/BrowseBreadcrumbs';
import {getCollectionTitle, getCollectionSubject, getSubjectLinks} from '../selectors/selectors';
import Helmet from "react-helmet";

const BrowseHeader = (props) => {
  return (
    <div className="browseheader row collapse relative desktop_view">
      {(props.collectionTitle != undefined) &&
        <Helmet title={props.collectionTitle + " | CK-12 Foundation"} />
      }
      <BrowseBreadcrumbs {...props}  />
      <div className="browsebuttonswrap browse-buttons">
        {(props.conceptMapUrl != null) &&
          <div className="button-wrap">
            <a href={props.conceptMapUrl} className="map button small turquoise" ><span className="icon-map"></span><span className="hide-for-medium-down" style={{'marginRight': '5px'}}>Concept Map</span></a>
          </div>
        }
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  var subject = getCollectionSubject(state);
  return {
    collectionTitle: getCollectionTitle(state),
    collectionSubject: subject.name,
    collectionSubjectUrl: subject.url,
    conceptMapUrl:getSubjectLinks(state, 'conceptMapURL')
  };
};

export default connect(
  mapStateToProps
)(BrowseHeader);
