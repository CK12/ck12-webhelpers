import React from 'react';
import Radium from 'radium';
import Header from './common/Header';
import CK12HTML from './CK12Html';

const MetadataColumn = ({header, content, ContentComponent, contentXHTML, width, float}) =>{
  if (ContentComponent){
    content = (<ContentComponent content={content} />);
  } else if (contentXHTML) {
    content = (<div style={styles.contentXHTML}><CK12HTML content={contentXHTML} /></div>);
  }
  return (
    <div className='metadatacolumn' style={[{width: width}, {float: float}, styles.columnStyles]}>
      <Header size='header4' style={styles.header}>{header}</Header>
      <div>{ content }</div>
    </div>
  );
};

const styles = {
  columnStyles:{
    display: 'inline-block',
    verticalAlign: 'top'
  },
  header: {
    textTransform :'capitalize'
  },
  contentXHTML:{
    marginLeft: '2em'
  }
};

export default Radium(MetadataColumn);
