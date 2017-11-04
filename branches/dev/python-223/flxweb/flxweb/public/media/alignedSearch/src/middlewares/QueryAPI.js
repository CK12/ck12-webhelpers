 import {ActionTypes, ActionMethods} from '../actions/';

 const {
 	FetchQuery,
 	FetchQueryResponseSuccess,
 	FetchQueryResponseFailure,
 	FetchQueryResponseCached
 } = ActionMethods;

 // const queryUrl  = 'https://'+location.hostname+'/flx/askck12/get/modality';
 const queryUrl  = 'https://gamma.ck12.org/flx/askck12/get/modality';

 let queryTimeout= null;

 const fetchQueryResults = ( store , action )=>{
 	var {currentQuery, modalitiesByQuery} = store.getState();

 	if(!currentQuery){ 
 		return;
 	}
 	const queryDetails = modalitiesByQuery[currentQuery];
 	if(queryDetails){
 		if(!queryDetails.isFetching){
 			store.dispatch(FetchQueryResponseCached({currentQuery, items : queryDetails.items}));
 		}
 		return;
 	}
 	store.dispatch(FetchQuery({currentQuery}));

 	const body = JSON.stringify({
 		sentence: currentQuery
 	});
 	let request  =  new Request(queryUrl, {
 		method : 'POST',
 		credentials : 'include',
 		body
 	});
 	fetch(request)
 	.then(res=>{
 		return res.json();
 	}).then(json=>{
 		let response  = json.response;
 		if( response && response.modalities && Array.isArray(response.modalities) ){
 			store.dispatch(FetchQueryResponseSuccess({currentQuery, items: response.modalities}));
 		}else{
 			store.dispatch(FetchQueryResponseFailure({currentQuery, error: 'INVALID_FORMAT'}));
 		}
 	}).catch(e=>{
 		store.dispatch(FetchQueryResponseFailure({currentQuery, error: 'UNKNOWN_ERROR'}));
 	});
 };

 export default store =>  next => action => {
 	next(action);
 	if(action.type === ActionTypes.QUERY_SELECT){
 		fetchQueryResults( store, action);
 	}
 };