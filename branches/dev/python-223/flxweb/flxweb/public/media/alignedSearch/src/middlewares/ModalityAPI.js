 import {ActionTypes, ActionMethods} from '../actions/';

 const {
 	SelectModality,
 	FetchModality,
 	FetchModalityResponseSuccess,
 	FetchModalityResponseFailure,
  FetchModalityResponseCached
 } = ActionMethods;

 // const queryUrl  = 'https://'+location.hostname+'/flx/get/detail';
 const queryUrl  = 'https://gamma.ck12.org/flx/get/detail';

 let queryTimeout= null;


 const fetchModalityDetails = (store, {payload: modalityId}) => {
  const {modalities} = store.getState();

  const modalityDetails = modalities[modalityId];
  if(modalityDetails){
    if(!modalityDetails.isFetching){
      store.dispatch(FetchModalityResponseCached({modalityId, xhtml : modalityDetails.xhtml}));
    }
    return;
  }
  store.dispatch(FetchModality({modalityId}));

  let request  =  new Request(`${queryUrl}/${modalityId}?format=json`, {
    method : 'GET',
    credentials : 'include'
  });
  fetch(request)
  .then(res=>{
    return res.json();
  }).then(json=>{
    const artifact = json.response.artifact;
    if(artifact && artifact.hasXhtml && artifact.xhtml){
      store.dispatch(FetchModalityResponseSuccess({modalityId, xhtml: artifact.xhtml}));
    }else{
      store.dispatch(FetchModalityResponseFailure({modalityId, error: 'INVALID_FORMAT'}));
    }
  }).catch(e=>{
    store.dispatch(FetchModalityResponseFailure({modalityId, error: 'UNKNOWN_ERROR'}));
  });

} 
export default store =>  next => action => {
  next(action);

  switch ( action.type ){
    case ActionTypes.MODALITY_SELECT :
    fetchModalityDetails(store, action);
    break;    
  }
};