import * as ActionTypes from './actionTypes.js';


export const setLocation = (location) => {
  return {
    type: ActionTypes.SET_LOCATION,
    payload: { location }
  };
};

export const setCurrentSection = (section) => {
  if (!section){ section = '0.0';}
  return {
    type: ActionTypes.SET_CURRENT_SECTION,
    payload: {section}
  };
};
