import homeReducer from './homeReducer';
import standardSelectionReducer from './standardSelectionReducer';
import subjectsSelectionReducer from './subjectsSelectionReducer';
import alignedConceptsReducers from './alignedConceptsReducers';
import modalReducers from './modalReducers';

export default {
  ...homeReducer,
  ...standardSelectionReducer,
  ...subjectsSelectionReducer,
  ...alignedConceptsReducers,
  ...modalReducers
};
