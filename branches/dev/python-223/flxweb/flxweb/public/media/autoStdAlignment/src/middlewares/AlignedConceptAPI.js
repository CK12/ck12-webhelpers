import {ActionTypes, ActionMethods} from '../actions/';

const {
  AutoStandandardSuccess,
  AutoStandandardFailure,
  FetchConceptsForStandardId,
  ConceptsResponseSuccess,
  CacheConceptsResponseSuccess,
  ConceptsResponseFailure,
  ChangeStandardId,
  AddMultipleNodeForExpansion,
  conceptListResponseSuccess,
  conceptListResponseFailure,
  AutoStandandardRequestSent
 } = ActionMethods;


const conceptListUrl =  'https://'+location.hostname+'/media/conceptmap/data/subjects.json';

const standardsInfoUrl = 'https://'+ location.hostname+'/flx/get/autoStandard/standardinfo';


const fetchConceptsByParentNodeId  = ( store, action)=>{
    const parentId =  action.payload.id;
    const hasOpened = action.payload.state;
    const storeRef = store.getState();

    if( hasOpened ){
        const cacheRef =  storeRef['conceptDataResponseCache'];
        if( cacheRef[parentId]){
            const response =  cacheRef[parentId];
            store.dispatch(ConceptsResponseSuccess({conceptDataBySid:response, id:parentId}));
        }else{
           console.error(`can't find cache ref for ${parentId}` )
        }
    }
};

const fetchConceptDetails = ( store, action)=>{
    const storeRef = store.getState();
    const conceptMasterList =  storeRef['conceptMasterList']
    if(Object.keys(conceptMasterList).length >0 ){
        return;
    }
        let request  =  new Request(conceptListUrl, {
          method : 'GET',
        });
        fetch(request)
          .then(res=>{
            return res.json();
          }).then(json=>{
            /** Formulate JSON
             SUB.BRANCH.CODE
              {
                 SUB1 :  {
                    BRNACH1 : [],
                    BRNAHC2 : []
                }
           } */
           let response = {};
           for ( const  key of Object.keys(json)){
                const val = json[key];
                // SCI.BIO.947
                let keyData =  key.split('.');
                let sub =  keyData[0],
                    branch = keyData[1],
                    id    = keyData[2]
                response[sub]  = response[sub] || {};
                response[sub][branch]  = response[sub][branch] || [];
                response[sub][branch].push(val)
           }
              store.dispatch(conceptListResponseSuccess(response))
          }).catch(e=>{
              store.dispatch(conceptListResponseFailure(e))
          });
}

let fetchConceptInfoDetails = ( store, action )=>{
      const storeRef = store.getState();
      const currentStandardCode = storeRef['currentStandardCode'];
      const selectedSubjects  =  storeRef['selectedSubjects'].join(',');

      if( !currentStandardCode) return ;

        store.dispatch(AutoStandandardRequestSent());


      let request  =  new Request(`${standardsInfoUrl}?SID=${currentStandardCode}&&branches=${selectedSubjects}`, {
        method : 'GET',
      });
      fetch(request)
        .then(res=>{
          return res.json();
        }).then(json=>{
        if( json && json.response && json.response.standardsInfo){
            store.dispatch(AutoStandandardSuccess(json.response.standardsInfo));
            let tempRes =  {};
            json.response.standardsInfo.forEach(curr=>{
                  tempRes[curr.standardID] = curr.children;
            })
            Object.keys(tempRes).forEach(val=>{
              store.dispatch(CacheConceptsResponseSuccess({
                  id: val,
                  conceptDataBySid : tempRes[val]
              }))
            })
        }

        }).catch(e=>{
            // store.dispatch(conceptListResponseFailure(e))
        });
}

export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.ALIGNED_COMP_INIT :
    fetchConceptDetails( store, action);
    fetchConceptInfoDetails( store, action);
    break;
  case ActionTypes.ALIGNED_CHANGE_NODE_EXP_STATE :
    fetchConceptsByParentNodeId(store, action);
    break;
  }
};
