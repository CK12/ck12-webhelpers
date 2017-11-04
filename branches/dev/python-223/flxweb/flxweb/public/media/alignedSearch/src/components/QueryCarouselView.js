import React, { Component } from 'react';

import Slider from  'react-slick';

import Loader from './Loader';

import ReviewBox from './ReviewBox';

class PrevArrowClass extends Component{
  render(){
    return <button  {...this.props}  style={{...Styles.arrowStyle, ...Styles.leftArrow}}></button>
  }
}

class NextArrowClass extends Component{
  render(){
    return <button {...this.props} style={{...Styles.arrowStyle, ...Styles.rightArrow}}></button>
  }
}

class QueryCarouselView extends Component {
  constructor(props) {
    super(props);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.renderMathJax = this.renderMathJax.bind(this);
  }

  componentDidUpdate(prevProps){
    if(this.props.slidesData){
      const index = this.props.slidesData.findIndex((slide, index) => slide && prevProps.slidesData[index] !== slide);
      const slideData = this.props.slidesData[index];
      if(slideData && !slideData.isFetching){
        this.renderMathJax(index);
      }
    }
  }

  renderMathJax(index) {
    var $this, cnt = 0;
    $('.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math', '#slide_'+index).each(function () {
      try {
        var mathLatex,
        $this = $(this),
        decodedTex;
        if($this.hasClass('x-ck12-mathEditor') && $this.data('tex')){
          decodedTex = decodeURIComponent($this.attr('data-tex'));
          if (decodedTex.indexOf('\\begin{align') === -1) {
            mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
          } else {
            mathLatex = decodedTex;
          }
          mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
          /*if ($this.data('math-class') === 'x-ck12-block-math') {
            mathLatex = '@$$' + mathLatex + '@$$';
          } else {
            mathLatex = '@$' + mathLatex + '@$';
          }
          mathLatex = mathLatex.replace(/</g, '&lt;');*/
          $this.html(mathLatex).removeAttr('data-tex-mathjax').closest('p').css('overflow-y','hidden');
          cnt++;
        }
        else {
          if($this.attr('alt') !== undefined){
            $this.attr('alt',$this.attr('alt').replace("<", "\\lt ").replace(">", "\\gt "));
          }
          if(!$this.data('tex')){
            $this.remove();
          }
        }
      } catch (merr) {
        console.log('Error rendering math: ' + merr);
      }
    });
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, '#slide_'+index]);
    console.log('Queued ' + cnt + ' math expressions');
  }


  render() {
    const {
      currentQuery,
      sliderData,
      slidesData,
      beforeSlide,
      toggleExpandCarousel,
      carouselExpanded
    } = this.props;

    const settings  = {
      dots : true,
      arrows : true,
      className : 'aligned-search-carousel',
      infinite : false  ,
      slidesToShow: 1,
      prevArrow : <PrevArrowClass/>,
      nextArrow : <NextArrowClass />,
      beforeChange: (prevIndex, nextIndex) => {
        if(!slidesData[nextIndex]){
          beforeSlide(nextIndex);
        }
      }
    }

    if(!sliderData){
      return (<div></div>);
    }else if(sliderData.isFetching){
      return <Loader loaderStyle={{top : "265px", left: '0px'}}/>;
    }else if(!(slidesData && Array.isArray(slidesData) && (slidesData.length >  0 ))){
      return (<div></div>);
    }
    
    const dynamicStyle = {
      expandIconClass: (carouselExpanded ? 'icon-contract-2' : 'icon-expand-2')
    }

    function createMarkup(string) {
      return {__html: string};
    }

    let slideViews  =  slidesData.map((slideData, index)=>{
      return (
        <div key={index}>
          <div style={Styles.wrapperStyle} id={'slide_' + index}>
            {slideData && slideData.isFetching 
              ? (<Loader loaderStyle={{'top' : "238px", left: '0px'}}/>) 
              : (<div dangerouslySetInnerHTML={createMarkup((slideData ? slideData.xhtml : ''))} style={Styles.contentStyle}/>)
            } 
          </div>
          {slideData && !slideData.isFetching && (<ReviewBox artifactID={slideData.id} question={currentQuery}/>)}          
        </div>
      )
    });
    return (
      <div style={{position: 'relative'}}>
        <Slider {...settings}>        
          {slideViews}
        </Slider>
        <div className="pointer"  style={Styles.actionBox}>
          <i className={dynamicStyle.expandIconClass} style={Styles.actionButtonStyle} onClick={this.toggleExpand}></i>
        </div>
      </div>
    )
  }

  toggleExpand(){
    this.props.toggleExpandCarousel();
  }
}

export default QueryCarouselView;

const Styles = {   
  arrowStyle:{
   width:'45px',
   height:'65px',
   position:'absolute',
   borderRadius:'7px',
   backgroundColor:'grey',
   top:'240px',
   zIndex:10
 },
 leftArrow: {
  left:'-22px'
 },
 rightArrow: {
  right:'-22px'
 },
 wrapperStyle: {
  paddingTop: '10px', 
  height: '500px',  
  margin: '5px 8px 20px 8px',  
  boxShadow: '0px 0px 6px 1px lightgrey', 
  boxSizing: 'border-box', 
  borderRadius: '5px'
 },
 contentStyle: {
  overflowY: 'auto', 
  height: "480px", 
  padding: "25px 40px 15px 50px"
 },
 actionBox: {
  position: 'absolute', 
  top: '15px', 
  right: '30px'
 },
 actionButtonStyle: {
  fontSize: '35px', 
  color: "#577dba"
 }
}
