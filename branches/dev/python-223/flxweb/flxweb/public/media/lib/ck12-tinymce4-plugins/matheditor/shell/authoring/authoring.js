(function outerContainer(){

	function init(){
		initContainer();
		bindEvents();
	}

	function initContainer(){
		var container = {};

		document.getElementById('loader').setAttribute('class','');
		container.API = new ContainerApi();
		window.container = container;
	}

	function bindEvents(){
		var addMathButton = document.getElementById('addMath');
		addMathButton.addEventListener('click',addMath,false);
	}

	function addMath(){

		function cb(data){
			window.parent.mathEditorHelper.parentContainer.API.set(data);
		}
		container.API.get(cb);
	}

	init();
}());

function ContainerApi(){

	var eventsArray = ["onload", "resize"],
		mathEditor = null,
		isEditorLoaded = false;

	function info(){
		return {
			"events": eventsArray,
			"loaded": isEditorLoaded
		};
	}

	function get(cb){
		var obj = null;

		if(mathEditor && mathEditor.API && mathEditor.API.get && typeof mathEditor.API.get === 'function'){
			mathEditor.API.get({"cbk":cb});
		}

		return obj;
	}

	function set(options){
		var success = false,
			loader;
		if(mathEditor && mathEditor.API && mathEditor.API.set && typeof mathEditor.API.set === 'function'){
			//setTimeout(function(){
				success = mathEditor.API.set(options);
				console.log("success");
			//}, 1000);
		}
		if(document){
			loader = document.getElementById('loader');

			loader.setAttribute('class','fade-display');
			setTimeout(function(){
				loader.classList.add('no-display');
			}, 1250);
		}
		return success;
	}

	function notify(options){

		var event = (options && options.event)? options.event: "";

		if(!event){
			return;
		}

		switch(event){
			case "onload":
				onloadHandler(options);
				break;
			case "resize":
				break;
			default:
		}
	}

	function onloadHandler(options){
		var obj = {
			"isEditorLoaded" : isEditorLoaded,
			"event" :	options.event,
			"API" : {
				"get" : get,
				"set" : set,
				"info" : info,
				"notify" : notify
			}
		}

		if(options && options.API){
			mathEditor = (mathEditor)? mathEditor: {};
			mathEditor.API = options.API;
			isEditorLoaded = true;
			window.parent.mathEditorHelper.parentContainer.API.notify(obj);
			//document.getElementById('loader').setAttribute('class','no-display');
		}
		else{
		}
	}

	function resizeHandler(options){
	}

	function setOptions(options){
		options = options;
	}

	function getOptions(){
		return options;
	}

	this.info = info;
	this.get = get;
	this.set = set;
	this.notify = notify;
}