import React from 'react';
import Separator from './common/Separator';
import MetadataColumn from './MetadataColumn';

const MetadataRow = ({data}) => {
  const width = `${100/data.length}%`;

  return (
  <div className='metadatarow'>
    <Separator/>
    <div style={{display:'inline-block',width:'100%'}}>
      {data.map(({header, content, contentXHTML, ContentComponent, float}, index)=> <MetadataColumn
          key={index}
          header={header}
          content={content}
          contentXHTML={contentXHTML}
          ContentComponent={ContentComponent}
          width={width}
          float = {float}/>)}
    </div>
  </div>
  );
};


export default MetadataRow;
