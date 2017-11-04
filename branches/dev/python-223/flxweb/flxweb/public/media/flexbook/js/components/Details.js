import React, {Component} from 'react';
import Radium from 'radium';
import Link from './common/Link';
import Metadata from '../containers/Metadata';

@Radium
export default class Details extends Component {
  constructor(props){
    super(props);
    this.state = {
      show: false
    }
  }
  render(){
    let {show} = this.state;
    return(
      <div className='show-for-small'>
        <Link onClick={()=>this.toggleHide()}>{show? 'Hide Details \u25B2': 'Show Details \u25BC'}</Link>
        {
          show? (
            <Metadata/>
          ): <div/>
        }

      </div>
    )
  }

  toggleHide(){
    let {show} = this.state;
    this.setState({
      show: !show
    });
  }
}
