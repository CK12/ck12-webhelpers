import React from 'react';
import Header from './common/Header';
import Separator from './common/Separator';
import BrowseStatic from './BrowseStatic';

const NotFound = () => (
  <div className='notfound' style={styles}>
    <Header style={{paddingTop:'40px'}} size='header2'>
      Oops! We can't find the page you're looking for.
      <br/>
      But don't let us get in your way! Continue browsing below.
    </Header>
    <Separator/>
    <BrowseStatic/>
  </div>
);

const styles = {
  lineHeight: '40px',
  textAlign: 'center',
  overflow: 'auto'
};

export default NotFound;
