import React from 'react';
import SubjectColumn from './SubjectColumn';
import TOPICS_MAP from '../constants/topics';

const BrowseStatic = () => (
  <div style={{paddingRight:'50px'}} className='browsestatic'>
    <SubjectColumn
      title='Math'
      topics={TOPICS_MAP.math}/>
    <SubjectColumn
      title='Science'
      topics={TOPICS_MAP.science}/>
    <SubjectColumn
      title='More'
      topics={TOPICS_MAP.more}/>
  </div>
);

export default BrowseStatic;
