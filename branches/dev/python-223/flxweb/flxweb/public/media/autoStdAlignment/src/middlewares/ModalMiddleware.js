import {ActionTypes, ActionMethods} from '../actions/';

const { ChangeConceptListForSubjectCode, addConceptResponseFailure, addConceptResponseSuccess } = ActionMethods;

const addConceptDetailsUrl = 'https://'+ location.hostname+ '/flx/add/autoStandard/concept';

const calculateSelectedConceptByBranchCode =  (store, action)=>{
      const storeRef =  store.getState();
      const subjectCode  = storeRef['subjectCodeForAddConceptModal'];
      const branchCode  =  storeRef['branchCodeForAddConceptModal'];
      const conceptMasterList =  storeRef['conceptMasterList'];
      let response   = [];
      if(subjectCode){
            if( !branchCode){
                response =  Object.values(conceptMasterList[subjectCode]).reduce((agg, currVal)=>{
                      return [...agg, ...currVal];
                }, []);
            }else{
              const updateBranchCode =  branchCode.replace(new RegExp(subjectCode+'.'),'');
              response  = conceptMasterList[subjectCode][updateBranchCode]||[];
            }
            store.dispatch(ChangeConceptListForSubjectCode( response ))
      }

};

const addConceptDataByEID = ( store, action)=>{
  const storeRef = store.getState();
  const encodedID = action.payload;
  const body =  new FormData();
  //https://developer.mozilla.org/en-US/docs/Web/API/FormData
  // Fetch Polyfill supports only append for FormData
  //https://github.github.io/fetch/
  body.append('StandardID', storeRef['sIdForAddConceptModal']);
  body.append('encodedID', encodedID);

  let request  =  new Request(addConceptDetailsUrl, {
    method : 'POST',
    credentials : 'include',
    body
  });

  fetch(request)
      .then(res=>{
        return res.json();
      }).then(json=>{
        let response  = json.response;
        if( response && response.addStandard && response.addStandard.concept ){
          store.dispatch(addConceptResponseSuccess({
            sId : storeRef['sIdForAddConceptModal'],
            conceptData : response.addStandard.concept
          }));
        }else{
          throw new Error('json format issue')
        }

      }).catch(e=>{
        console.error(e);
        store.dispatch(addConceptResponseFailure());
      });
}

export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.MODAL_CHANGE_SUBJECT :
    calculateSelectedConceptByBranchCode( store, action);
    break;
  case ActionTypes.MODAL_CONCEPT_SELECTED:
    addConceptDataByEID(store, action);
    break;
  }

};
