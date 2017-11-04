import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import FlexBookLink from '../components/FlexBookLink.js';
import {
  getNextSectionInfo,
  getPreviousSectionInfo,
  getPractice
} from '../selectors/selectors.js';
import {formatSectionName} from '../utils/utils';
import {setCurrentSection} from '../actions/location';

class FlexBookPrevNextTop extends React.Component {

  constructor(){
    super();
    this.goToPreviousSection = this.goToPreviousSection.bind(this);
    this.goToNextSection = this.goToNextSection.bind(this);
  }

  goToPreviousSection(){
    let {setCurrentSection, previousSectionPosition, practiceLoading} = this.props;
    !practiceLoading && setCurrentSection(previousSectionPosition);
  }

  goToNextSection(){
    let {setCurrentSection, nextSectionPosition, practiceLoading} = this.props;
    !practiceLoading && setCurrentSection(nextSectionPosition);
  }

  get prevStyles(){
    return Object.assign({}, styles.arrowContainer, styles.prevContainer, (this.props.previousSectionPosition==null && styles.inactiveStyles) || {});
  }

  get nextStyles(){
    return Object.assign({}, styles.arrowContainer, styles.nextContainer,(this.props.nextSectionPosition==null && styles.inactiveStyles) || {});
  }

  render(){
    let props = this.props;
    let prev = {
      ...props.flexbookLocationInfo,
      title: props.previousArtifact?`Previous: ${formatSectionName(props.previousArtifact.title)}`:'',
      section: props.previousSectionPosition
    };
    let next = {
      ...props.flexbookLocationInfo,
      title: props.nextArtifact?`Next: ${formatSectionName(props.nextArtifact.title)}`:'',
      section: props.nextSectionPosition
    };
    return (
      <nav
        id="navartifacttopsmall"
        className="row collapse hide-small flexbookprevnexttop">
        <span style={this.prevStyles}>
          <FlexBookLink
            {...prev}
            onClick={this.goToPreviousSection} >
            <span className={''}>
              <span
                style={styles.arrowIcon}
                className="icon icon-arrow3_left">
              </span>
            </span>
          </FlexBookLink>
        </span>
        <span style={this.nextStyles}>
          <FlexBookLink
            {...next}
            onClick={this.goToNextSection} >
            <span className={''}>
              <span
                style={styles.arrowIcon}
                className="icon icon-arrow3_right">
              </span>
            </span>
          </FlexBookLink>
        </span>
      </nav>
    );
  }

}

FlexBookPrevNextTop.propTypes = {
  previousSectionPosition: React.PropTypes.string,
  nextSectionPosition: React.PropTypes.string,
  previousArtifact: React.PropTypes.object,
  nextArtifact: React.PropTypes.object,
  flexbookLocationInfo: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  let flexbookLocationInfo = state.locationInfo;
  let {
    artifact:nextArtifact,
    position:nextSectionPosition
  } = (getNextSectionInfo(state) || {});
  let {
    artifact:previousArtifact,
    position:previousSectionPosition
  } = (getPreviousSectionInfo(state) || {});
  let {loading: practiceLoading} = getPractice(state);
  return {
    flexbookLocationInfo,
    nextArtifact,
    nextSectionPosition,
    previousArtifact,
    previousSectionPosition,
    practiceLoading
  };
};

const styles = {
  arrowIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    left: 6,
    position: 'relative',
    top: 4
  },
  arrowContainer: {
    backgroundColor: '#00aba4',
    borderRadius: 25,
    display: 'inline-block',
    height: 25,
    width: 25
  },
  inactiveStyles: {
    backgroundColor: '#ccc',
    cursor: 'default',
    pointerEvents: 'none'
  },
  prevContainer: {
    marginRight: 14
  }
};

export default connect(
  mapStateToProps,
  {
    setCurrentSection
  }
)(Radium(FlexBookPrevNextTop));
