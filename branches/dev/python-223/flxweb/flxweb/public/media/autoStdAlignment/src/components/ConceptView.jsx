import React, { Component } from 'react';

import AlignedCheckBox from '../components/AlignedCheckBox.jsx';

const defaultImgUrl =  '/media/autoStdAlignment/images/concept.svg';

class ConceptView extends Component {
  constructor(){
    super();
    this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
  }
  // TODO NOT USING THIS RIGHT NOW BECAUSE THE URL FOR IMAGES does not have valid certificate
  replaceProtocol(url){
    let appProtocol =  window.location.protocol;
    return url.replace(/^https?:/, appProtocol);
  }
  shouldComponentUpdate( nextProps, nextState){
    return nextProps.conceptData.eid != this.props.conceptData.eid
            || nextProps.isSelected != this.props.isSelected ;
  }
  render() {
    const {
          conceptData,
          sId,
          isSelected,
          url
        } = this.props;
    const alignedCheckBoxProps = {
        checkBoxStyle : Styles.checkBoxStyle,
        handleCheckBoxChange : this.handleCheckBoxChange,
        isSelected
    }
    return (
          <div  style={Styles.conceptContainer}>
              <div style={ Styles.conceptCheckBoxContainer }>
                <AlignedCheckBox {...alignedCheckBoxProps} />
              </div>

                { conceptData.previewImageUrl &&
                    <div style={ Styles.conceptContent }>
                      <img src={conceptData.previewImageUrl} style={ Styles.imgStyle }/>
                    </div>
                }{
                  ! conceptData.previewImageUrl &&
                    <div style={ Styles.defaultConceptContent }>
                      <img src={defaultImgUrl} style={ Styles.defaultImgStyle }/>
                    </div>
                }
              <a href={url} className='aligned-standard-text'>{conceptData.name}</a>
          </div>
        )
  }
  handleCheckBoxChange(e){
    const { conceptData,sId, handleConceptCheckBoxEvent } = this.props;
    handleConceptCheckBoxEvent(sId, conceptData.eid)
  }
}

export default ConceptView;

ConceptView.defaultProps = {
  conceptData : {},
  handleConceptCheckBoxEvent : ()=>({})
};

const Styles = {
  conceptContainer:{
      'width': '150px',
      'height': '190px',
      marginLeft : '12px',
      float : 'left',
      marginBottom : '30px',
      display: 'inline-block',
      position:'relative'
  },
  conceptCheckBoxContainer:{
    position:'absolute',
    left:'10px',
    top:'10px'
  },
  conceptContent:{
    height: '150px',
    width:'100%',
    // backgroundColor:'black',
    // opacity:0.65,
    borderRadius: '5px',
  },
  imgStyle:{
    'width': '100%',
     height:'150px',
     border: "1px solid #CCCCCC"
  },
  defaultConceptContent:{
    border: "1px solid #CCCCCC",
    boxShadow: 'lightgrey 0.5px 0.5px 1px 1px',
    height:'150px'
  },
  defaultImgStyle:{
    top: '20%',
    left : '33%',
    position: 'relative'
  },
  checkBoxStyle:{
    backgroundColor: 'white'
  }
}
