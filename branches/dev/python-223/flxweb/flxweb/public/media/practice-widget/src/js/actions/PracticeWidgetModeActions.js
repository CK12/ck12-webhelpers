import WidgetActionTypes from './PracticeWidgetActionTypes';
import WidgetDispatcher from '../dispatcher/PracticeWidgetDispatcher';
import {data as WidgetData} from '../data/PracticeWidgetData';

const Actions = {
  /*All obj as parameters are optional for now*/
		
  minMode(obj) {
	WidgetDispatcher.dispatch({
      type: WidgetActionTypes.MIN_MODE,
      data: WidgetData.getMinModeData()
    });
  },
  normalMode(obj) {
	WidgetDispatcher.dispatch({
      type: WidgetActionTypes.NORMAL_MODE,
      data:WidgetData.getNormalModeData()
    });
  },
  maxMode(obj) {
	WidgetDispatcher.dispatch({
      type: WidgetActionTypes.MAX_MODE,
      data:WidgetData.getMaxModeData()
    });
  },
};

export default Actions;