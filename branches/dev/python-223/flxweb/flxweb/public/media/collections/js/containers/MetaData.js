import React from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import {getCollectionTitle, getCollectionDescription} from '../selectors/selectors';
import MetaTags from 'react-meta-tags';
 
const MetaData = (props) => {
    return (
          <MetaTags>
            <meta name="title" content={props.collectionTitle} />
            <meta property="og:title" content={props.collectionTitle} />
            <meta name="description" content={props.collectionDescription} />
          </MetaTags>
      )
}


const mapStateToProps = (state) => {
  return {
    collectionTitle: getCollectionTitle(state),
    collectionDescription: getCollectionDescription(state),
  };
};

export default connect(
  mapStateToProps
)(MetaData);