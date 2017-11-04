import {
  	GENERATE_PDF_START,
  	GENERATE_PDF_SUCCESS,
  	GENERATE_PDF_ERROR
} from '../actions/actionTypes';

//TODO: take care of the pending service.
export const generatePDF = (state={}, action) => {
	if(action.type === GENERATE_PDF_START){
    return {loading: true};
  }
  else if(action.type === GENERATE_PDF_SUCCESS){
  	let dataJSON = JSON.parse(action.payload);
    let {status, userdata} = dataJSON;
    return {status, userdata};
  }
  return state;
};
