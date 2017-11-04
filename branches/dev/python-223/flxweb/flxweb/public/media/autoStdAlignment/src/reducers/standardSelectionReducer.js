import {ActionTypes as Actions} from '../actions/';

/**
* Reducer Structure
*
{
  isStdSelectionLoading : Boolean ,
  currentCountryCode : String ,
  currentCountryName : String,
  currentRegionCode : String,
  currentRegionName : String,
  standardListByCountry : Array,
  currentStandardCode : String,
  currentStandardName : String,
  currentStandardDescription : String,
  standardMetadataResponse : object
}
*
*
*/


const isStdSelectionLoading = ( state = true, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_STD_BY_COUNTRY_RESPONSE_SUCCESS :
  case Actions.STD_SELECTION_STD_BY_COUNTRY_RESPONSE_FAILURE :
    return false;
    break;
  default:
    return state;
  }
};

const standardListByCountry  = ( state = [], action)=>{
  const type = action.type;

  switch( type ){
    case Actions.STD_SELECTION_STD_LIST_CHANGED:
      return action.payload
      break;
    default:
      return state;
  }

};

const currentCountryCode = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return action.payload.countryCode;
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_COUNTRY:
     return '';
     break;
  default:
    return state;
  }
};

const currentCountryName = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return action.payload.countryName || '';
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_COUNTRY:
     return '';
     break;
  default:
    return state;
  }
};

const currentRegionCode = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return action.payload.regionCode || '';
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_REGION:
     return '';
     break;
  default:
    return state;
  }
};

const currentRegionName = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return action.payload.regionName || '';
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_REGION:
     return '';
     break;
  default:
    return state;
  }
};


const currentStandardCode = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_STD_CHANGED :
    return action.payload.standardCode;
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return '';
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_STANDARD:
     return '';
     break;
  default:
    return state;
  }
};

const currentStandardName = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_STD_CHANGED :
    return action.payload.standardName;
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return '';
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_STANDARD:
     return '';
     break;
  default:
    return state;
  }
};

const currentStandardDescription = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_STD_CHANGED :
    return action.payload.standardName; // TODO
  case Actions.STD_SELECTION_COUNTRY_CHANGED :
    return '';
    break;
  case Actions.STD_SELECTION_CLEAR_SELECTED_STANDARD:
     return '';
     break;
  default:
    return state;
  }
};

const standardMetadataResponse = ( state = {}, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.STD_SELECTION_STD_BY_COUNTRY_RESPONSE_SUCCESS :
    return action.payload.responseData;
    break;
  default:
    return state;
  }
};


export default {
  isStdSelectionLoading,
  standardListByCountry,
  currentCountryCode,
  currentCountryName,
  currentRegionCode,
  currentRegionName,
  currentStandardCode,
  currentStandardName,
  currentStandardDescription,
  standardMetadataResponse,
};
