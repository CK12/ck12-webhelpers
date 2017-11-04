import React from 'react';
import ReactDOM from 'react-dom';
import ConceptContainer from './Concept.container';
import './css/fontck12.css';
import './css/index.css';

//import './css/Concept.container.css';
/*
var RelatedConcepts = [{
    Title: "Evaluate Limits Graphically and Vertical Asymptotes",
    Url: "//www.ck12.org/calculus/Evaluate-Limits-Graphically-and-Vertical-Asymptotes/",
    Modalities: [
      {
        Title: "Graphs to Find Limits",
        Type: "Read",
        Thumbnail: "//www.ck12.org/media/images/modality_generic_icons/text_ic.png",
        Url: "//www.ck12.org/calculus/Evaluate-Limits-Graphically-and-Vertical-Asymptotes/lesson/Graphs-to-Find-Limits-PCALC/"
      }, {
        Title: "Evaluate the Limits",
        Type: "PLIX",
        Thumbnail: "//dr282zn36sxxg.cloudfront.net/datastreams/f-d%3A6844cc0a4961cf0604371e17521f8e60e701b8d098b738d780e4db94%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1",
        Url: "//www.ck12.org/assessment/tools/geometry-tool/plix.html?eId=MAT.CAL.224&questionId=56e84192da2cfe2518af4d65&artifactID=2481482"
      }, {
        Title: "Evaluate Limits Graphically and Vertical Asymptotes Practice",
        Type: "Practice",
        Thumbnail: "//www.ck12.org/media/images/modality_generic_icons/modality_practice_1024b.png",
        Url: "//www.ck12.org/assessment/ui/?test/view/practice/calculus/Evaluate-Limits-Graphically-and-Vertical-Asymptotes-Practice"
      }]
  },
];
*/
/*
The modality type above drives the modality icon that gets drawn on the widget.
The type to icon mapping is done by Concept.container:getIcon()

Available mappings now:
'Read': 'icon-read',
'Real-World': 'icon-rwa',
'Real-World Application': 'icon-rwa',
'RWA': 'icon-rwa',
'PLIX': 'icon-interactive_practice',
'Practice': 'icon-exercise',
'Video': 'icon-video',
'Lecture': 'icon-video',
'Enrichment': 'icon-video',
'Simulation': 'icon-simulations'
*/

let render = function(props){
    ReactDOM.render(
      <ConceptContainer Mode={props.Mode} artifactID={props.artifactID}/>,
      document.getElementById('related-concept-root')
    );
};

let init = function(artifactID, Mode=1){

  var config = {
    Mode: Mode,
    artifactID: artifactID
  };

  render(config);
};

window.ConceptRelate = init;

//Comment this out if you want to build for Optimizely.
//Initialize the app from Optimizely variation code editor after injecting
//a placeholder div to render this app (i.e. <div id="root"></div>)
//window.ConceptRelate(1667, 3);
//window.ConceptRelate(266207, 3);
//export default initConceptRelate;
module.exports = {
    init
};
