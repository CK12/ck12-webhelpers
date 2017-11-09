function tinyMCEMathEditor(t,e){function i(t){function i(){s(),o(),a()}function a(){var t={};t.API=new n({callback:{get:function(){},set:d}}),window.mathEditorHelper.parentContainer=t}function o(){t.onClick.add(function(t,e){var i=$(e.target).closest("span.x-ck12-mathEditor"),n=$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]');n.length>0&&n.remove(),0!=i.length&&setTimeout(function(){i.hasClass("doubleClick")?i.removeClass("doubleClick"):i.hasClass("forSingleClick")?i.removeClass("forSingleClick"):("block"!=i[0].getAttribute("data-mathmethod")&&null!=i[0].previousSibling&&null!=i[0].previousSibling.nodeValue&&0==i[0].previousSibling.nodeValue.length&&i.before("&nbsp;"),(null==i[0].nextSibling||null==i[0].nextSibling.nodeValue||0==i[0].nextSibling.nodeValue.length)&&i.after("&nbsp;"),tinyMCE.activeEditor.controlManager.setActive("matheditor",!0),i.addClass("selectedElement"),tinyMCE.activeEditor.selection.select(i[0]))},200)}),t.onDblClick.add(function(e,i){var n,a,o,d,r,l,m,s=void 0===i.target?i:i.target,u=s.hasAttribute("class")&&s.className.match("x-ck12-mathEditor")?$(s):$(s).closest("span.x-ck12-mathEditor");if(tinyMCE.activeEditor.controlManager.setActive("matheditor",!1),0!=u.length)u.addClass("doubleClick forSingleClick"),n=decodeURIComponent(u[0].getAttribute("data-tex")),n.match("bmatrix")&&!n.match(" & ")?(a="",n=n.replace("&"," & ")):a=u[0].getAttribute("data-edithtml"),E=u[0].id,r=u[0].getAttribute("variable"),o=u[0].getAttribute("mathMethod"),o||(o=u[0].getAttribute("data-mathmethod")),d=u[0].getAttribute("data-math-class"),h={tex:n,edithtml:a,variable:r,isOldEditor:!1,mathType:o,mathClass:d},window.mathEditorHelper.editOptions=h,window.mathEditorHelper.editedElementId=E,window.mathEditorHelper.editMode=!0,c(h);else if($(s).hasClass("x-ck12-math")||$(s).hasClass("x-ck12-hwpmath")||$(s).hasClass("x-ck12-block-math")){n=$(s).attr("src").split("/");for(var v=0;v<n.length;v++)("alignat"==n[v]||"inline"==n[v]||"block"==n[v])&&(l=n.slice(v+1).join("/"),m=decodeURIComponent(l),o=n[v],d=$(s).attr("class"));h={tex:m,edithtml:"",variable:"",isOldEditor:!0,mathType:o,mathClass:d},window.mathEditorHelper.editOptions=h,window.mathEditorHelper.currentElement=s,window.mathEditorHelper.editMode=!0,tinymce.isIE&&t.selection.getBookmark(),c(h)}}),t.onMouseDown.add(function(e,i){var n=i.target,a=n.hasAttribute("class")&&n.className.match("x-ck12-mathEditor")?$(n):$(n).closest("span.x-ck12-mathEditor");t.controlManager.setActive("matheditor",!1),$(t.dom.select("span.x-ck12-mathEditor")).removeClass("selectedElement showContextMenu"),3===i.which&&0!=a.length&&a.addClass("showContextMenu")}),t.onInit.add(function(){t&&t.plugins.contextmenu&&t.plugins.contextmenu.onContextMenu.add(function(e,i){var n=t.dom,a=n.select("span.x-ck12-mathEditor.showContextMenu");if(0!=a.length){var o=t.selection.isCollapsed();$(a[0]).addClass("selectedElement"),i.removeAll(),i.add({title:"Select",onclick:function(){tinyMCE.activeEditor.controlManager.setActive("matheditor",!0);var t=tinyMCE.activeEditor.dom.select("span.x-ck12-mathEditor.selectedElement");"block"!=t[0].getAttribute("data-mathmethod")&&null!=t[0].previousSibling&&null!=t[0].previousSibling.nodeValue&&0==t[0].previousSibling.nodeValue.length&&$(t).before("&nbsp;"),(null==t[0].nextSibling||null==t[0].nextSibling.nodeValue||0==t[0].nextSibling.nodeValue.length)&&$(t).after("&nbsp;"),setTimeout(function(){tinyMCE.activeEditor.selection.select(t[0]),tinyMCE.activeEditor.focus()},500)}}),i.add({title:"Edit",onclick:function(){var t=tinyMCE.activeEditor.dom.select("span.x-ck12-mathEditor.selectedElement");tinyMCE.activeEditor.onDblClick.dispatch(tinymce.activeEditor,t[0]),$(t).removeClass("selectedElement")}}),i.add({title:"advanced.copy_desc",cmd:"Copy"}).setDisabled(o)}})}),t.onKeyDown.add(function(){tinyMCE.activeEditor.controlManager.setActive("matheditor",!1)}),-1!==navigator.userAgent.toLowerCase().indexOf("firefox")&&t.onKeyDown.addToTop(function(t,e){var i=t.selection.getStart(),n=t.selection.getEnd(),a=[],o=null,d=null;if(d=t.dom.getPrev(t.selection.getStart(),function(e){return t.dom.hasClass(e,"x-ck12-mathEditor")}),a.push(i),a.push(n),8===e.keyCode){if("x-ck12-mathEditor"===i.className.split(/\s+/)[0])return void tinymce.activeEditor.dom.remove(i.id);if("x-ck12-mathEditor"===n.className.split(/\s+/)[0])return void tinymce.activeEditor.dom.remove(n.id);if(null!==d)return void tinymce.activeEditor.dom.remove(d.id);for(var r=0;r<a.length;r++){for(var l=a[r];l.parentNode;){if("x-ck12-mathEditor"===l.className.split(/\s+/)[0]){o=l.id;break}l=l.parentNode}if(null!==o){tinymce.activeEditor.dom.remove(i.id);break}}}})}function d(t){var e,i,n,a=tinyMCE.activeEditor,o=window.mathEditorHelper;if(t&&o.editMode&&o.editOptions){if(void 0!==o.editedElementId&&null!==o.editedElementId)tinymce.activeEditor.dom.get(o.editedElementId).innerHTML=t.wrapHtml.innerHTML,tinymce.activeEditor.dom.get(o.editedElementId).setAttribute("data-tex",encodeURIComponent(t.tex)),tinymce.activeEditor.dom.get(o.editedElementId).setAttribute("data-edithtml",t.editHtml),tinymce.activeEditor.dom.get(o.editedElementId).setAttribute("data-mathmethod",t.mathMethod),tinymce.activeEditor.dom.get(o.editedElementId).setAttribute("data-math-class",t.mathClass),tinymce.activeEditor.dom.get(o.editedElementId).removeAttribute("data-tex-mathjax"),tinymce.activeEditor.dom.get(o.editedElementId).removeAttribute("mathmethod"),l(o.editedElementId,t.mathMethod),r(o.editedElementId);else if(void 0!==o.currentElement&&null!==o.currentElement){for(e=tinymce.DOM.uniqueId();null!=tinymce.activeEditor.dom.get(e);)e=tinymce.DOM.uniqueId();n=e,i=tinyMCE.activeEditor.dom.create("span",{id:e,"class":"x-ck12-mathEditor"},""),tinyMCE.activeEditor.dom.replace(i,o.currentElement,!0),tinymce.activeEditor.selection.collapse(!0),tinymce.activeEditor.dom.get(n).innerHTML=t.wrapHtml.innerHTML,tinymce.activeEditor.dom.get(n).setAttribute("data-tex",encodeURIComponent(t.tex)),tinymce.activeEditor.dom.get(n).setAttribute("data-edithtml",t.editHtml),tinymce.activeEditor.dom.get(n).setAttribute("contenteditable","false"),tinymce.activeEditor.dom.get(n).setAttribute("data-mathmethod",t.mathMethod),tinymce.activeEditor.dom.get(n).setAttribute("data-math-class",t.mathClass),l(n,t.mathMethod),r(n)}t=null,o.editOptions=null,o.editedElementId=null,o.currentElement=null,o.editMode=!1}if(t){for(a.focus(),e=tinymce.DOM.uniqueId();null!=tinymce.activeEditor.dom.get(e);)e=tinymce.DOM.uniqueId();n=e,i=tinyMCE.activeEditor.dom.create("span",{id:e,"class":"x-ck12-mathEditor"},""),$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').length>0?$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').before(i):tinyMCE.activeEditor.selection.setNode(i),tinymce.activeEditor.dom.get(n).innerHTML=t.wrapHtml.innerHTML,tinymce.activeEditor.dom.get(n).setAttribute("data-tex",encodeURIComponent(t.tex)),tinymce.activeEditor.dom.get(n).setAttribute("data-edithtml",t.editHtml),tinymce.activeEditor.dom.get(n).setAttribute("contenteditable","false"),tinymce.activeEditor.dom.get(n).setAttribute("data-mathmethod",t.mathMethod),tinymce.activeEditor.dom.get(n).setAttribute("data-math-class",t.mathClass),$(tinymce.activeEditor.dom.get(n)).after("&nbsp;"),l(n,t.mathMethod),r(n),t=null}$(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').remove(),tinyMCE.EditorManager.activeEditor.windowManager.close(window,a.windowManager.params.mce_window_id),tinyMCE.activeEditor.execCommand("mceAutoResize")}function r(t){var e=[];e=$(tinyMCE.activeEditor.dom.get(t)).find("span[id^='MathJax']"),$.each(e,function(){$(this).attr("id",t+"_"+$(this).attr("id"))})}function l(t,e){if(0!=tinymce.activeEditor.dom.get(t).parentNode.className.length&&"block"==e){for(var i=tinymce.activeEditor.dom.get(t).parentNode.className.split(" "),n=0;"undefined"!=typeof i[n];)(i[n].match(/x-ck12-textcolor/gi)||i[n].match(/x-ck12-textbgcolor/gi))&&(i[n]=""),n++;tinymce.activeEditor.dom.get(t).parentNode.className=i.join(" ").trim()}}function c(t){var t=void 0===t?{}:t,e=[];"undefined"!=typeof ae&&(e=ae.controllers.qb.getVariableData()),t.variable=e,m(function(t){window.mathEditorHelper.parentContainer.API.get(t)},t)}function m(e,i){var n=null,a=null,o=!1,d=40,r=1;$("#tinymceContentHelper").html(""),t.windowManager.open({file:u,width:900,height:""===i.edithtml||1==i.isOldEditor||i.edithtml&&-1!=i.edithtml.indexOf("paste-option")?470:640,buttons:n,inline:1}),a=setInterval(function(){try{o&&e(i),!o&&d>=r?(o=window.mathEditorHelper.parentContainer.API.info().loaded,r++):(window.mathEditorHelper.parentContainer.API.resizeHandler(),clearInterval(a))}catch(t){}},1e3)}function s(){t.addButton("matheditor",{text:"Math Editor",title:"Math Editor",image:e+"/img/icon_math_editor.gif",onclick:function(){tinymce.activeEditor=t,window.mathEditorHelper.editMode=!1;var e=tinyMCE.activeEditor.dom.select("span.x-ck12-mathEditor.selectedElement");0!=e.length?(tinymce.activeEditor.onDblClick.dispatch(tinymce.activeEditor,e[0]),$(e).removeClass("selectedElement")):($(tinymce.activeEditor.getBody()).find('span[data-mce-type="bookmark"]').remove(),t.selection.getBookmark(),h={tex:"newEquation",mathType:tinyMCE.settings.default_math_type},c(h))}})}t.settings.ck12_plugins_url&&(e=t.settings.ck12_plugins_url+"matheditor");var u=e+"/shell/authoring/authoring.htm",h=null,E=null;window.mathEditorHelper={},i()}function n(t){function e(){return{events:r,loaded:c}}function i(t){m&&m.set&&"function"==typeof m.set&&m.set(t)}function n(t){var e=!1;return l&&l.API&&l.API.set&&"function"==typeof l.API.set&&(e=l.API.set(t)),e}function a(t){var e=t&&t.event?t.event:"";if(e)switch(e){case"onload":o(t);break;case"resize":}}function o(t){t&&t.API&&(l=l?l:{},l.API=t.API,c=!0)}function d(){c=!1}var r=["onload","resize"],l=null,c=!1,m=t&&t.callback?t.callback:null;this.info=e,this.get=n,this.set=i,this.notify=a,this.resizeHandler=d}new i(t)}tinymce.PluginManager.add("matheditor",tinyMCEMathEditor);