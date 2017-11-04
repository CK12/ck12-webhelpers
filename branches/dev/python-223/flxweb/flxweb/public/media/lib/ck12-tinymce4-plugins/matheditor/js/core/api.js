define([],function(){
	function Api(){
			
			var eventsArray = ["onload", "resize"],
				container = null,
				className = "MathEditor";
			
			function info(){
				return eventsArray;
			}
			
			function get(options){
				var obj = null,
					guid,
					texValue;
				function cb(obj){
					options.cbk(obj);
				}
				guid = util.getUID();
				texValue = document.getElementById("texoutput").value;
				if(texValue!=''){
					eqeditorObj.app.showMath({"Tex":texValue,"id":''+guid,"cb":cb});
					$('.mathdiv').children().eq(1).empty();
				}
				else {
					alert('Please Enter LaTeX Math Equation');
					return false;
				}
			}
			
			function set(options){
				//util.log(className + ".API.set");
				var success = false,
					tex,
					edithtml;
				
				if(options && options.variable.length > 0){
					eqeditorObj.setVariable(options.variable);
				}
				eqeditorObj.updateVariableButton();
				
				if(options.tex=="newEquation"){
					$('.formula-row').removeClass('hide');
					$('.formula_container').center();
					if(options.mathType=='alignat'){
						$('input[value=alignat]').attr('checked',true);
					}
					else {
						$('input[value=inline]').attr('checked',true);
					}
					return false;
				}
				
				if(options && options.tex){
		            tex = options.tex,
	            	edithtml = options.edithtml;
		            if(options.edithtml==='' || options.isOldEditor==true || (options.edithtml && options.edithtml.indexOf('paste-option')!=-1)){
		            	//edithtml= '<span class="rendered-math" id="editableMath" style="font-size: 18px;">'+edithtml+'</span>';
		            	$('.rendered-math').html('<span class="paste-option">Latex edited equations cannot be previewed in editor. If you want to preview equation click on preview.</span>');
		            }
		            else {
		            	$('.formula-row').removeClass('hide');
		            	if(edithtml.indexOf('rendered-math')==-1){
		            		var edithtmlUncomp = LZString.decompressFromBase64(edithtml);
		            		if(edithtmlUncomp.indexOf('editableMath')==-1){
		            			if(window && window.atob){
		            				edithtmlUncomp = decodeURIComponent(escape(window.atob(edithtml)));
								}
								else {
									edithtmlUncomp = decodeURIComponent(escape(window.base64.decode(edithtml)));
								}
		            		}
		            		$('.formula_container').html(edithtmlUncomp).center();
		            	}
		            	else {
		            		$('.formula_container').html(edithtml).center();
		            	}
		            }
		            eqeditorObj.setMathType(options.mathType);
		            $('.latexoutput').val(tex).caret({start:tex.length,end:tex.length});
		            setTimeout(function(){
		            	$('.preview').trigger('click');
		            }, 100);
		            $(document).trigger("resize");
		            /*if($(".mainbox").length > 0){
		            	eqeditorObj.setSelectedTextbox();
		            }*/
				}
				/*else{
					if(eqeditorObj && eqeditorObj.clearMath && typeof eqeditorObj.clearMath === 'function'){
						eqeditorObj.clearMath();
					}
				}*/
				if($(".mainbox").length > 0){
					eqeditorObj.setSelectedTextbox();
					//eqeditorObj.changeWidth();
				}
				eqeditorObj.addButtonClass();
				//$("#model-geoDropDown").addClass("no-display")
				return success;
			}
			
			function notify(options){
				
				var event = (options && options.event)? options.event: "";
				
				if(!event || !(container && container.API && container.API.notify && typeof container.API.notify === 'function')){
					return;
				}
				
				switch(event){
					case "onload":
						onloadHandler(options);
						break;
					case "resize":
						resizeHandler(options);
						break;
					default: 
				}
			}
			
			function onloadHandler(options){
				success = container.API.notify(options);
			}
			
			function resizeHandler(options){
				success = container.API.notify(options);
			}
	
			this.info = info;
			this.get = get;
			this.set = set;
			this.notify = notify;
		}
	
	return new Api();
});
