import {ActionTypes, ActionMethods} from '../actions/';

const { StdSelectionAPISuccess, StdSelectionAPIFailure } = ActionMethods;

const stdListUrl =  'https://'+ location.hostname+ '/flx/get/autoStandard/standards?country=all&&includeCountries=true';

const fetchStandardsListDetails =  (store, action)=>{
  let request  =  new Request(stdListUrl, {
    method : 'GET',
    credentials : 'include'
  });

  fetch(request)
      .then(res=>{
        return res.json();
      }).then(json=>{
        if( json.response  ){
          // const standardSet = json.response.standardSet;
          const countries =  json.response.countries;
          const standardSet =  json.response.standards;
          let tempResponse  = {};
          let countryList  =  [...countries];
          for ( let country of countries){
              let tempObj   = {};
              tempObj['countryCode'] =  country.countryCode;
              tempObj['countryName'] = country.countryName;
              tempObj['standards']  = standardSet.filter((val)=> val.countryCode == country.countryCode && (val.region == "unknown" || !val.region)).map(val=>   { val.standardCode = val.SID; return val});
              const regions  =  country.regions;
              let regionList =  [];
              for( let region of regions){
                  // let regionData =  {};
                  let regionData =  {};
                  regionData['region'] = {
                      "regionCode": region,
                      "regionName" : region
                  }
                  regionData['standard']  = standardSet.filter((val)=> val.countryCode == country.countryCode && (val.region == region)).map(val=> { val.standardCode = val.SID ; return val});
                  // if()
                  regionList.push(regionData);
              }
              tempObj['regions'] = regionList;

              tempResponse[country.countryCode] =  tempObj;
          }
          let response  = {
            countryList,
            responseData: tempResponse
          }

          store.dispatch(StdSelectionAPISuccess(response));

        }else{

        }
      }).catch(e=>{
        console.error(e);
        store.dispatch(StdSelectionAPIFailure());
      });
};



export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.STD_SELECTION_COMP_INIT :
    fetchStandardsListDetails( store, action);
    break;
  }

};
