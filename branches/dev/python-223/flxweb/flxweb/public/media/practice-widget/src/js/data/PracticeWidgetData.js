/*import Immutable from 'immutable';*/

/*export const PracticeWidgetData = Immutable.Record({
  css:data.getNormalModeData(),
  practiceUrl : ""
});*/

export let data = {
		getNormalModeData(){
			return {
					modalClass : 'widget-container',
					modalBackClass : "hide",
					modalIframeClass : "widget-iframe",
					widgetHeaderClass : "widget-header",
					closeBtn : "close-btn hide"
				};
		},

		getMaxModeData(){
			return {
					modalClass : 'widget-container modal-box animate-maximize',
					modalBackClass : "modal-box-back",
					modalIframeClass : "widget-iframe modal",
					widgetHeaderClass : "widget-header hide",
					closeBtn : "close-btn"
				};
		},

		/*To verify and change this CSS for min mode.*/
		getMinModeData(){
			/*There is no use of this function currently*/
		}
}

export let PracticeWidgetData = {
  css:data.getNormalModeData()  
};





