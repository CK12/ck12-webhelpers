import React, {Component} from 'react';
import Checkbox from './common/Checkbox';

class Group extends Component{
  render(){
    let {name, id} = this.props;
    return (
      <div className='group'>
        <Checkbox value={id} onClick={(data)=>this.onClick(data)}/>
        <span style={styles.label}>{name}</span>
      </div>
    );
  }

  onClick(data){
    let {isSelected,id} = data;
    this.props.toggleGroup({id, isSelected});
  }
}

const styles = {
  label: {
    marginLeft: 10
  }
};
export default Group;
