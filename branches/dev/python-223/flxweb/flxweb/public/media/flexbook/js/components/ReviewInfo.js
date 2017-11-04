import React from 'react';
import Icon from './common/Icon';

const ReviewInfo = ({name='',createdTime='', score = 1, isIcon=true}) =>{
  let names = name.split(' ');
  name = names[0] + ' ' + names[1].charAt(0); //Showing only the first name and last name inital
  return (
  <div className='reviewinfo' style={styles.container}>
    <span style={styles.name}> {name}</span>
    <span style={styles.timestamp}> {createdTime} </span>
    {isIcon && <Icon color='#999' name={score==1?'like':'unlike'} color={score==1?'#1aaba3':'#ff6633'}></Icon>}
  </div>);
}
const styles = {
  container: {
    marginBottom: 10
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
    marginRight: 4
  }
};



export default ReviewInfo;
