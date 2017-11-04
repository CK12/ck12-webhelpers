(function(){var a=tinymce.DOM;tinymce.create("tinymce.plugins.FullScreenPlugin",{init:function(d,e){var f=this,g={},c,b;f.editor=d;d.addCommand("mceFullScreen",function(){var i,j=a.doc.documentElement;if(d.getParam("fullscreen_is_enabled")){if(d.getParam("fullscreen_new_window")){closeFullscreen()}else{a.win.setTimeout(function(){tinymce.dom.Event.remove(a.win,"resize",f.resizeFunc);tinyMCE.get(d.getParam("fullscreen_editor_id")).setContent(d.getContent());tinyMCE.remove(d);a.remove("mce_fullscreen_container");j.style.overflow=d.getParam("fullscreen_html_overflow");a.setStyle(a.doc.body,"overflow",d.getParam("fullscreen_overflow"));a.win.scrollTo(d.getParam("fullscreen_scrollx"),d.getParam("fullscreen_scrolly"));tinyMCE.settings=tinyMCE.oldSettings},10)}return}if(d.getParam("fullscreen_new_window")){i=a.win.open(e+"/fullscreen.htm","mceFullScreenPopup","fullscreen=yes,menubar=no,toolbar=no,scrollbars=no,resizable=yes,left=0,top=0,width="+screen.availWidth+",height="+screen.availHeight);try{i.resizeTo(screen.availWidth,screen.availHeight)}catch(h){}}else{tinyMCE.oldSettings=tinyMCE.settings;g.fullscreen_overflow=a.getStyle(a.doc.body,"overflow",1)||"auto";g.fullscreen_html_overflow=a.getStyle(j,"overflow",1);c=a.getViewPort();g.fullscreen_scrollx=c.x;g.fullscreen_scrolly=c.y;if(tinymce.isOpera&&g.fullscreen_overflow=="visible"){g.fullscreen_overflow="auto"}if(tinymce.isIE&&g.fullscreen_overflow=="scroll"){g.fullscreen_overflow="auto"}if(tinymce.isIE&&(g.fullscreen_html_overflow=="visible"||g.fullscreen_html_overflow=="scroll")){g.fullscreen_html_overflow="auto"}if(g.fullscreen_overflow=="0px"){g.fullscreen_overflow=""}a.setStyle(a.doc.body,"overflow","hidden");j.style.overflow="hidden";c=a.getViewPort();a.win.scrollTo(0,0);if(tinymce.isIE){c.h-=1}if(tinymce.isIE6){b="absolute;top:"+c.y}else{b="fixed;top:0"}n=a.add(a.doc.body,"div",{id:"mce_fullscreen_container",style:"position:"+b+";left:0;width:"+c.w+"px;height:"+c.h+"px;z-index:9999;"});a.add(n,"div",{id:"mce_fullscreen"});tinymce.each(d.settings,function(k,l){g[l]=k});g.id="mce_fullscreen";g.width=n.clientWidth;g.height=n.clientHeight-15;g.fullscreen_is_enabled=true;g.fullscreen_editor_id=d.id;g.theme_advanced_resizing=false;g.save_onsavecallback=function(){d.setContent(tinyMCE.get(g.id).getContent());d.execCommand("mceSave")};tinymce.each(d.getParam("fullscreen_settings"),function(m,l){g[l]=m});if(g.theme_advanced_toolbar_location==="external"){g.theme_advanced_toolbar_location="top"}f.fullscreenEditor=new tinymce.Editor("mce_fullscreen",g);f.fullscreenEditor.onInit.add(function(){f.fullscreenEditor.setContent(d.getContent());f.fullscreenEditor.focus()});f.fullscreenEditor.render();f.fullscreenElement=new tinymce.dom.Element("mce_fullscreen_container");f.fullscreenElement.update();f.resizeFunc=tinymce.dom.Event.add(a.win,"resize",function(){var o=tinymce.DOM.getViewPort(),l=f.fullscreenEditor,k,m;k=l.dom.getSize(l.getContainer().firstChild);m=l.dom.getSize(l.getContainer().getElementsByTagName("iframe")[0]);l.theme.resizeTo(o.w-k.w+m.w,o.h-k.h+m.h)})}});d.addButton("fullscreen",{title:"fullscreen.desc",cmd:"mceFullScreen"});d.onNodeChange.add(function(i,h){h.setActive("fullscreen",i.getParam("fullscreen_is_enabled"))})},getInfo:function(){return{longname:"Fullscreen",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/fullscreen",version:tinymce.majorVersion+"."+tinymce.minorVersion}}});tinymce.PluginManager.add("fullscreen",tinymce.plugins.FullScreenPlugin)})();