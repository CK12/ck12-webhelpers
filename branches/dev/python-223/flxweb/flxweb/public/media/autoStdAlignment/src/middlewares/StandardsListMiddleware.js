

/**
* Middleware listens to changes to country list and figures out
* the standards list to be shown to it
*/

import {
  ActionTypes,
  ActionMethods
} from '../actions/';

const {
    StandardListChanged,
      } = ActionMethods;

const updateStandardsOnCountryChange =  (store, action)=>{
  const storeRef = store.getState();
  const currentCountryCode = storeRef['currentCountryCode'];
  const currentRegionCode  =  storeRef['currentRegionCode'];
  const APIResponse  = storeRef['standardMetadataResponse'];
  const currentCountryDetails  = APIResponse[currentCountryCode]|| {};
  let currentStds  = currentCountryDetails['standards'] || [];
  if( currentRegionCode ){
     currentStds =  [];
    currentCountryDetails.regions.filter( regionDetails=> {
                       return regionDetails.region.regionCode ==  currentRegionCode;
                   }).map(filteredRegion=>{
                      currentStds =  [...currentStds, ...filteredRegion.standard]
                   });
  }
  store.dispatch( StandardListChanged( currentStds));
};

export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.STD_SELECTION_COUNTRY_CHANGED :
    updateStandardsOnCountryChange( store, action);
    break;
  }

};
