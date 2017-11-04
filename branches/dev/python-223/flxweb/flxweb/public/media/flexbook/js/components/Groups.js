import React, {Component} from 'react';
import Group from './Group';

export default class Groups extends Component{
  render(){
    let {groups} = this.props;
    let groupList = groups.map(
      ({name, id}, index)=>
        <Group key={`group-${index}`} id={id} name={name} toggleGroup={(data)=>this.toggleGroup(data)}/>
      );
    return( <div className='groups' style={styles.container}>{groupList}</div>);
  }

  toggleGroup(data = {}){
    this.props.toggleGroup(data);
  }
}

const styles = {
  container: {
    margin: '18px 0',
    maxHeight: '100px',
    overflowY: 'auto'
  }
};
