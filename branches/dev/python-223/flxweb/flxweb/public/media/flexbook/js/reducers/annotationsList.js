import{
  ANNOTATIONS_LOADED,
  ANNOTATION_ADDED,
  ANNOTATION_REMOVED,
  ANNOTATION_UPDATED,
  ANNOTATION_LOADMORE,
  ANNOTATION_RESET,
  ANNOTATION_SET_LOADED
}from '../actions/actionTypes';
export const annotationList = (state = {loaded: false, pageNum: 0, annotations: []}, action) => {
  if (action.type === ANNOTATIONS_LOADED){
    return {
      loaded: true,
      pageNum: 1,
      annotations: action.annotations
    };
  }else if(action.type === ANNOTATION_ADDED){
    return {
      ...state,
      annotations: [
        ...state.annotations,
        action.annotation
      ]
    };
  }else if(action.type === ANNOTATION_REMOVED){
    return {
      ...state,
      annotations: state.annotations.filter(annotation => annotation.id !== action.annotation.id)
    };
  }else if(action.type === ANNOTATION_UPDATED){
    return {
      ...state,
      annotations: state.annotations.map(annotation =>{
        if(annotation.id === action.annotation.id){
          return action.annotation;
        }
        return annotation;
      })
    };
  }else if(action.type === ANNOTATION_LOADMORE){
    return {
      ...state,
      pageNum: ++state.pageNum
    };
  }else if(action.type === ANNOTATION_RESET){
    return {
      ...state,
      loaded: false,
      annotations: []
    };
  }else if(action.type === ANNOTATION_SET_LOADED){
    return {
      ...state,
      loaded: true
    };
  }
  return state;
};
