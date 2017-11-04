import React from 'react';
import Button from './common/Button';
import Link from './common/Link';

const NoGroups = () => (
  <div>
    <div
      className='nogroups'
      style={styles.noGroupsText}> You don't own any group.  Please create a study group or class to share this.</div>
    <div style={styles.buttonContainer}>
      <Button color='tangerine'>
        <Link style={{color:'white'}} href="/my/groups#create">
          Create a Group
        </Link>
      </Button>
    </div>
  </div>
);

const styles = {
  noGroupsText:{
    lineHeight: '21px',
    fontSize: '14px',
    padding: '11px 0 12px',
  },
  buttonContainer:{
    textAlign:'center'
  }
};

export default NoGroups;
