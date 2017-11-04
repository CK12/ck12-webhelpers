/**
* Wrapper on the Events class to create a signleton instance to be used
* for soft Registration as a pub-sub module.
*/
define ( [
	'backbone',
	'underscore',
	], function(Backbone, _){

	var RegEvents =  function (){}; //noop

	if(! RegEvents.instance){
		RegEvents.instance = _.extend({}, Backbone.Events);
	}
	return RegEvents.instance;	

})