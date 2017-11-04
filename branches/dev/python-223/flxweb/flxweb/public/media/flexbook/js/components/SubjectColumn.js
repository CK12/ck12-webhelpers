import React from 'react';
import Header from './common/Header';
import Topic from './Topic';
const SubjectColumn = ({title, topics=[]}) => (
  <div  className='columns large-4 subjectcolumn'>
    <Header style={{paddingBottom:'40px'}} size='header2'>{title}</Header>
    {topics.map((title,index)=><Topic key = {index} {...title}/>)}
  </div>
);

export default SubjectColumn;
