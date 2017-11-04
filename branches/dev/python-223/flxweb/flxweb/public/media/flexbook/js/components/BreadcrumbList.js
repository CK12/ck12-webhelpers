import React, {Component} from 'react';
import Breadcrumb from './Breadcrumb';

class BreadcrumbList extends Component{
  getBreadcrumbs(){
    return this.props.data.map((data, index)=>
    <Breadcrumb
      key={index}
      inactive={data.isInactive}
      label={data.label}
      url={data.url}
      position={data.position}/>
  );
  }
  render(){
    return (<div className='breadcrumblist' style={styles}>{this.getBreadcrumbs()}</div>);
  }
}

const styles = {
  paddingLeft: 15,
  paddingRight: 15,
  paddingTop: 20
};

export default BreadcrumbList;
