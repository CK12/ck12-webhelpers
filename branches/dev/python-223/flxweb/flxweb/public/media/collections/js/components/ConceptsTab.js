import React from 'react'; // eslint-disable-line no-unused-vars
import NestedExplorerContainer from '../containers/NestedExplorerContainer';
import AnnouncementBadges from './AnnouncementBadges'

const ConceptsTab = () => {
  return (
    <div id="view_browse" className="view_browse toggle-css" style={{paddingTop:"15px"}}>
      <AnnouncementBadges />
      <NestedExplorerContainer />
    </div>
  );
};

export default ConceptsTab;
