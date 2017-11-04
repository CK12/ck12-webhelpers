import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import FlexBookLink from '../components/FlexBookLink.js';
import {
  getCurrentSectionArtifact,
  getNextSectionInfo,
  getPreviousSectionInfo
} from '../selectors/selectors.js';
import {setCurrentSection} from '../actions/location';
import {formatHandle} from '../utils/utils';

class FlexBookBottomTitle extends React.Component{

  constructor(){
    super();
    this.goToPreviousSection = this.goToPreviousSection.bind(this);
    this.goToNextSection = this.goToNextSection.bind(this);
  }

  goToPreviousSection(){
    let {setCurrentSection, previousSectionPosition} = this.props;
    setCurrentSection(previousSectionPosition);
  }

  goToNextSection(){
    let {setCurrentSection, nextSectionPosition} = this.props;
    setCurrentSection(nextSectionPosition);
  }
  get prevStyles(){
    return Object.assign({}, styles.prior, (this.props.previousSectionPosition == null && styles.displayNone) || {});
  }

  get nextStyles(){
    return Object.assign({}, styles.next, (this.props.nextSectionPosition == null && styles.displayNone) || {});
  }
  render(){
    let props = this.props;
    if(props.artifact.type.name === 'lesson' || props.artifact.type.name === 'section'){
      let prev = {
        ...props.flexbookLocationInfo,
        title: props.previousArtifact?formatHandle(props.previousArtifact.title):'',
        section: props.previousSectionPosition
      };
      let next = {
        ...props.flexbookLocationInfo,
        title: props.nextArtifact?formatHandle(props.nextArtifact.title):'',
        section: props.nextSectionPosition
      };
      return(
        <div className='flexbookbottomtitle'>

          <nav className='clearfix'>

            <div className='divider'>
            </div>

            <div className='spacetoplarge'>
            </div>

            <div
              style = {this.prevStyles}
              className="rightinsidewidth">

              <FlexBookLink
                {...prev}
                onClick={this.goToPreviousSection}>

                <span style = {styles.padLeft}>

                  <span
                    style = {styles.iconRight}
                    className="icon-arrow3_left">
                  </span>

                  <span className="nolink block">Previous</span>

                  <span className="link">
                    {prev.title}
                  </span>

                </span>

              </FlexBookLink>

            </div>
            <div
              style = {this.nextStyles}
              className="rightinsidewidth">
              <FlexBookLink
                {...next}
                onClick={this.goToNextSection}>
                <span style = {styles.padRight}>
                  <span
                    style = {styles.iconLeft}
                    className="icon-arrow3_right">
                  </span>
                  <span className="nolink block">Next</span>
                  <span className="link">
                    {next.title}
                  </span>
                </span>
              </FlexBookLink>
            </div>

            <div className='clear'>
            </div>

            <div className='divider spacetoplarge'>
            </div>

          </nav>

        </div>
      );
    }
    return null;
  }
}


const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  let flexbookLocationInfo = state.locationInfo;
  let {
    artifact:nextArtifact,
    position:nextSectionPosition
  } = (getNextSectionInfo(state) || {});
  let {
    artifact:previousArtifact,
    position:previousSectionPosition
  } = (getPreviousSectionInfo(state) || {});

  return {
    artifact,
    flexbookLocationInfo,
    nextArtifact,
    nextSectionPosition,
    previousArtifact,
    previousSectionPosition
  };
};

const styles = {
  iconRight:{
    position: 'absolute',
    left: '0px',
    top: '6px',
    width: '13px',
    height: '21px',
    fontSize: '22px',
    color: '#b5b1a8'
  },
  iconLeft:{
    position: 'absolute',
    right: '0px',
    top: '6px',
    width: '13px',
    height: '21px',
    fontSize: '22px',
    color: '#b5b1a8'
  },
  prior:{
    float: 'left',
    width: '49%',
    wordWrap: 'break-word'
  },
  next:{
    float: 'right',
    textAlign: 'right',
    width: '49%',
    wordWrap: 'break-word'
  },
  padRight:{
    position: 'relative',
    paddingRight: '30px',
    right: '0px',
    display: 'block'
  },
  padLeft:{
    position: 'relative',
    paddingLeft: '30px',
    left: '0px',
    display:'block'
  },
  displayNone:{
    display: 'none'
  }
};
export default connect(
  mapStateToProps,
  {
    setCurrentSection
  }
)(FlexBookBottomTitle);
