import React, {Component} from 'react';
import Radium from 'radium';
import FlexBookLink from './FlexBookLink.js';
import Image from './common/Image.js';
import * as constants from '../constants/constants';
import Icon from './common/Icon.js';
import Button from './common/Button.js';
import {Row} from 'react-foundation';

@Radium
export default class RelatedMod extends Component {

  render(){
    let subChildDisplayItem;
    let {
      handle,
      title
    } = this.props;
    let src;
    let artifactType = this.props.type.name;
    let modality = artifactType +'/'+this.props.handle;
    let className = 'individual-modality';
    let target = '_blank';
    let linkInfo = {handle,artifactType,modality,title,className,target,isRelatedMod:true};
    let isModaility = this.props.resources.every(function(child){
      if(child.type.name == 'cover page'){
                      src = (child.satelliteURL) ? child.satelliteURL: child.uri;
                      return false;
                    }
    });
    let imageInfo = {src,title};
    let modalityName = (constants.CK12MODALITY != null) ? constants.CK12MODALITY.modalities[artifactType].display_label: 'DISPLAY NAME';
    let iconName = (modalityName == 'PLIX') ? 'interactive_practice' :'video';//Consider video and Plix as of now
    if(modalityName != 'Practice'){
      subChildDisplayItem =
              <div>
                <div className = "modality-type-wrapper">
                  <Icon name= {iconName} style ={styles.modalityIcon}></Icon>
                  <span style ={styles.modalityType}>{modalityName}</span>
                </div>
                <div style= {styles.modalityTitle}>
                  <span style={styles.modalitySpan}>{title}</span>
                </div>
              </div>;
    }else{
      subChildDisplayItem =
              <div>
                <div className = "modality-type-wrapper" style = {styles.ctextAlign}>
                  <div style={styles.practiceSummary}>{title}</div>
                  <Button style={styles.practiceButton} color='tangerine' arrow={{type:'right', color: '#D9491A', style:{right: '-6px', position: 'absolute',marginRight:'10px'}}}>
                    Practice
                  </Button>
                </div>
              </div>;
    }
    return (
      <span className='relatedmod' style = {styles.parentindividualModality}>
        <FlexBookLink {...linkInfo}>
          <div style = {styles.imageWrapper}>
            <Image {...imageInfo} style={styles.practiceImage}/>
          </div>
          <div style = {[styles.textWrapper,styles.ftextAlign]}>
             {subChildDisplayItem}
          </div>
        </FlexBookLink>
      </span>
    );
  }
}

const styles = {
  parentindividualModality:{
    paddingRight: '15px',
    width: '33.33%',
    paddingLeft: '5px',
    paddingBottom: '5px',
    float: 'left',
    boxSizing: 'border-box',
    '@media screen and (max-width: 767px)':{
      width: '100%',
      marginBottom: 15
    }
  },
  imageWrapper:{
    maxHeight: '160px',
    overflow: 'hidden',
    position: 'relative',
    '@media screen and (max-width: 767px)':{
      width: 120,
      float: 'left'
    }
  },
  textWrapper:{
    maxHeight: '160px',
    overflow: 'hidden',
    position: 'relative',
    '@media screen and (max-width: 767px)':{
      width: 'calc(100% - 120px)',
      float: 'left'
    }
  },
  ftextAlign:{
    textAlign: 'left'
  },
  ctextAlign:{
    textAlign:'center'
  },
  modalityTitle: {
    maxHeight: '48px',
    overflow: 'hidden',
    padding: '0 20px',
    textOverflow: 'ellipsis'
  },
  modalityIcon: {
    color: '#aaa287',
    fontSize: '18px',
    '@media screen and (max-width: 767px)':{
      display: 'none'
    }

  },
  modalityType: {
    color: '#aaa287',
    display: 'inlineBlock',
    fontSize: '15px',
    fontWeight: 'bold',
    marginLeft: '8px',
    position: 'relative',
    textTransform: 'uppercase',
    top: '-2px',
    '@media screen and (max-width: 767px)':{
      margin: 0,
      fontSize: 12
    }

  },
  modalitySpan: {
    color: '#1aaba3',
    fontSize: '18px',
    '@media screen and (max-width: 767px)':{
      fontSize: 13,
      maxHeight: '37px',
      overflow: 'hidden'
    }
  },
  practiceSummary: {
    color: '#1aaba3',
    marginTop: '10px',
    maxHeight: '45px',
    overflow: 'hidden',
    padding: '0 20px',
    width: '100%',
    boxSizing: 'border-box'
  },
  practiceImage:{
    width:'100%',
    height: 'auto'
  },
  practiceButton: {
    padding: '7px 10px 9px 10px',
    width: '80%',
    marginLeft: '-15%',
    marginTop: '10px',
    marginBottom: '10px'
  }
};

//Props validation
RelatedMod.propTypes = {
  title: React.PropTypes.string.isRequired
};
