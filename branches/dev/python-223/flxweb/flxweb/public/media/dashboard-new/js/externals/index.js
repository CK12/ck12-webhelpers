/* globals $:false */

export function modalityAssignLib(obj){
    window.require(['modalityAssign/modality.assign.lib'], function(modalityAssignLib){
		var _obj = obj.modalityInfo ? obj.modalityInfo : obj;
		if(_obj.collections.length>0 && _obj.collections[0].collectionHandle){
			window.tdCollectionData = {
					conceptCollectionHandle : _obj.collections[0].collectionHandle+"-::-"+_obj.collections[0].conceptCollectionAbsoluteHandle,
		    		collectionCreatorID : _obj.collections[0].collectionCreatorID || 3		
			}
		}
    	modalityAssignLib.init(_obj);
    	if($("#assignClassModal").hasClass("setTop")){
			$("#assignClassModal").removeClass("setTop");	
		}
    });
}
export function changeNavigationUserName(name) {
    if(window.$){
    	var _name = (name.length > 17) ? name.substring(0, 18) + '...' : name;
        $('.js_user_name span:first-child').text(_name);
    }
}
export function setActiveHeader(activeTab){
	let tabElements = document.querySelectorAll('[data-magellan-arrival]'),activeElementAttr ='';
	switch(activeTab){
		case 'Groups':
			activeElementAttr = 'header_groups';
			break;
		case 'Content':
			activeElementAttr = 'header_dashboard';
			break;
	}
	if(tabElements && tabElements.length){
		for(var i=0;i<tabElements.length;i++){
			tabElements[i].classList.length && tabElements[i].classList.remove('active');
			(tabElements[i].getAttribute('data-magellan-arrival') === activeElementAttr ) && tabElements[i].classList.add('active');
		}
	}
}

export default {
    modalityAssignLib,
    changeNavigationUserName,
    setActiveHeader
};
