import {ActionTypes, ActionMethods} from '../actions/';

const {
	SelectModality,
	SelectCarouselIndex
} = ActionMethods;

const fetchSelectedIndex = ( store , action )=>{
	var {currentIndex, currentQuery, modalitiesByQuery} = store.getState();
	const queryDetails = modalitiesByQuery[currentQuery];

	if(!currentIndex || !currentQuery || !queryDetails || queryDetails.isFetching){
		return;
	}
	const modalityId = queryDetails.items[currentIndex-1];

	store.dispatch(SelectModality(modalityId));
}

const loadCarousel =(store, action) => {
	store.dispatch(SelectCarouselIndex(1));
}

const showCarouselError = (store, action) => {

}

const showModality = (store, action) => {

}


export default store =>  next => action => {
	next(action);

	switch ( action.type ){
		case ActionTypes.QUERY_FETCH_CACHED:
		case ActionTypes.QUERY_FETCH_SUCCESS:
			loadCarousel(store, action);
			break;
		case ActionTypes.QUERY_FETCH_FAILURE:
			showCarouselError(store, action);
			break;
		case ActionTypes.CAROUSEL_SELECT :
	    // Wait for sometime lets say 2 seconds before dispatching an event
	    fetchSelectedIndex(store, action);
	    break;
	  case ActionTypes.MODALITY_FETCH_CACHED:
	  case ActionTypes.MODALITY_FETCH_SUCCESS:
	    showModality(store, action);
	    break;
	  case ActionTypes.MODALITY_FETCH_FAILURE:
	    break;
	  }
	};