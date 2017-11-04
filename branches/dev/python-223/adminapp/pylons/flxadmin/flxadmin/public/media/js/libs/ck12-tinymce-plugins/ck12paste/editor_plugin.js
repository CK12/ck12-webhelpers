/**
* Copyright 2007-2010 CK-12 Foundation
*
* All rights reserved
*      
*
* Unless required by applicable law or agreed to in writing, software
* distributed under this License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
* implied.  See the License for the specific language governing
* permissions and limitations.
*
* This file originally written by Shanmuga Bala
*
* $Id$
*/


(function() {
	tinymce.create('tinymce.plugins.CK12PastePlugin', {
		init : function(ed, url) {
			var t = this;
			// Register commands
			ed.addCommand('mcePreProcess', function(ui,content) {
		
				//Removing Script tags
				content = content.replace(/<\s*script.*?>/g,"").replace(/<\/script.*?>/g,'');
				//Reformatting Header tags
				//console.debug(content);
				content = content.replace(/<h5>/g,"<h4>").replace(/<\/h5>/g,"</h4>");	
				content = content.replace(/<h6>/g,"<h4>").replace(/<\/h6>/g,"</h4>");	
				content = content.replace(/<h3>/g,"<h4>").replace(/<\/h3>/g,"</h4>");	
				content = content.replace(/<h2>/g,"<h3>").replace(/<\/h2>/g,"</h3>");	
				content = content.replace(/<h1>/g,"<h2>").replace(/<\/h1>/g,"</h2>");
				content = content.replace(/<u>/gi,"<span class=\"x-ck12-underline\">").replace(/<\/u>/gi,"</span>");
				content = content.replace(/<s>/gi,"<span class=\"x-ck12-strikethrough\">").replace(/<\/s>/gi,"</span>");
				content=content.replace(/<br>/g,'\n');			
								
				// Exclude images that are CK12 image e.g that have "x-ck12-math"  class. e.g: 
				// <img class="x-ck12-math" alt="3^{\text{rd}}" src="/flx/math/inline/3%5E%7B%5Ctext%7Brd%7D%7D">
				// OR images that have src from CK12 site e.g images with source like 
				// <img width="450" id="" alt="" longdesc="" title="" src="/flx/render/perma/resource/THUMB_POSTCARD/image/user/a8af51e2789a7dbdf31d7b3b445e3ccb.jpg">
				// These are all CK12 internal images. We do not want them to be modified in any way.
				// see bugs 2971 and 721

				//Build RE to exclude CK-12 Images and include external images e.g pasted from google
				//var imgPattern = new RegExp(/<img\\s((?!x-ck12-math)(?!\/ck12\/images\\?id\\=).)+?>/g);
				var imgPattern = new RegExp(/<img+\s+((?!x-ck12-math)(?!x-ck12-block-math)(?!x-ck12-hwpmath)(?!\/perma\/resource)(?!>).)+?>/ig);
				var imgArray = content.match(imgPattern);	
				var isImgURLLocal = false;

				if(imgArray != null) {
					for (var i = 0; i < imgArray.length; i++) {
						var img = imgArray[i];
						var altPattern = new RegExp("alt=\"(.*?)\"");
						var srcPattern = new RegExp(/src\s*=\s*"(.+?)"/g);
						var titlePattern = new RegExp("title=\"(.*?)\"");
						var src = img.match(srcPattern); //src="img loc"
						var alt = img.match(altPattern); //alt="img desc",img desc
						var title = img.match(titlePattern); //title="img desc"
						var alt_data = "";
						var caption_data = "";
						var title_data = "";

						if(alt != null){
							if(alt.length > 0)
								alt_data = alt[1];
								caption_data = alt[1];
						}

						if(title != null){
							if(title.length > 0)
								title_data = title[1];
						}
						
						var formattedImg = "";
						if(src != null){
							if((src+"").indexOf("file:/") != -1){
								var url = (src+"").match("src=\"(.*?)\"");
								if(url != null)
									if(url.length > 0){
										localURL = url[1] + "";
										tinyMCE.activeEditor.execCommand('mceAdvImage');
									}
								isImgURLLocal = true;
								break;
							}
							formattedImg = "<div class=\"x-ck12-img-postcard x-ck12-nofloat\" ><p><img "+src;
							formattedImg += " longdesc=\""+caption_data+"\" title=\""+title_data+"\" alt=\""+alt_data+"\"/></p></div>";
						}
						
						if (!isImgURLLocal) {
							content = content.replace(img,formattedImg);
						}
					}
				}
				var olPattern = new RegExp(/<ol+\s+(?!x-ck12-\w+)(?!>)(?=type\s*=\s*\"?(\w+)\"?).+?>/ig);
                                var olArray = content.match(olPattern);
				var ol;
				var formattedOl = "";
				if (olArray != null) {
					var decimalPattern = new RegExp(/\d+/);
					var romanUpperAlphaPattern = new RegExp(/^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/);
					var romanLowerAlphaPattern = new RegExp(/^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/i);
					var lowerAlphaPattern = new RegExp(/[a-z]+/);
					var upperAlphaPattern = new RegExp(/[A-Z]+/);
					
					for (var i = 0; i < olArray.length; i++) {
						ol = olArray[i];
						olClass = "";
                                                var typePattern = new RegExp(/type\s*=\s*\"?(\w+)\"?/);
						type = ol.match(typePattern);
						if (type != null && type.length > 1) {
							if (decimalPattern.test(type[1]))
								olClass = "x-ck12-decimal";
							else if (romanUpperAlphaPattern.test(type[1])) 
								olClass = "x-ck12-upper-roman";
							else if (romanLowerAlphaPattern.test(type[1])) 
								olClass = "x-ck12-lower-roman";	
							else if (lowerAlphaPattern.test(type[1])) 
								olClass = "x-ck12-lower-alpha"
							else if (upperAlphaPattern.test(type[1])) 
								olClass = "x-ck12-upper-alpha"
						}
						formattedOl = "<ol class=\""+olClass+"\" >"
						content = content.replace(ol,formattedOl);
					} 
				}

				var aPattern = new RegExp(/<a[^<]*(href="([^"]+)">)/g);
                                var aArray = content.match(aPattern);
				var anchor;
				var formattedAnchor = "";
				if (aArray != null) {
					var hrefPattern = new RegExp("href=\"(.*?)\"");
					for (var i = 0; i < aArray.length; i++) {
						anchor = aArray[i]
						var href = anchor.match(hrefPattern);  //href="http://wwww.example.com"
						if (href != null && href.length > 1) {
							formattedAnchor = "<a href=\""+href[1]+"\" >"
							content = content.replace(anchor,formattedAnchor);
						}
						
					}
				}
				pasteInsideElementBox = t._pasteInsideElementBox(tinyMCE.activeEditor);
				//Change all the elementboxes inside the pasting content to para tags<p>, if you past the content inside an element box.
				if(pasteInsideElementBox) {
					var ebPattern = new RegExp(/<div.*?class=\"(x-ck12-element-box-body|x-ck12-element-box-header|x-ck12-element-box)\".*?>/g);
					var ebElements = content.match(ebPattern);
					if (ebElements != null) {
						for (var i = 0; i < ebElements.length; i++) {
							ebElement = ebElements[i]	
							content = content.replace(ebElement,'<p>');
						}
					}
				}
				tinyMCE.activeEditor.execCommand('mceInsertContent',false,content);
			});
	
		},

	_pasteInsideElementBox : function(ed) {
			var sc, ec;
                        ebClass       = ed.getParam("element_box_class");
                        ebHeaderClass = ed.getParam("element_box_header_class");
                        ebBodyClass   = ed.getParam("element_box_body_class");

			sc = ed.dom.getParent(ed.selection.getStart(), function(n) {
				return ed.dom.hasClass(n, ebClass) ||
					ed.dom.hasClass(n, ebHeaderClass) ||
					ed.dom.hasClass(n, ebBodyClass);
			});
			ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
				return ed.dom.hasClass(n, ebClass) ||
					ed.dom.hasClass(n, ebHeaderClass) ||
					ed.dom.hasClass(n, ebBodyClass);
			});
			if (sc && ec) {
				return true;
			} else {
				return false;
			}
	},	
            
	});

	// Register plugin
	tinymce.PluginManager.add('ck12paste', tinymce.plugins.CK12PastePlugin);
})();
