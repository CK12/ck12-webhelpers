/**
* Middleware listens to changes to country list and figures out
* the standards list to be shown to it
*/

import {
  ActionTypes
} from '../actions/';

const createCSV =  (store, action)=>{
  const storeRef = store.getState();
  const selectedSIdsList = storeRef['selectedSIdsList'];  // array of SIDs selected
  const selectedConceptDetails  =  storeRef['selectedConceptDetails']; // Object with keys as sId and array with concept encodedIds as
  const conceptDataResponseCache =  storeRef['conceptDataResponseCache']; //
  let sidConceptList = [];
   for( let curriculmData of Object.values(conceptDataResponseCache)){
     sidConceptList =  [...sidConceptList, ...curriculmData];
   }

   let csvContent = `,StandardID,Concept Name,Concept Handle,Preview Image Url,Concept Url\n`;

  //  let selectedSids =  Object.keys( selectedConceptDetails).filter(sid=> selectedConceptDetails[sid].length >0);
   for( let sidNode of sidConceptList){
      if( selectedSIdsList.indexOf( sidNode.standardID) != -1){
            const selectedConcepts =  selectedConceptDetails[sidNode.standardID];
            for( let concept of sidNode.relatedConcepts){
                if( selectedConcepts.indexOf(concept.eid) != -1){
                    csvContent += `,${sidNode.standardID},${concept.name},${concept.handle},${concept.previewImageUrl},${window.location.origin+'/'+concept.relativeConceptUrl}\n`;
                }
            }
      }
   }
   //https://stackoverflow.com/questions/27257336/downloading-a-dynamic-csv-in-internet-explorer
   // IE specific check
   if (navigator.msSaveBlob) { // IE 10+

      let blob =  new Blob([csvContent], { type : 'text/csv;charset=utf-8;'});
      navigator.msSaveBlob(blob, "csvname.csv")

    } else {
      
      let csvPrependString =  "data:text/csv;charset=utf-8,";
      csvContent  = `${csvPrependString}${csvContent}`;
      let encodedString  = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedString);
      link.setAttribute("download", "ck-12 Standards.csv");
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);
   }
};

export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.ALIGNED_GENERATE_CSV :
    createCSV( store, action);
    break;
  }

};
