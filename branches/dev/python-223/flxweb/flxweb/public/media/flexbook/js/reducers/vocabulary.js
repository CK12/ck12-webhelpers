import {CHANGE_VOCABULARY_LANGUAGE} from '../actions/actionTypes';

export const vocabularyLanguage = (state = 'english', action) => {
  if ( action.type === CHANGE_VOCABULARY_LANGUAGE ){
    let {language} = action.payload;
    return language;
  }
  return state;
};
