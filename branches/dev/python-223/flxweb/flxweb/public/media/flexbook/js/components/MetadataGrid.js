import React, {Component} from 'react';
import Link from './common/Link';
import {getSearchPath} from '../utils/utils';
import HideShowLinks from './common/HideShowLinks';

class MetadataGrid extends Component{
  constructor(){
    super();
    this.state = {
      hide: true
    };
  }

  handleClick(){
    this.setState({
      hide: false
    });
  }

  render(){
    let {content, type} = this.props;
    return (<div style={styles} className='metadatagrid'> { this.gridDataToLinks(content, type) } </div>);
  }

  gridDataToLinks(array=[], type){
    let links = array.map((item, index) => (
      <span key={ `metadataLink_${type}_${index}` }>
        {!!index && ','}
        <Link
          href={getSearchPath(item, type)}
        > {item}
        </Link>
      </span>
    ));
    return (
      <HideShowLinks links={links}/>
    );
  }
}

const styles={
  wordWrap: 'break-word',
  maxWidth: '100%'
};

export default MetadataGrid;
