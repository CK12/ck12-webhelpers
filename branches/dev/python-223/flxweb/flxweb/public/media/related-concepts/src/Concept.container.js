import React, { Component } from 'react';
import './css/Concept.container.css';
import {
  fetchRetrolation,
  fetchFeaturedModalities
} from './services';



class ConceptContainer extends Component {
  render() {
    return (
      <div className="row">
          <div id="ab_concept_container" className="columns large-4 show-for-large-up">
              <ConceptContent artifactID={this.props.artifactID} Mode={this.props.Mode} RelatedConcepts={this.props.RelatedConcepts} />
          </div>
      </div>
    );
  }
}

class ConceptContent extends Component {
  constructor() {
    super();
    this.state = {RelatedConcept:[], recommendationID: ''}
  }

  componentDidMount() {
    fetchRetrolation(this.props.artifactID).then(result => {
       //Randomize the related concept
       var handle = result.concepts[Math.floor(Math.random()*result.concepts.length)].concept_handle;
       var RelatedConcept = {};
       var recommendationID = result.recommendationID;
       RelatedConcept.Title = result.concepts[0].concept_name;
       RelatedConcept.Modalities = [];
       fetchFeaturedModalities(handle).then(result => {
          for (var i = 0; i < result.Artifacts.length; i++) {
              var artifact = result.Artifacts[i];
              var modality = {};
              modality.Title = artifact.title;
              var type = artifact.type.name;
              modality.Type = type.charAt(0).toUpperCase() + type.substr(1).toLowerCase();
              if (modality.Type === 'Lesson') {
                modality.Type = 'Read';
              } else if (modality.Type === 'Lecture' || modality.Type === 'Enrichment') {
                modality.Type = 'Video';
              } else if (modality.Type === 'Plix') {
                modality.Type = 'PLIX';
              } else if (modality.Type === 'Rwa') {
                modality.Type = 'Real-World Application';
              }
              modality.Thumbnail = artifact.coverImageSatelliteUrl ? artifact.coverImageSatelliteUrl : artifact.coverImage;
              if (artifact.collections === undefined || artifact.collections.length === 0) {
                modality.Url = '/' + artifact.domain.branchInfo.handle + '/' + artifact.domain.handle + result.Artifacts[i].perma;
              } else {
                modality.Url = '/c/' + artifact.collections[0].collectionHandle + '/' + artifact.collections[0].conceptCollectionAbsoluteHandle;
                modality.Url += result.Artifacts[i].perma;
              }
              modality.id = artifact.artifactID;
              if (modality.Thumbnail)
                  RelatedConcept.Modalities.push(modality);
          }
          this.setState({'RelatedConcepts': [RelatedConcept], 'recommendationID': recommendationID});
       }).catch(error => {console.log(error);}).done();

    }).catch(error => {console.log(error);}).done();
  }

  render() {
    return this.renderRelatedConcepts(this.props.Mode);
  }
  renderRelatedConcepts(mode){
    var RelatedConcepts = this.state.RelatedConcepts;
    var concepts = [];
    if (RelatedConcepts) {
      for (var i = 0; i < RelatedConcepts.length; i++){
          concepts.push(ConceptWidget3(RelatedConcepts[i], this.state.recommendationID));
      }
    }

    //Don't render widget if we don't have modalities
    if (concepts.length > 0 && concepts[0].props.children.props.children.props.children.length > 0) {
      return(
        <div className="ab_related_content">
          <p className="ab_widget_title">Related Content</p>
          <div className="ab_concept_content">
            <ul className="ab_concept_list">
            {concepts}
            </ul>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}


function ConceptWidget(props) {
  return (
    <li key={props.Title}>
        <div className="row ab_concept_title">
          <a href={props.Url}>
          <div className="small-2 large-2 columns s">
            <i className="icon-lightbulb ck_teal"></i></div>
          <div className="small-10 large-10 columns ab_concept_title_text ck_teal">{props.Title}</div>
          </a>
        </div>
        <div className="divider"></div>
        <ul className="ab_modality_list">
          {props.Modalities.map((modality) => (
            <li key={modality.Title}>
              <div className="row ab_modality_item">
                <a href={modality.Url}>
                <div className="small-3 large-3 columns ab_modality_thumbnail">
                  <img src={modality.Thumbnail} alt={modality.Title} />
                </div>
                <div className="small-9 large-9 columns">
                  <div className="ck_teal">{modality.Title} </div>
                  <div className="ab_modality_type">
                    <i className={getIcon(modality)} > </i>
                    <span>{modality.Type}</span>
                  </div>
                </div>
              </a>
              </div>
              </li>
          ))}
        </ul>
    </li>
  );
}

function ConceptWidget2(props) {
  return (
    <li key={props.Title} >
        <div className="row ab_concept_title">
          <a href={props.Url}>
          <div className="small-2 large-2 columns ab_concept_title_icon">
            <i className="icon-lightbulb ck_teal"></i></div>
          <div className="small-10 large-10 columns ab_concept_title_text ck_teal">{props.Title}</div>
          </a>
        </div>
        <div className="divider"></div>
        <div>
        <ul className="ab_modality_list2">
          {props.Modalities.map((modality) => (
            <li key={modality.Title}>
              <div className="ab_modality_item2">
                <a href={modality.Url}>
                  <div className="ab_modality_thumbnail_container2">
                    <img className="ab_modality_thumbnail2" src={modality.Thumbnail} alt={modality.Title} />
                  </div>
                  <div>
                    <div className="ck_teal ab_modality_title2">{modality.Title} </div>
                    <div className="ab_modality_type">
                      <i className={getIcon(modality)} > </i>
                      <span>{modality.Type}</span>
                    </div>
                  </div>
                </a>
              </div>
              </li>
          ))}
        </ul>
        </div>
    </li>
  );
}

function ConceptWidget3(props, recommendationID) {
  var modalities = [];
  var modalityIDs = [];
  var selected_count = 0;
  var dexterPayload = '{"recommendationID": "'+ recommendationID +'", "referrer":"1xSection"}';
  for (var i = 0; i < props.Modalities.length; i++){
      if (selected_count < 2) {
        modalityIDs.push(props.Modalities[i].id);
        modalities.push(
          <li key={props.Modalities[i].Title}>
            <div className="ab_modality_item3">
              <a href={props.Modalities[i].Url} className="dxtrack-user-action" data-dx-desc="FBS_RECOMMENDATION_ACTION" data-dx-artifactID={props.Modalities[i].id} data-dx-payload={dexterPayload}>
                <div className="ab_modality_thumbnail_container3">
                  <img className="ab_modality_thumbnail3" src={props.Modalities[i].Thumbnail} alt={props.Modalities[i].Title} />
                </div>
                <div>
                  <div className="ck_teal ab_modality_title2">{props.Modalities[i].Title} </div>
                  <div className="ab_modality_type">
                    <i className={getIcon(props.Modalities[i])} > </i>
                    <span>{props.Modalities[i].Type}</span>
                  </div>
                </div>
              </a>
            </div>
            </li>
        );
        selected_count += 1;
      } else {
        //with 60% chance: replace a random selection
        if (Math.random() < 0.6){
          var replace_index = Math.floor(Math.random() * 2);
          modalityIDs[replace_index] = props.Modalities[i].id;
          modalities[replace_index] =
          (<li key={props.Modalities[i].Title}>
            <div className="ab_modality_item3">
              <a href={props.Modalities[i].Url}  className="dxtrack-user-action" data-dx-desc="FBS_RECOMMENDATION_ACTION" data-dx-artifactID={props.Modalities[i].id} data-dx-payload={dexterPayload}>
                <div className="ab_modality_thumbnail_container3">
                  <img className="ab_modality_thumbnail3" src={props.Modalities[i].Thumbnail} alt={props.Modalities[i].Title} />
                </div>
                <div>
                  <div className="ck_teal ab_modality_title2">{props.Modalities[i].Title} </div>
                  <div className="ab_modality_type">
                    <i className={getIcon(props.Modalities[i])} > </i>
                    <span>{props.Modalities[i].Type}</span>
                  </div>
                </div>
              </a>
            </div>
          </li>);
        }
      }
  }

  if (window._ck12) {
    window._ck12.logEvent('FBS_RECOMMENDATION', {
      'product': 'retrolated_content',
      'feature': 'creation',
      'recs': modalityIDs.join(','),
      'recommendationID': recommendationID
    });
  }

  return (
    <li key={props.Title} >
      <div>
        <ul className="ab_modality_list3">
          {modalities}
        </ul>
      </div>
    </li>
  );
}

function getIcon(modality) {
  var ModalityIcons = {
    'Read': 'icon-read',
    'Real-World': 'icon-rwa',
    'Real-World Application': 'icon-rwa',
    'RWA': 'icon-rwa',
    'PLIX': 'icon-interactive_practice',
    'Practice': 'icon-exercise',
    'Video': 'icon-video',
    'Simulation': 'icon-simulations'
  };

  return ModalityIcons[modality.Type];
}

export default ConceptContainer;
