import queryReducer from './queryReducer';
import modalitiesReducer from './modalitiesReducer';
import carouselReducer from './carouselReducer';

export default {
  ...queryReducer,
  ...modalitiesReducer,
  ...carouselReducer
};
