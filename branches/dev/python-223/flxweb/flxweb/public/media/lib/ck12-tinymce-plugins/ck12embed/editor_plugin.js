(function(){tinymce.PluginManager.requireLangPack("ck12embed");var b="";var e="id|name|title|longdesc|class|width|height|src|frameborder";var f="itemprop|itemscope|itemtype";var a="description|image|name|url";var c="ck12-media-placeholder";var d="/images/trans.gif";var g="x-ck12-element-box";tinymce.create("tinymce.plugins.CK12EmbedPlugin",{init:function(i,j){var h=this;this.editor=i;if(i.settings.ck12_plugins_url){j=i.settings.ck12_plugins_url+"ck12embed"}b=h.plugin_url=j;i.onPreInit.add(function(){var l=null;var k=null;i.parser.addNodeFilter("iframe",function(m){var n=m.length;while(n--){k=m[n];l=h.embedNodeToImg(k);k.parent.replace(l)}});i.serializer.addNodeFilter("img",function(m,o,n){var p=m.length,q;while(p--){q=m[p];var r=q.attr("class")||"";if(r.indexOf("ck12-media-placeholder")!==-1){h.imgToEmbed(q,n)}}})});i.addCommand("mceEmbedDialog",function(){i.windowManager.open({file:b+"/embed.htm",width:420,height:500,inline:1},{plugin_url:b})});i.addCommand("mceEmbedDelete",function(){var k=i.selection.getNode();if(k&&k.className&&k.className.indexOf(c)!=-1){k.parentNode.removeChild(k)}});i.addButton("ck12embed",{title:"ck12embed.desc",cmd:"mceEmbedDialog","class":"mce_media"});i.onNodeChange.add(function(m,l,q){var p=false;if(m&&m.parents&&m.parents.length>0){for(var o=0;(o<m.parents.length&&!p);o++){var k=m.parents[o];if("TD"==k.tagName.toUpperCase()){p=true}else{if("DIV"==k.tagName.toUpperCase()&&k.className.indexOf(g)!=-1){p=true}}}}if(!p&&(q.nodeName=="TD"||(q.nodeName=="DIV"&&q.className.indexOf(g)!=-1))){p=true}if(null!=q.parentNode){if(q.parentNode.nodeName!="P"){if(q.nodeName!="P"||q.parentNode.nodeName!="BODY"){p=true}if(tinymce.isIE&&q.nodeName=="BODY"&&q.parentNode.nodeName=="HTML"){p=false}}}if(p){l.setActive("ck12embed",false);l.setDisabled("ck12embed",true)}else{if(q.nodeName=="IMG"){if(q.className&&q.className.indexOf(c)!=-1){l.setActive("ck12embed",true);l.setDisabled("image",true)}else{l.setActive("ck12embed",false);l.setDisabled("image",false)}}else{l.setActive("ck12embed",false);l.setDisabled("ck12embed",false);l.setDisabled("image",false)}}});i.onInit.add(function(){if(i&&i.plugins.contextmenu){i.plugins.contextmenu.onContextMenu.add(function(n,k,p){var r,o=i.selection,l=o.getNode()||i.getBody();var q=i.dom.getParent(p,"div");if(l.nodeName=="IMG"&&i.dom.getAttrib(p,"class").indexOf(c)!=-1){k.removeAll();k.add({title:"Edit Embedded Object",icon:"media",cmd:"mceEmbedDialog",ui:true});k.add({title:"Delete Embedded Object",icon:"ck12EmbedDelete",cmd:"mceEmbedDelete",ui:true});k.addSeparator()}})}})},createControl:function(i,h){return null},_in_array:function(h,l){var j,k;for(j=0;j<h.length;j++){k=h[j];if(k==l){return true}}return false},embedNodeToJSON:function(l){var t=this;if(l){var p=f.split("|");var m=e.split("|");var s=a.split("|");var q={};var n,r;n=l.attributes.length;while(n--){r=l.attributes[n];if(t._in_array(m,r.name)){q["data-ck12embed-iframe-"+r.name]=r.value}}var j=l.parent;if(j){if(j.name=="div"){n=j.attributes.length;while(n--){r=j.attributes[n];if(t._in_array(p,r.name)){q["data-ck12embed-container-"+r.name]=r.value}}}var o=j.getAll("meta");if(o&&o.length){n=o.length;while(n--){r=o[n];var h=r.attr("itemprop");var k=r.attr("content");if(t._in_array(s,h)){q["data-ck12embed-meta-"+h]=k}}}}return q}},embedNodeToImg:function(j){var i=this;if(j){var k=i.embedNodeToJSON(j);var h=tinymce.html.Node.create("img",k);h.attr("src",b+d);h.attr("class",c);if(k["data-ck12embed-iframe-width"]){h.attr("width",k["data-ck12embed-iframe-width"])}if(k["data-ck12embed-iframe-height"]){h.attr("height",k["data-ck12embed-iframe-height"])}return h}},htmlstrToImg:function(j){var k=null;var h=null;var i=null;if(j){k=this.editor.parser.parse(j);if(k){i=k.getAll("img")[0]}}return i},imgToEmbed:function(j,o){if(j){var m={container:{},iframe:{},meta:{}};var k,n,p;n=j.attributes.length;while(n--){k=j.attributes[n];p=k.name.replace("data-ck12embed-","").split("-");if(m[p[0]]){m[p[0]][p[1]]=k.value}}var h=tinymce.html.Node.create("div",m.container);if(!h.attr("itemscope")){h.attr("itemscope","")}if(m.meta){var q=null;for(p in m.meta){if(m.meta.hasOwnProperty(p)){k=m.meta[p];q=this.editor.parser.parse("<meta />").getAll("meta")[0];q.attr("itemprop",p);q.attr("content",k);h.append(q)}}}if(m.iframe&&!("frameborder" in m.iframe)){m.iframe.frameborder="0"}var l=tinymce.html.Node.create("iframe",m.iframe);h.append(l);j.replace(h)}},getInfo:function(){return{longname:"CK-12 Embedded Objects",author:"Nachiket Karve",authorurl:"http://www.ck12.org",infourl:"https://insight.ck12.org/wiki/index.php/Tinymce-flxweb",version:"1.0"}}});tinymce.PluginManager.add("ck12embed",tinymce.plugins.CK12EmbedPlugin)})();