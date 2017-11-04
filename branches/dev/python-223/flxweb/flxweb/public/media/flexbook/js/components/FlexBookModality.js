//TODO: should be a container
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchfeaturedModality} from '../actions/actions.js'; //fetchConfigModality commented out as of now
import {
  getCurrentSectionArtifact,
  getRecommendedModality
} from '../selectors/selectors.js';
import RelatedMod from './RelatedMod.js';

const flexfeaturemodal = () => {
  return (<div className='flexbookmodality'>...</div>);
};

class FlexBookModality extends Component{
  refresh(){
    let {artifact, fetchfeaturedModality} = this.props;
    if (artifact  && (artifact.artifactType == 'lesson' || artifact.artifactType == 'section')){
      if (!artifact.xhtml){ //TODO: make this not depend upon artifact.xhtml
        if (artifact.domain && artifact.domain.handle){
          fetchfeaturedModality( artifact.domain.handle );
        }
      }
    }
  }

  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(){
    this.refresh();
  }

  render(){
    let displayText = 'You may also like';
    let {recommendedModality, artifact} = this.props;
    if(recommendedModality !== undefined && (artifact.artifactType === 'lesson' || artifact.artifactType === 'section')){
      let modality = recommendedModality[artifact.domain.handle];
      let modalityChildren = [];
      if (modality){
        modalityChildren = modality['artifacts'].map(function (child) {
          return (
            <RelatedMod
              key={'md_' + child.id}
              {...child}  />
          );
        });
      }
      return (
        <div className='flexbookmodality' id= "cModality" style = {styles.modalityContainer}>
          <div style = {styles.relatedText}>
            <span> {displayText}</span>
          </div>
          <div style={styles.relatedModalityWrapper}>
            {modalityChildren}
          </div>
        </div>
      );
    }else{
      return(<flexfeaturemodal/>);
    }
  }
}

const styles = {
  modalityContainer:{
    marginTop: '40px !important',
    textShadow: 'none',
    boxSizing: 'border-box'
  },
  relatedText:{
    fontWeight: 'bold',
    fontSize: '24px'
  },
  relatedModalityWrapper:{
    left: '0px',
    marginTop: '20px',
    transition: 'left 1s'
  }
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  let recommendedModality = getRecommendedModality(state);
  return {
    artifact,
    recommendedModality
  };
};

export default connect(
  mapStateToProps,
  {
    fetchfeaturedModality
  }
)(FlexBookModality);
