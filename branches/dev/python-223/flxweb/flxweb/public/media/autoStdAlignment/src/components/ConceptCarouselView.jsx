import React, { Component } from 'react';

import ConceptView from './ConceptView.jsx';

import Slider from  'react-slick';

class PrevArrowClass extends Component{
    render(){
      return <button  {...this.props}  style={{...Styles.arrowStyle, ...{ left:'0%'}}}></button>
    }
}

class NextArrowClass extends Component{
    render(){
      return <button {...this.props} style={{...Styles.arrowStyle, ...{ right:'0%'}}}></button>
    }
}

class ConceptCarouselView extends Component {
  render() {
    const {
          conceptList,
          sId,
          handleConceptCheckBoxEvent,
          handleAddConceptToSid,
          conceptsSelected
        } = this.props;



    const settings  = {
          dots : true,
          // arrows : true,
          className : 'aligned-concept-carousel',
          infinite : false,
          prevArrow : <PrevArrowClass/>,
          nextArrow : <NextArrowClass />
    }

    let concepts  = conceptList.map((val, idx)=>{

                      const conceptViewProps = {
                        conceptData : val,
                        sId,
                        url : this.getConceptUrl(val),
                        handleConceptCheckBoxEvent,
                        isSelected : conceptsSelected.includes(val.eid)
                      };

                      return <ConceptView { ...conceptViewProps } key={idx}/>
                    });

    // Make this another component and never update as its static
    const getStaticConceptBlock = ()=>{
              return <div style={ Styles.staticConceptBlockContainer} key={1000} onClick={(e)=>{handleAddConceptToSid(sId)}}>
                        <div style={ Styles.staticConceptBlockImgArea }>
                            <img src='/media/autoStdAlignment/images/AddConceptIcon.png'
                              style={ Styles.imgStyle }/>
                        </div>
                        <a>Add Concept</a>
                    </div>
    };

    concepts.push(getStaticConceptBlock());

    let arrays = [],
        size = 8; // TODO : Pass data from top

    while (concepts.length > 0)
        arrays.push(concepts.splice(0, size));

    let conceptsUI =  arrays.map((list, idx)=>{
        return  <div key={idx}>
                  {list.map(node=>node)}
                </div>
    });

    return (
      <Slider {...settings}>
        {conceptsUI || <div></div>}
      </Slider>
        )
  }
  // TODO : should be from top
  getConceptUrl(conceptData){
    return `${window.location.origin}${conceptData.relativeConceptUrl}`;
  }
}

export default ConceptCarouselView;

ConceptCarouselView.defaultProps = {
  conceptList : [],
  handleAddConceptToSid : ()=>{}
};

const Styles = {
  staticConceptBlockContainer : {
      'width': '150px',
      'height': '220px',
      marginLeft : '10px',
      float : 'left',
      marginBottom : '10px',
      display: 'inline-block',
      position:'relative'
  },
  staticConceptBlockImgArea:{
      height: '150px',
      width:'100%',
      backgroundColor:'white',
      borderRadius: '5px',
      border : '1px solid lightgrey',
      boxShadow:  '0.5px 0.5px 1px 1px lightgrey'
  },
  imgStyle:{
      top: '20%',
      left : '33%',
      position: 'relative'
  },
  arrowStyle:{
     width:'55px',
     height:'90px',
     position:'absolute',
     borderRadius:'7px',
     backgroundColor:'grey',
     top:'185px',
     zIndex:10,
     opacity: 0.5
  }
}
