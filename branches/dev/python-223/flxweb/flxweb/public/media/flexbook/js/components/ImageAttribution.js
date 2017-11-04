import React from 'react';
import Link from './common/Link';

const ImageAttribution = ({index, author, src, url, license}) => (
    <div className='imageattribution' style={styles.container}>
      <span src={src} style={styles.index}>[{index}]</span>
      <Link onClick={()=>handleClick(src)} style={styles.caret}> ^ </Link>
      {author && (<span>Credit: {author}; </span>)}
      {url && (<span>Source: <Link href={url} target={'_blank'} style={styles.url}>{url}</Link>;</span>)}
      {license && (<span>License: <Link>{license}</Link> </span>)}
    </div>
);

const handleClick = (src) => {
  window.scrollTo(0, document.querySelector(`img[src="${src}"]`).offsetTop);
};

ImageAttribution.propTypes = {
  author: React.PropTypes.string,
  src: React.PropTypes.string,
  license: React.PropTypes.string
};

const styles = {
  container: {
    fontSize: 14,
    marginLeft: 20,
    lineHeight: '20px'
  },
  index:{
    fontWeight: 'bold'
  },
  caret: {
    fontWeight: 'bold'
  },
  url: {
    wordBreak: 'break-word'
  }
};
export default ImageAttribution;
