(function(){var b=tinymce.dom.Event;var e,d,a;var c;tinymce.create("tinymce.plugins.ElementBoxPlugin",{init:function(f,g){if(f.settings.ck12_plugins_url){g=f.settings.ck12_plugins_url+"elementbox"}var h=this;h.editor=f;var i=tinymce.each;e=f.getParam("element_box_class");d=f.getParam("element_box_header_class");a=f.getParam("element_box_body_class");f.addCommand("mceAddElementBox",function(){f.selection.collapse(0);var j='<div class="'+e+'">  <div class="'+d+'">&nbsp;<span id="_mce_temp_span">&nbsp;</span></div>  <div class="'+a+'"></div></div>';f.execCommand("mceInsertContent",false,j,{skip_undo:1});f.undoManager.add();f.focus();f.selection.select(f.dom.select("#_mce_temp_span")[0]);f.selection.collapse(0);f.dom.remove(f.dom.select("span#_mce_temp_span")[0])});f.addCommand("mceDeleteElementBox",function(){var k=f.selection.getNode();var j=null;if(f.dom.hasClass(k,"x-ck12-element-box-placeholder")){j=k}else{j=f.dom.getParent(f.selection.getNode(),function(l){return f.dom.hasClass(l,"x-ck12-element-box-placeholder")})}if(j){j.parentNode.removeChild(j);f.execCommand("mceRepaint")}});f.onInit.add(function(){if(f&&f.plugins.contextmenu){f.plugins.contextmenu.onContextMenu.addToTop(function(n,j,p){var q,o=f.selection,l=o.getNode()||f.getBody();var k=f.dom.getParent(p,"table");if(k&&f.dom.hasClass(k,"x-ck12-element-box-placeholder")){j.addSeparator();j.add({title:"Delete Element Box",cmd:"mceDeleteElementBox",icon:"elementBoxDelete",ui:true})}})}});f.onNodeChange.add(function(k,j,o){var m,l;m=k.dom.getParent(k.selection.getStart(),function(p){return k.dom.hasClass(p,e)||k.dom.hasClass(p,d)||k.dom.hasClass(p,a)});l=k.dom.getParent(k.selection.getEnd(),function(p){return k.dom.hasClass(p,e)||k.dom.hasClass(p,d)||k.dom.hasClass(p,a)});if(m||l){j.setDisabled("elementbox",true);j.setActive("elementbox",false);j.setDisabled("table",true);j.setActive("table",false);j.setDisabled("blockquote",true);j.setActive("blockquote",false)}else{j.setDisabled("elementbox",false);j.setDisabled("blockquote",false)}});f.onKeyPress.addToTop(function(k,p){var n=p.keyCode;var o=false;if(c===13){o=true}if(n===13){c=13}else{c=n;o=false}if(n==13){var l=k.dom.getParent(k.selection.getEnd(),function(r){return k.dom.hasClass(r,d)});var m,q,j;if(l){m=k.selection.getEnd().parentNode;q=l;j=q.nextSibling;if(j.className==k.getParam("element_box_body_class")){k.focus();k.selection.select(j.firstChild,true);k.selection.collapse(true)}return tinymce.dom.Event.cancel(p)}else{l=k.dom.getParent(k.selection.getEnd(),function(r){return k.dom.hasClass(r,a)});if(l){if(o){return h._overrideDoubleEnter(h,p)}}}}});f.onPreProcess.add(function(j,k){if(k.get){h._fixElementBoxes(j,h,k)}});f.addButton("elementbox",{title:"Insert Element Box",cmd:"mceAddElementBox",image:g+"/img/icon_elementbox.png"})},getParentBlock:function(g){var f=this.editor.dom;return f.getParent(g,f.isBlock)},_fixElementBoxes:function(f,g,i){var h=tinymce.each;h(f.dom.select("DIV",i.node),function(s){if(s.parentNode!==null){if(f.dom.hasClass(s,d)||f.dom.hasClass(s,a)){if(!f.dom.hasClass(s.parentNode,e)){var q=f.getDoc().createElement("P");q.innerHTML=s.innerHTML;f.dom.replace(q,s)}}if(f.dom.hasClass(s,e)){var k=null;var m=[];h(f.dom.select("DIV",s),function(t){if(f.dom.hasClass(t.parentNode,e)){if(f.dom.hasClass(t,a)){if(k){var n=f.getDoc().createElement("P");n.innerHTML=t.innerHTML;k.appendChild(n);t.parentNode.removeChild(t);f.execCommand("mceRepaint");g.editor.nodeChanged()}else{k=t}}}})}if(f.dom.hasClass(s,e)){var l=false;var o=false;h(s.children,function(n){if(f.dom.hasClass(n.parentNode,e)){if(f.dom.hasClass(n,d)){l=true}else{if(f.dom.hasClass(n,a)){o=true}}}});if(!l){var r=f.getDoc().createElement("DIV");r.className=d;r.innerHTML="&nbsp;";s.insertBefore(r,s.firstChild)}if(!o){var j=f.getDoc().createElement("DIV");j.className=a;j.innerHTML="&nbsp;";s.appendChild(j)}}if(f.dom.hasClass(s,e)){h(s.children,function(n){if(n.innerHTML&&(n.innerHTML.length==0||n.innerHTML=="<br>")){n.innerHTML="&nbsp;"}})}}})},_overrideDoubleEnter:function(h,i){var g=h.editor;g.undoManager.beforeChange();pa=g.dom.getParent(g.selection.getEnd(),function(j){return g.dom.hasClass(j,"x-ck12-element-box-placeholder")});next=pa.nextSibling;if(!next&&pa.parentNode){var f=g.getDoc().createElement("P");f.innerHTML="&nbsp;";pa.parentNode.appendChild(f)}next=pa.nextSibling;if(next){g.focus();if(next.firstChild){g.selection.select(next.firstChild,true)}else{g.selection.select(next,true)}g.selection.collapse(1);return tinymce.dom.Event.cancel(i)}},getInfo:function(){return{longname:"CK-12 Element Box",author:"Shanmuga Bala",authorurl:"http://www.ck12.org",infourl:"https://insight.ck12.org/wiki/index.php/Tinymce-flxweb",version:"1.0"}}});tinymce.PluginManager.add("elementbox",tinymce.plugins.ElementBoxPlugin)})();