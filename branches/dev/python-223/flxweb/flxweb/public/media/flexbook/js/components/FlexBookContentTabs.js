import React, {Component} from 'react';
import {Tabs, TabLink, TabContent} from 'react-tabs-redux';
import FlexBookContent from '../containers/FlexBookContent';
import Metadata from '../containers/Metadata';
import Attachment from '../containers/Attachment';
import Radium from 'radium';
import {connect} from 'react-redux';
import {getPracticeToggle } from '../selectors/selectors';

@Radium
class FlexBookContentTabs extends Component{
  render(){
    let {toggle} = this.props;
    let tabLinks = [
      <TabLink key="tl_content" to="tab_content" style={styles.tabLink}>Read</TabLink>,
      <TabLink key="tl_resources" to="tab_resources" style={styles.tabLink}>Resources</TabLink>,
      <TabLink key="tl_details" to="tab_details" style={styles.tabLink}>Details</TabLink>
    ];

    let tabContents = [
      <TabContent  id="view_content" className="contentview js_viewtab ui-tabs-panel ui-widget-content ui-corner-bottom" key="tc_content" for="tab_content" >
        <FlexBookContent />
      </TabContent>,
      <TabContent id="resources_content" className= "collapse-details js-collapse-details" key="tc_resources" for="tab_resources" >
        <Attachment/>
      </TabContent>,
      <TabContent id="view_details" className= "metadataview js_viewtab ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs ui-tabs-hide" key="tc_details" for="tab_details" >
        <Metadata/> 
      </TabContent>
    ];

    return (
    <div id="details_tabs" style={toggle?styles.contentSmall:{}} className="flexbookcontenttabs js_detailstabs details-tabs ui-tabs ui-widget ui-widget-content ui-corner-all">
      <Tabs>
      <ul style={styles.margin} className="tabs-list hide-for-small ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
        {tabLinks}
       </ul>
        <div className="contentarea" style={styles.positionInherit}>
          {tabContents}
        </div>
      </Tabs>
    </div>
    );

  }
}


const styles = {
  contentSmall: {
    width: '80%'
  },
  tabLink: {
    textAlign: 'center',
    width: '156px'
  },
  margin:{
    margin: '1px -1px'
  },
  positionInherit:{
    position: 'inherit',
    padding: '60px 10%',
    '@media screen and (max-width: 767px)':{
      boxShadow: 'none',
      padding: '0px'
    }
  }
};

const mapStateToProps = (state) => {
  let toggle = getPracticeToggle(state);
  return { 
    toggle
  }
};


export default connect(
  mapStateToProps
)(FlexBookContentTabs);