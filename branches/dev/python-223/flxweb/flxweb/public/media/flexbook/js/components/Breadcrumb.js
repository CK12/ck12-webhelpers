import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setCurrentSection} from '../actions/location';
import Radium from 'radium';


@Radium
class Breadcrumb extends Component{
  render(){
    let {inactive, url, label, position} = this.props;
    return (
      <span>
        <span title={label} className='breadcrumb'>
          <a onClick={position?(event)=>this.handleClick(event):''} href={url} style={[styles.breadcrumb, (inactive && styles.inactive.breadcrumb)]}>{label}</a>
        </span>
        <i style={[styles.arrow, (inactive && styles.inactive.arrow)]} className='icon icon-arrow3_right '/>
      </span>
     );
  }

  handleClick(event){
    event.preventDefault();
    this.props.setCurrentSection(this.props.position);
  }
}

const styles = {
  arrow: {
    color: '#ccc',
    fontSize: 7,
    marginRight: 6
  },
  breadcrumb: {
    color: '#00aba4',
    fontSize: '12px',
    marginTop: '-1px',
    maxWidth: '195px',
    '@media screen and (max-width: 1023px) and (min-width: 768px)':{
      maxWidth: '105px'
    },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    verticalAlign: 'middle',
    cursor: 'pointer'
  },
  //state specific styles
  inactive: {
    breadcrumb:{
      color: '#8e8774',
      cursor: 'default',
      pointerEvents: 'none',
      overflow: 'visible',
      '@media screen and (max-width: 1023px) and (min-width: 768px)':{
        maxWidth: '400px'
      },
      '@media screen and (max-width:767px)':{
        maxWidth: '285px',
        whiteSpace: 'normal'
      }
    },
    arrow: {
      display: 'none'
    }
  }
}

const mapStateToProps = (state) => state;

export default connect(
  mapStateToProps,
  {
    setCurrentSection
  }
)(Breadcrumb);
