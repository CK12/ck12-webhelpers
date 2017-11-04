import React, {Component} from 'react';
import Link from './Link';
import Radium from 'radium';

@Radium
class HideShowLinks extends Component{
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
    let {links, limit = 3} = this.props;
    return (<span>
      {links.slice(0,limit)}
      {links.length > limit &&
      (<span>
        <span style={this.state.hide? styles.hide: {}}>{links.slice(limit)}</span>
        <span style={[styles.more, this.state.hide? {}: styles.hide]} onClick={()=>this.handleClick()}>
          {', '}<Link>{` (${links.length - limit} more)`}</Link>
        </span>
      </span>)
      }
    </span>);
  }
}


const styles = {
  more: {
    whiteSpace: 'nowrap'
  },
  hide: {
    display: 'none'
  }
};

export default HideShowLinks;
