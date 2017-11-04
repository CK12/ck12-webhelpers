import React from 'react';
import {connect} from 'react-redux';
import {
  getCurrentSectionArtifact
} from '../selectors/selectors.js';
import { customizeArtifactLink } from '../utils/utils';
import { EDITATTACHMENT } from '../constants/placeholders';
import FlexBookLink from '../components/FlexBookLink';
import Radium from 'radium';

@Radium
class Attachment extends React.Component {
  render() {
    let attachmentContainer = [],
      {resources, type: {name}} = this.props;
    name = (name == 'book')? 'FlexBook® textbook' : name;
    if(resources){
      attachmentContainer = resources.filter((child) => (child.isAttachment))
      .sort((a,b) => a.handle < b.handle ? -1 : 1)
      .map((child)=> {
        let directURL = child.satelliteURL || child.uri;
        let title = child.title;
        let linkInfo = {directURL,title};
        return (
          <div key={'res_' + child.id}>
            <div style= {styles.resourceRow}>
              <div style={styles.rowInfo}>
                <div style={styles.resourceIcons}>
                  <span
                    type={child.type.name}
                    className="imagewrap"
                    style={[styles.icon, styles[`${child.type.name.split(' ').join('')}Icon`]]}>
                  </span>
                  <span style={styles.noImage}>
                  </span>
                </div>
              </div>
              <div>
                <FlexBookLink {...linkInfo}>
                  {title}
                </FlexBookLink>
              </div>
              <div style={styles.clearBoth}>
              </div>
              <div style={styles.dividerSpaceTop}>
              </div>
            </div>
          </div>
        );
      });
    }
    attachmentContainer = (attachmentContainer.length == 0) ?
    <div>
      Currently there are no resources to be displayed.
    </div>
    : attachmentContainer;
    let customize = customizeArtifactLink(this.props,EDITATTACHMENT);
    return (
      <section
        className='attachment'>
        <section>
          <div style= {styles.header}>
            <strong>
              Save or share your relevant files like activites, homework and worksheet.
            </strong>
            <br/>
            <span>To add resources, you must be the owner of the {name}. Click </span>
            <a href={customize}>Customize</a>
            <span> to make your own copy.</span>
          </div>
        </section>
        <section style = {styles.resourcesContainer}>
          {attachmentContainer}
        </section>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  return artifact;
};


const mapDispatchToProps = (dispatch) => ({
  dispatch
});

const styles = {
  header: {
    background: '#e4f5f7',
    border: '1px solid #51c3d6',
    margin: '20px 0 15px 0',
    padding: '7px 10px 10px 10px',
    position: 'relative'
  },
  resourcesContainer: {
    margin: '20px 0'
  },
  resourceRow: {
    lineHeight: '40px'
  },
  rowInfo:{
    float: 'left',
    width: '60px'
  },
  dividerSpaceTop:{
    borderTop: '1px solid #e0e0e0',
    borderBottom: '1px solid #fff'
  },
  clearBoth:{
    clear: 'both'
  },
  resourceIcons:{
    float: 'left',
    width: '60px'
  },
  icon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    backgroundRepeat: 'no-repeat',
    margin: 0
  },
  answerkeyIcon:{
    width: '12px',
    height: '20px',
    backgroundPosition: '-258px -459px',
  },
  readingIcon:{
    width: '19px',
    height: '14px',
    backgroundPosition: '-212px -419px'
  },
  cthinkIcon:{
    width: '13px',
    height: '16px',
    backgroundPosition: '-255px -417px'
  },
  quizIcon:{
    width: '19px',
    height: '17px',
    backgroundPosition: '-264px -437px'
  },
  videoIcon:{
    width: '15px',
    height: '15px',
    backgroundPosition: '-235px -418px'
  },
  webIcon:{
    width: '18px',
    height: '17px',
    backgroundPosition: '-237px -460px'
  },
  studyguideIcon:{
    width: '16px',
    height: '16px',
    backgroundPosition: '-270px -417px'
  },
  handoutIcon: {
    width: 21,
    height: 16,
    backgroundPosition: '-286px -416px'
  },
  lessonplanIcon: {
    width: 21,
    height: 16,
    backgroundPosition: '-286px -416px'
  },
  activityIcon: {
    width: 13,
    height: 16,
    backgroundPosition: '-255px -417px'
  },
  interactiveIcon: {
    width: 16,
    height: 13,
    backgroundPosition: '-292px -461px'
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Attachment);
