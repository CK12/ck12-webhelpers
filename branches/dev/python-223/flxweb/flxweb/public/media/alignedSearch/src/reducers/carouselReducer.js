import {ActionTypes as Actions} from '../actions/';


const currentIndex = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
  case Actions.CAROUSEL_SELECT :
    return action.payload;
    break;
  default:
    return state;
  }
};

const carouselExpanded = (state = true, action) => {
	const type = action.type;
  switch( type ){
  case Actions.CAROUSEL_EXPAND :
    return action.payload;
    break;
  default:
    return state;
  }
}

export default {
	currentIndex,
	carouselExpanded
}