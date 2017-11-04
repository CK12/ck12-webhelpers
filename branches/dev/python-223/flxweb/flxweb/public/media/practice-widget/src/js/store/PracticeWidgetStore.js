/*import Immutable from 'immutable';*/
import {EventEmitter} from 'events';
/*import {ReduceStore} from 'flux/utils';*/
import WidgetActionTypes from '../actions/PracticeWidgetActionTypes';
import WidgetDispatcher from '../dispatcher/PracticeWidgetDispatcher';
import {PracticeWidgetData as WidgetData} from '../data/PracticeWidgetData';

class PracticeWidgetStore extends EventEmitter {
  constructor() {
    /*super(WidgetDispatcher);*/
	  super();
  }

  /*getInitialState() {
    return Immutable.OrderedMap();
  }*/
  
  getAllData(){
	  return WidgetData;
  }
  
  handleActions(action){
    /*Since we don't need to make any change on data for now*/	  
    switch (action.type) {
      case WidgetActionTypes.NORMAL_MODE:
    	  	WidgetData.css = action.data;  
    	  	this.emit("change");
    	  	break;
    	  	
      case WidgetActionTypes.MAX_MODE:
    	  	WidgetData.css = action.data; 
    	  	this.emit("change");
    	  	break;
    	  	
      case WidgetActionTypes.MIN_MODE:
    	  	WidgetData.css = action.data;   
    	  	this.emit("change");
    	  	break;    	
      		
      default:
        return state;
    }
  }
  
}

const WidgetStore = new PracticeWidgetStore();

WidgetDispatcher.register(WidgetStore.handleActions.bind(WidgetStore));

export default WidgetStore;