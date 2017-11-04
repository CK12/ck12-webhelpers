/**
 Container component for handling breadcrumbs in auto Aligned project

*/

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import React, { Component } from 'react';

import BreadCrumb  from '../common/components/BreadCrumb.jsx';


import {
    Actions,
    ActionMethods
} from '../actions/'

const {
    clearSelectedCountry,
    clearSelectedRegion,
    clearSelectedStandard,
    MoveToStdSelection
        } = ActionMethods; // destructuring the methods required to send

class BreadCrumbContainer extends Component {

  constructor(){
    super();
    this.onStandardsClick =  this.onStandardsClick.bind(this);
    this.onCountryClick   = this.onCountryClick.bind(this);
    this.onRegionClick    = this.onRegionClick.bind(this);
  }
  render() {
    const {
          currentStandardCode,
          currentStandardName,
          currentCountryName,
          currentCountryCode,
          currentRegionCode,
          currentRegionName
        } = this.props;

    let breadcrumbConfig;
    if(! currentRegionCode ){
      breadcrumbConfig  =  [
        { text : 'Standards', clickCb : this.onStandardsClick},
        { text : currentCountryName, clickCb : this.onCountryClick},
        { text : currentStandardName}
      ];
    }else{
       breadcrumbConfig  =  [
         { text : 'Standards', clickCb : this.onStandardsClick},
         { text : `${currentCountryName}-${currentRegionName}`, clickCb : this.onRegionClick},
         { text : currentStandardName}
       ];
    }


    const breadCrumbProps  =  {
        breadcrumbConfig,
        separator : '>',
        breadCrumbChildClass : 'aligned-standard-text'
    };

    return (
          <BreadCrumb {...breadCrumbProps}/>
        )
  }
  onStandardsClick(){
    const { action } = this.props;

    action.clearSelectedCountry();
    action.clearSelectedRegion();
    action.clearSelectedStandard();
    action.MoveToStdSelection();
  }
  onCountryClick(){
    const { action } = this.props;
    action.clearSelectedRegion();
    action.clearSelectedStandard();
    action.MoveToStdSelection();
  }
  onRegionClick(){
    const { action } = this.props;
    action.clearSelectedStandard();
    action.MoveToStdSelection();
  }
}

let mapStateToProps = (state, ownProps)=> {
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  return {
    action: bindActionCreators({
      clearSelectedCountry,
      clearSelectedRegion,
      clearSelectedStandard,
      MoveToStdSelection
    }, dispatch)
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(BreadCrumbContainer);
