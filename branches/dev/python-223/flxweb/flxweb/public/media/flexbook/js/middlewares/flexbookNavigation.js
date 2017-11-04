import {setCurrentSection} from '../actions/location';
import {SET_CURRENT_SECTION} from '../actions/actionTypes';

import {
  bookLocationInfoToURL,
  parseBookPath
} from '../utils/utils';

import {triggerSoftReg} from '../utils/requireBridge';

const flexbookNavigationMiddleware = (store) => {

  window.addEventListener('popstate', ()=>{
    let {currentTOCSection} = store.getState();
    let {chapterPos, sectionPos} = parseBookPath(window.location.pathname);
    let newSection = `${chapterPos}.${sectionPos}`;
    if (!chapterPos && !sectionPos){
      newSection = '0.0';
    }
    if (currentTOCSection !== newSection){
      store.dispatch(setCurrentSection(newSection));
    }
  });

  return (next) => (action) => {
    let result = next(action);
    if (action.type === SET_CURRENT_SECTION){
      let {locationInfo} = store.getState();
      store.dispatch({
        type: 'ANNOTATION_RESET'
      });
      triggerSoftReg();
      let {payload:{section:payloadSection}} = action, section='';
      if (payloadSection !== 0.0){ section = payloadSection; }
      if (window.history){
        let newPath = bookLocationInfoToURL({...locationInfo, section});
        if (newPath !== window.location.pathname){
          history.pushState({},'',newPath);
          window.scrollTo(0,0);
        }
      }
    }
    return result;
  };
};

export default flexbookNavigationMiddleware;
