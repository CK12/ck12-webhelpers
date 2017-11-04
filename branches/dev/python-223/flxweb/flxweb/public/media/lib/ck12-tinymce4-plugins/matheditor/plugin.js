/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint unused:false  */
/*global tinymce:true $:false tinyMCE:false*/

'use strict';

/**
 * mathEditor plugin to generate math and add back to TinyMCE.
 */
function tinyMCEMathEditor(editor, url) {
	//var url = url;
	function TinyMCEAdapter(editor){

		if(editor.settings.ck12_plugins_url){
            url = editor.settings.ck12_plugins_url + 'matheditor';
        }
		var pluginPath = url + '/shell/authoring/authoring.htm',
			editOptions = null,
			editedElementId = null,
			fileref,
			link,
			prevSpan = null;
			window.mathEditorHelper = {};

		//editor.settings.valid_elements='*[*]';

		function init(){
			updateTinyMCELayout();
			bindEvents();
			initContainer();
		}

		function initContainer(){
			var parentContainer = {};

			parentContainer.API = new parentContainerApi({
				"callback": {
					"get": function (){
						//TBD
					},
					"set": addCallback
				}
			});
			window.mathEditorHelper.parentContainer = parentContainer;
		}

		function bindEvents(){
			editor.on('click', function(e){
				var $eTargetParentMath = $(e.target).closest('span.x-ck12-mathEditor'),
					oldBM = $(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]');

				tinyMCE.activeEditor.fire('inactive', { button: 'matheditor' });

				if(oldBM.length > 0){
					oldBM.remove();
				}
				if($eTargetParentMath.length !== 0){
					setTimeout(function(){
						if($eTargetParentMath.hasClass('doubleClick')){
							$eTargetParentMath.removeClass('doubleClick');
						}
						else if($eTargetParentMath.hasClass('forSingleClick')){
							$eTargetParentMath.removeClass('forSingleClick');
						}
						else {
							/*if($eTargetParentMath[0].getAttribute('data-mathmethod') !== 'block' && $eTargetParentMath[0].previousSibling != null && $eTargetParentMath[0].previousSibling.nodeValue != null && $eTargetParentMath[0].previousSibling.nodeValue.length === 0){
								$eTargetParentMath.before('&nbsp;');
							}
							if($eTargetParentMath[0].nextSibling == null || $eTargetParentMath[0].nextSibling.nodeValue == null || $eTargetParentMath[0].nextSibling.nodeValue.length == 0){
								$eTargetParentMath.after('&nbsp;');
							}*/
							tinyMCE.activeEditor.fire('active', {button: 'matheditor'})
							$eTargetParentMath.addClass('selectedElement');
							tinyMCE.activeEditor.selection.select($eTargetParentMath[0]);
						}
			        },1000);
				}
			});

			editor.on('dblclick', function(e){
				var currentElement = (e.target === undefined ? e : e.target),
					currentElementParentMath = ((currentElement.hasAttribute("class") && currentElement.className.match('x-ck12-mathEditor')) ? $(currentElement):$(currentElement).closest('span.x-ck12-mathEditor')),
					tex,
					edithtml,
					mathType,
					mathClass,
					variable,
					decode,
					text;

				editor.fire('inactive', { button: 'matheditor'});
				if(e.target){
					currentElementParentMath.addClass('doubleClick forSingleClick');
				}
				if(currentElementParentMath.length != 0){
					tinymce.activeEditor.selection.collapse();
					tinymce.activeEditor.selection.select(currentElementParentMath[0]);
					tex = decodeURIComponent(currentElementParentMath[0].getAttribute('data-tex'));
					if(tex.match('bmatrix') && !tex.match(' & ')){
						edithtml = '';
						tex = tex.replace('&',' & ');
					}
					else {
						edithtml = currentElementParentMath[0].getAttribute('data-edithtml');
					}
					editedElementId = currentElementParentMath[0].id;
					variable = currentElementParentMath[0].getAttribute('variable');
					mathType = currentElementParentMath[0].getAttribute('mathMethod');
					if(!mathType){
						mathType = currentElementParentMath[0].getAttribute('data-mathmethod');
					}
					mathClass = currentElementParentMath[0].getAttribute('data-math-class');

					editOptions = {
							'tex' : tex,
							'edithtml' : edithtml,
							'variable' : variable,
							'isOldEditor' : false,
							'mathType' : mathType,
							'mathClass' : mathClass
					};
					window.mathEditorHelper.editOptions = editOptions;
					window.mathEditorHelper.editedElementId = editedElementId;
					window.mathEditorHelper.editMode = true;
					invokeMathEditor(editOptions);
				}
				else if($(currentElement).hasClass("x-ck12-math") || $(currentElement).hasClass("x-ck12-hwpmath") || $(currentElement).hasClass("x-ck12-block-math")){
					tex = $(currentElement).attr("src").split("/");

					for(var i = 0; i<tex.length; i++){
					    if(tex[i] == "alignat" || tex[i] == "inline" || tex[i] == "block"){
					    	decode = tex.slice(i+1).join("/");
					        text= decodeURIComponent(decode);
					        mathType = tex[i];
					        mathClass = $(currentElement).attr("class");
					    }
					}
					editOptions = {
							'tex' : text,
							'edithtml' : '',
							'variable' : '',
							'isOldEditor' : true,
							'mathType': mathType,
							'mathClass' : mathClass
					};
					window.mathEditorHelper.editOptions = editOptions;
					window.mathEditorHelper.currentElement = currentElement;
					window.mathEditorHelper.editMode = true;
					if(tinymce.isIE){
						editor.selection.getBookmark();
					}
					invokeMathEditor(editOptions);
				}
			});

			editor.on('mousedown', function(e){
				var currentElement = e.target,
				currentElementParentMath = ((currentElement.hasAttribute("class") && currentElement.className.match('x-ck12-mathEditor')) ? $(currentElement):$(currentElement).closest('span.x-ck12-mathEditor'));
				editor.fire('inactive', { button: 'matheditor' });

				$(editor.dom.select('span.x-ck12-mathEditor')).removeClass('selectedElement showContextMenu forSingleClick doubleClick');
				if(e.which === 3 && currentElementParentMath.length !== 0){
					currentElementParentMath.addClass('showContextMenu');
				}
		      });


            var contextMenu = {
                postRender: function(ed, col) {
                    var ctrl = this;

                    function handleDisable() {
                        var dom = ed.dom,
                            mathContextMenu = dom.select('span.x-ck12-mathEditor.showContextMenu'),
                            disabledState = false,
                            isCollapsed;
                        if (col) {
                            isCollapsed = editor.selection.isCollapsed();
                        }

                        if (mathContextMenu.length > 0) {
                            disabledState = isCollapsed === 'boolean' ? isCollapsed : true;
                            dom.addClass(mathContextMenu[0], 'selectedElement');
                        }

                        ctrl.disabled(!disabledState);
                        ctrl.visible(disabledState);
                        if (disabledState) {
                            editor.fire('contextmenu:override', {
                                enable: ['matheditor']
                            });
                        }
                    }

                    function bindListener() {
                        ed.on('contextmenu:postrender', handleDisable);
                    }

                    if (ed.initialized) {
                        bindListener();
                    } else {
                        ed.on('init', bindListener);
                    }
                }
            };
            editor.on('init', function() {
                if (editor && (editor.plugins.contextmenu || editor.plugins.ck12contextmenu)) {

                    editor.addMenuItem('mathEditorSelectCM', {
                        text: 'Select',
                        context: 'insert',
                        cmd: 'mathEditorSelect',
                        onPostRender: function () {
                            contextMenu.postRender.call(this, editor);
                        },
                        ui: true
                    });

                    editor.addMenuItem('mathEditorEditCM', {
                        text: 'Edit',
                        context: 'insert',
                        cmd: 'mathEditorEdit',
                        onPostRender: function () {
                            contextMenu.postRender.call(this, editor);
                        },
                        ui: true
                    });

                    editor.addMenuItem('mathEditorCopyCM', {
                        text: 'Copy equation',
                        context: 'insert',
                        cmd: 'Copy',
                        onPostRender: function () {
                            contextMenu.postRender.call(this, editor, true);
                        },
                        ui: true
                    });

                }
            });

            editor.addCommand('mathEditorSelect', function() {
                editor.fire('active', {
                    button: 'matheditor'
                });

                var selectedElement = editor.dom.select('span.x-ck12-mathEditor.selectedElement');
                if (selectedElement[0].getAttribute('data-mathmethod') !== 'block' && selectedElement[0].previousSibling != null && selectedElement[0].previousSibling.nodeValue != null && selectedElement[0].previousSibling.nodeValue.length === 0) {
                    $(selectedElement).before('&nbsp;');
                }
                if (selectedElement[0].nextSibling === null || selectedElement[0].nextSibling.nodeValue === null || selectedElement[0].nextSibling.nodeValue.length === 0) {
                    $(selectedElement).after('&nbsp;');
                }
                setTimeout(function() {
                    editor.selection.select(selectedElement[0]);
                    editor.focus();
                }, 500);
            });

            editor.addCommand('mathEditorEdit', function() {
                var selectedElement = editor.dom.select('span.x-ck12-mathEditor.selectedElement');
                tinymce.activeEditor.dom.fire(selectedElement[0], 'dblclick');
                $(selectedElement).removeClass('selectedElement forSingleClick doubleClick');
            });

			// editor.on('keydown', function(e){
			// 	tinyMCE.activeEditor.controlManager.setActive('matheditor', false);
			// });

			if(!((navigator.userAgent.toLowerCase().indexOf('firefox')) === -1)){
				editor.on('keydown', function(e) {
					var sc = editor.selection.getStart(),
						ec = editor.selection.getEnd(),
						obj = [],
						elementToDelete = null,
						sc1 = null,
						ec1;

					sc1 = editor.dom.getPrev(editor.selection.getStart(), function(n) {
						return editor.dom.hasClass(n, 'x-ck12-mathEditor');
					});
					obj.push(sc);
					obj.push(ec);
					if(e.keyCode === 8){
						if(sc.className.split(/\s+/)[0] === 'x-ck12-mathEditor'){
							tinymce.activeEditor.dom.remove(sc.id);
							return ;
						}
						else if(ec.className.split(/\s+/)[0] === 'x-ck12-mathEditor'){
							tinymce.activeEditor.dom.remove(ec.id);
							return ;
						}

						if(sc1 !== null){
							tinymce.activeEditor.dom.remove(sc1.id);
							return ;
						}

						for(var i=0;i<obj.length;i++){
							var currentElement = obj[i];
							while(currentElement.parentNode){
								if(currentElement.className.split(/\s+/)[0] === 'x-ck12-mathEditor'){
									elementToDelete = currentElement.id;
									break;
								}
								else{
									currentElement = currentElement.parentNode;
								}
							};
							if(elementToDelete !== null){
								tinymce.activeEditor.dom.remove(sc.id);
								break;
							}
						}
					}
			      });
			}
		}

		function addCallback(data){
			var ed = tinyMCE.activeEditor,
				endId,
				el,
				emptySpan,
				editorHelper = window.mathEditorHelper,
				prevSpan;
			if(data && editorHelper.editMode && editorHelper.editOptions){
				if(editorHelper.editedElementId !== undefined && editorHelper.editedElementId !== null){
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).innerHTML = data.wrapHtml.innerHTML;
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).setAttribute("data-tex",encodeURIComponent(data.tex));
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).setAttribute("data-edithtml",data.editHtml);
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).setAttribute("data-mathmethod",data.mathMethod);
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).setAttribute("data-math-class",data.mathClass);
					/*tinymce.activeEditor.dom.get(editorHelper.editedElementId).setAttribute("data-tex-mathjax",data.data_tex_mathjax);*/
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).removeAttribute('data-tex-mathjax');
					tinymce.activeEditor.dom.get(editorHelper.editedElementId).removeAttribute('mathmethod');
					/*tinymce.activeEditor.dom.get(editorHelper.editedElementId).setAttribute("data-style",data.data_style);*/
					updateIds(editorHelper.editedElementId);
				}
				else if(editorHelper.currentElement !== undefined && editorHelper.currentElement !== null){
					endId = tinymce.DOM.uniqueId();
					while (tinymce.activeEditor.dom.get(endId) != null) {
					    endId = tinymce.DOM.uniqueId();
					}
					prevSpan = endId;
					el = tinyMCE.activeEditor.dom.create('span', {id : endId, 'class' : 'x-ck12-mathEditor'}, '');
					//tinyMCE.activeEditor.dom.remove(editorHelper.currentElement);
					tinyMCE.activeEditor.dom.replace(el, editorHelper.currentElement, true);
					/*if($(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').length > 0){
						$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').replaceWith(el);
					}
					else {
						tinyMCE.activeEditor.selection.setNode(el);
					}*/
					tinymce.activeEditor.selection.collapse(true);
					tinymce.activeEditor.dom.get(prevSpan).innerHTML = data.wrapHtml.innerHTML;
					tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-tex",encodeURIComponent(data.tex));
					tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-edithtml",data.editHtml);
					tinymce.activeEditor.dom.get(prevSpan).setAttribute("contenteditable","false");
					tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-mathmethod",data.mathMethod);
					tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-math-class",data.mathClass);
					/*tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-tex-mathjax",data.data_tex_mathjax);*/
					/*tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-style",data.data_style);*/
					//tinymce.activeEditor.selection.collapse(true);
					updateIds(prevSpan);
				}
				data = null;
				editorHelper.editOptions = null;
				editorHelper.editedElementId = null;
				editorHelper.currentElement = null;
				editorHelper.editMode = false;
        	}

			if(data){
				ed.focus();
				endId = tinymce.DOM.uniqueId();
				while (tinymce.activeEditor.dom.get(endId) != null) {
				    endId = tinymce.DOM.uniqueId();
				}
				prevSpan = endId;
				el = tinyMCE.activeEditor.dom.create('span', {id : endId, 'class' : 'x-ck12-mathEditor'}, '');
				emptySpan = tinyMCE.activeEditor.dom.create('span', '');
				if($(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').length > 0){
					$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').before(emptySpan);
					$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').before(el);
				}
				else {
					tinyMCE.activeEditor.selection.setNode(el);
				}
				tinymce.activeEditor.dom.get(prevSpan).innerHTML = data.wrapHtml.innerHTML;
				tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-tex",encodeURIComponent(data.tex));
				tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-edithtml",data.editHtml);
				tinymce.activeEditor.dom.get(prevSpan).setAttribute("contenteditable","false");
				tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-mathmethod",data.mathMethod);
				tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-math-class",data.mathClass);
				/*tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-tex-mathjax",data.data_tex_mathjax);*/
				/*tinymce.activeEditor.dom.get(prevSpan).setAttribute("data-style",data.data_style);*/
				/*if(tinymce.activeEditor.dom.get(prevSpan).previousSibling===null && data.mathMethod != "block"){
					$(tinymce.activeEditor.dom.get(prevSpan)).before("&nbsp;");
				}*/
				$(tinymce.activeEditor.dom.get(prevSpan)).after("&nbsp;");
				updateIds(prevSpan);
				data = null;
			}
			$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').remove();
			tinyMCE.EditorManager.activeEditor.windowManager.close();
			tinyMCE.activeEditor.execCommand("mceAutoResize");
		}
			function updateIds(id){
			var mathJaxSpan = [];
			mathJaxSpan = $(tinyMCE.activeEditor.dom.get(id)).find("span[id^='MathJax']");
			$.each(mathJaxSpan, function(i,v){
				$(this).attr('id', id+"_"+$(this).attr('id'));
			});

		}

		function invokeMathEditor(options){
			var options = (options === undefined) ? {} : options,
				variable = [];

			if("undefined" !== typeof ae){          //Check for assessment flow
				variable = ae.controllers.qb.getVariableData();
			}
			options.variable = variable;
				loadMathEditor(function(options){
					window.mathEditorHelper.parentContainer.API.get(options);
				},options);
		}

		function loadMathEditor(callback,options){
			var buttons = null,
			timer = null,
			editorLoaded = false,
			timeout = 40,
			count = 1;
			$('#tinymceContentHelper').html('');
			editor.windowManager.open({
				file: pluginPath,
				title: '',
				width: 900,
				height: (options.edithtml === '' ||
                        options.isOldEditor === true ||
                        (options.edithtml && options.edithtml.indexOf('paste-option') !== -1) ||
                        // Padding adds an additional 50px
                        window.innerHeight < 640) ? 470 : 640,
				buttons: buttons,
				inline: 1
			});
			timer = setInterval(function(){
				try{
					if(editorLoaded){
						callback(options);
					}
					if(!editorLoaded && count <= timeout){
						editorLoaded = window.mathEditorHelper.parentContainer.API.info().loaded;
						count++;
					}
					else{
						window.mathEditorHelper.parentContainer.API.resizeHandler();
						clearInterval(timer);
					}
				}
				catch(e){
					// If matheditor window closes before it could load completely.
				}
			},1000);
		}


		function updateTinyMCELayout(){
			// Add a button that opens a window
			editor.addButton('matheditor', {
                title: 'Math Editor',
                image: url + '/img/icon_math_editor.gif',
				onclick: function() {
					tinymce.activeEditor = editor;
					editor.selection.collapse();
					window.mathEditorHelper.editMode = false;
					var selectedElement = tinyMCE.activeEditor.dom.select('span.x-ck12-mathEditor.selectedElement');
					if(selectedElement.length != 0){
						tinymce.activeEditor.dom.fire(selectedElement[0], 'dblclick');
	                	$(selectedElement).removeClass('selectedElement');
					}
					else {
						/*if(tinymce.isIE){
							var oldBM = $(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]');
							if(oldBM.length > 0){
								oldBM.remove();
							}
							tinymce.activeEditor.focus();
							editor.selection.getBookmark();
						}*/
						$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').remove();
						editor.selection.getBookmark();
						editOptions = {
								"tex" : "newEquation",
								"mathType" : editor.settings.default_math_type
						};
						invokeMathEditor(editOptions);
					}
				}
			});
		}
		init();
	}

	function parentContainerApi(options){

		var eventsArray = ["onload", "resize"],
			mathEditorParent = null,
			isEditorLoaded = false,
			callback = (options && options.callback)? options.callback  : null;

		function info(){
			return {
				"events": eventsArray,
				"loaded": isEditorLoaded
			};
		}

		function set(options){
			if(callback && callback.set && typeof callback.set === "function"){
				callback.set(options);
			}
		}

		function get(options){
			var success = false;
			if(mathEditorParent && mathEditorParent.API && mathEditorParent.API.set && typeof mathEditorParent.API.set === 'function'){
				success = mathEditorParent.API.set(options);
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

			if(options && options.API){
				mathEditorParent = (mathEditorParent)? mathEditorParent: {};
				mathEditorParent.API = options.API;
				isEditorLoaded = true;
			}
		}

		function resizeHandler(){
			isEditorLoaded = false;
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
		this.resizeHandler = resizeHandler;
	}

	var mathAdopter = new TinyMCEAdapter(editor);
}
	//Comment line below to disable math editor plugin from tinyMCE
	tinymce.PluginManager.add('matheditor',tinyMCEMathEditor);