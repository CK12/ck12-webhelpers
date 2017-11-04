import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import {fetchFeaturedModalities, updateFeaturedModalities} from '../actions/recommendedModalities';
import {
  getCurrentSectionArtifact,
  getArtifactRecommendedModalities,
  getSectionDomain,
  getCollectionInfo,
  isSectionArtifact
} from '../selectors/selectors.js';
import RelatedMod from './RelatedMod.js';
import {uniqueElement} from '../utils/utils';
import isEmpty from 'lodash/isEmpty';

const flexfeaturemodal = () => {
  return (
    <div>...</div>
  );
};

class RecommendedModalities extends React.Component{
  refresh(conceptName, collections){
    let data = {conceptName};
    if(!isEmpty(collections)) //To Do when domain or encoded ID is fixed
    {
      let {collectionCreatorID, conceptCollectionHandle} = collections;
      data = {...data, collectionCreatorID, conceptCollectionHandle};
    }
    this.props.fetchFeaturedModalities(data);
  }

  componentWillReceiveProps(nextProps) {
    let {domain, artifact:{revisionID}, recommendedModalities, isSection} = nextProps,
    {domain: oldDomain} = this.props; 
    let currentRevisionID = this.state && this.state.currentRevisionID;
    if (revisionID != currentRevisionID)
    {
      if((recommendedModalities && recommendedModalities.artifacts) || !isSection)
      {
        this.props.updateFeaturedModalities(recommendedModalities.artifacts);
        this.setState({
          currentRevisionID: revisionID
        });
      }
      else if(domain && isSection && recommendedModalities.length==0)
      {
        let {collections} = nextProps;
        this.refresh(domain, collections);
        this.setState({
          currentRevisionID: revisionID
        });
      }
    }
  }

  render(){
    let displayText = 'You may also like';
    let {recommendedModalities, artifact, domain} = this.props;
    if (artifact.type.name === 'lesson' || artifact.type.name === 'section'){
      if(recommendedModalities && recommendedModalities.artifacts){
        let modality = recommendedModalities;
        let modalityChildren = [];
        let selector = {name:'lecture'};
        let children = modality ? modality['artifacts'] : [];
        if (modality && Array.isArray(children)){
          modalityChildren = uniqueElement(children,selector);
          modalityChildren = modalityChildren.map((child) => {
            return (
              <RelatedMod
                key={'md_' + child.id}
                {...child}  />
            );
          });
        }
        return (
          <div
            className='recommendedmodalities'
            id= "cModality"
            style = {styles.modalityContainer}>
            <div style = {styles.relatedText}>
              <span>
                {displayText}
              </span>
            </div>
            <div style={styles.relatedModalityWrapper}>
              {modalityChildren}
            </div>
          </div>
        );
      }else{
        return(
          <flexfeaturemodal/>
        );
      }
    } else{
      return <div />;
    }
  }
}

const styles = {
  modalityContainer:{
    marginTop: '40px',
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
    transition: 'left 1s',
    overflow: 'auto'
  }
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state),
  collections = getCollectionInfo(state);
  let recommendedModalities = getArtifactRecommendedModalities(state);
  let domain = getSectionDomain(state),
  isSection = isSectionArtifact(state);
  return {
    artifact,
    recommendedModalities,
    domain,
    collections,
    isSection
  };
};


export default Radium(connect(
  mapStateToProps,
  {
    fetchFeaturedModalities,
    updateFeaturedModalities
  }
)(RecommendedModalities));
