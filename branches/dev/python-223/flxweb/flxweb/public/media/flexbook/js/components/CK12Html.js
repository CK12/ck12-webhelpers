import React from 'react';
import {connect} from 'react-redux';
import {processMathJaxContent, processAltContent} from '../utils/ck12content.js';
import {extractImageAttributions} from '../utils/imageAttribution';
import {getCurrentSectionArtifact} from '../selectors/selectors.js';
import {isOnlyMobile} from '../utils/utils.js';

class CK12HTML extends React.Component { 
  getContent(){
    let content = this.props.content || '';
    content = processAltContent(content);
    return {
      __html: content
    };
  }
  handleClick(src){
    window.scrollTo(0, document.querySelector('span[src="'+src+'"]').offsetTop);
  }

  refresh(){
    let imageAttributions = extractImageAttributions(this.props.content).filter((attribution)=>attribution.author);
    for(let i = 0; i < imageAttributions.length; i++)
    {
      let src = imageAttributions[i].src;
      let image = this.refs.content.querySelector('img[src="'+ src  +'"]');
      let el = document.createElement('div');
      el.innerHTML = `<a>[Figure ${i+1}]</a>`;
      el.onclick = this.handleClick.bind(this, src);
      image.insertAdjacentElement('afterend', el);
    }

    let isMobile = isOnlyMobile();
    let resourceVideos = this.refs.content.querySelectorAll('[itemprop="video"] > iframe');
    for(let i=0;i < resourceVideos.length;i++)
    {
      let video = resourceVideos[i];
      let src = resourceVideos[i].src;
      if(isMobile && src.indexOf('/flx/show/interactive')>0)
      {
        video.parentNode.innerHTML = '<a target="_blank" href="'+src+'" title="View Interactive">Click to view Interactive</a>';
      }
      else
        video.style.maxWidth = "100%";
    }

    if(isMobile)
    {
      let mathJaxContent = this.refs.content.querySelectorAll('p .x-ck12-mathEditor');
      for(let i=0;i < mathJaxContent.length;i++)
      {
        let mathJax = mathJaxContent[i];
        mathJax.closest('p').style.overflowY='hidden';
      }

      let tableContent = document.querySelectorAll('#artifact_content table');
      for(let i=0;i < tableContent.length;i++)
      {
        let tmp = document.createElement('div');
        tmp.style.overflowX = 'scroll';
        tmp.appendChild(tableContent[i].cloneNode(true));
        tableContent[i].outerHTML  = tmp.outerHTML;
      }
    }
    
    var self=this;
    processMathJaxContent(function() {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, self.props.contentID]);
    });
  }

  componentDidMount(){
    this.refresh();
  }

  shouldComponentUpdate(nextProps){
    let {artifact:{id:artifactID}, content} = this.props,
    {artifact:{id:nextArtifactID}, nextContent} = nextProps;
    return (content!=nextContent || artifactID!=nextArtifactID);
  }

  componentDidUpdate(){
    this.refresh();
  }

  render(){
    return (
      <div
        style={{wordWrap:'break-word'}}
        className='ck12html'
        ref='content'
        className="ck12-content-container"
        dangerouslySetInnerHTML={this.getContent()}>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  return {
    artifact
  };
};

CK12HTML.propTypes = {
  content: React.PropTypes.string
};

export default connect(
  mapStateToProps,
  null
)(CK12HTML);
