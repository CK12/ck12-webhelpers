import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';

import {toTitleCase} from '../utils/StringUtils';

import {
    Actions,
    ActionMethods
} from '../actions/'

const {
  StdSelectionCompInit,
  StdSelectionNextStep,
  StdSelectionStandardChanged,
  StdSelectionCountryChanged,
        } = ActionMethods; // destructuring the methods required to send

// Components
import Loader from '../common/components/Loader.jsx';
import Select from '../components/Select.jsx';
import NextButton from '../components/NextButton.jsx';

class StandardsSelectionContainer extends Component {

  constructor(props) {
    super(props);
    this.moveForward = this.moveForward.bind(this);
    this.changeCountry =  this.changeCountry.bind(this);
    this.changeStandard = this.changeStandard.bind(this);
  }
  componentWillMount(){
    const { action } = this.props;
    action.StdSelectionCompInit();
  }
  createOptionListForCountryField(countryData){
    const countryOptions =  [];

    let currentCountryText;
    const { currentCountryCode, currentRegionCode } = this.props;

    Object.values(countryData).forEach((country, idx)=> {

          countryOptions.push({
              label : toTitleCase(country.countryName),
              value : country.countryCode,
              class : 'auto-aligned-options option-group',
              attribute : {
                            countryCode : country.countryCode,
                            countryName:country.countryName
                          }
          })
          if ( country.countryCode == currentCountryCode ){
              currentCountryText =  toTitleCase(country.countryName)
          }

          country.regions.forEach((region,index)=>{
                const regionData =  region.region;

                countryOptions.push({
                  label : `-${toTitleCase(regionData.regionName)}`,
                  value : regionData.regionCode,
                  class : 'auto-aligned-options option-list',
                  attribute : {
                                countryCode : country.countryCode,
                                countryName:country.countryName,
                                regionCode : regionData.regionCode,
                                regionName : regionData.regionName
                              }
                })
                if ( regionData.regionCode == currentRegionCode ){
                    currentCountryText =  `${toTitleCase(country.countryName)}-${toTitleCase(regionData.regionName)}`;
                }
          })
    })
    return {
      countryOptions,
      currentCountryText
    }
  }
  createOptionListForStandardField(standardList){
    let currentStandardText;
    const { currentStandardCode } = this.props;
    const stdOptions  =  standardList.map((std, idx)=> {
                              if( std.SID == currentStandardCode ){
                                  currentStandardText =  std.standardName;
                              }
                              return {
                                label : std.standardName,
                                value : std.SID,
                                class : 'auto-aligned-options option-group',
                                attribute:{
                                  standardName : std.standardName,
                                  standardCode : std.SID
                                }
                              }

                          });
      return {
        stdOptions,
        currentStandardText
      }
  }
  render() {
    let {
        isStdAdmin,
        isStdSelectionLoading,
        currentCountryCode,
        currentRegionCode,
        standardListByCountry,
        currentStandardCode,
        standardMetadataResponse
        } = this.props;


    const { countryOptions, currentCountryText  }  = this.createOptionListForCountryField(standardMetadataResponse);

    const { stdOptions, currentStandardText }  = this.createOptionListForStandardField(standardListByCountry);

    const isStdSelectorDisabled = stdOptions.length == 0 ;

    const shouldNextBtnBeDisabled = (!currentCountryCode || !currentStandardCode);

    const countrySelectorProps  = {
      defaultText : 'Select Country',
      optionsData : countryOptions,
      currentText : currentCountryText,
      handleOptionChange : this.changeCountry
    }

    const standardSelectorProps  = {
      defaultText : 'Select Standard',
      optionsData : stdOptions,
      currentText : currentStandardText,
      handleOptionChange : this.changeStandard,
      isDisabled : isStdSelectorDisabled
    }

    const btnProps =  {
      isDisabled : shouldNextBtnBeDisabled,
      handleClickEvent : this.moveForward,
      text : 'Next \u003E \u003E'
    };
    const loaderProps = {
        loaderStyle : Styles.loaderStyle
    };

    return (
            <div>
                { !isStdSelectionLoading &&
                  <div >
                    <div style={Styles.standardHeader}>
                        <span>
                          Please select your Region and Standards you are interested in!
                         </span>
                    </div>
                    <div style={Styles.standardsSelection}>
                      <Select {...countrySelectorProps}/>
                      <Select {...standardSelectorProps}/>
                    </div>
                    <div style={Styles.standardQueryTxt}>
                      <span>Don't see your country? <a className='aligned-standard-text' href="mailto:support@ck12.org">Contact Us</a></span>
                    </div>
                    <div style={Styles.btnContainer}>
                      <NextButton {...btnProps} />
                    </div>
                  </div>
                }
                {
                  isStdSelectionLoading &&
                  <Loader {...loaderProps}/>
                }
            </div>
        )
  }

  moveForward() {
    const { action } = this.props;
    action.StdSelectionNextStep();
  }
  changeCountry(e, options){
    const { action } = this.props;
    action.StdSelectionCountryChanged(options);
  }
  changeStandard( e, options ){
    const { action } = this.props;
    action.StdSelectionStandardChanged(options);
  }
}

let mapStateToProps = (state, ownProps)=> {
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  return {
    action: bindActionCreators({
      StdSelectionCompInit,
      StdSelectionNextStep,
      StdSelectionStandardChanged,
      StdSelectionCountryChanged
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(StandardsSelectionContainer)


const Styles = {
  standardHeader :{
    overflowWrap :'normal',
    width: '60%',
    left: '20%',
    height: '100px',
    fontSize: '36px',
    position: 'relative'
  },
  standardsSelection:{
    paddingTop:'80px'
  },
  standardQueryTxt:{
    fontSize : '15px',
    marginTop : '10px'
  },
  btnContainer:{
    marginTop : '45px'
  },
  loaderStyle:{
    'top': '200px',
    'left': '0px'
  }
}
