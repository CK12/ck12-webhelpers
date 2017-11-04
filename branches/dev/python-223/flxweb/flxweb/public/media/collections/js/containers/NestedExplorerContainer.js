import React from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import NestedExplorer from '../components/NestedExplorer';
import {getCollection} from '../selectors/selectors';

const NestedExplorerContainer = (props) => {
  if (Object.keys(props.collection).length === 0)
    return (<center><div>No collections found on this topic</div></center>);
  else
    return <NestedExplorer {...props} />;
};

const mapStateToProps = (state) => {
  return {
    collection: getCollection(state)
  };
};

export default connect(
  mapStateToProps
)(NestedExplorerContainer);
