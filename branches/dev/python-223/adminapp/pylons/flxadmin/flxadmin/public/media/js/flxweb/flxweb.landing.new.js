/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Ravi Gidwani
 *
 * $Id: flxweb.landing2.js 12422 2011-08-19 22:51:58Z ravi $
 */

(function($) {

	function showVideoDialog() {
    var embed_code = '<iframe src="http://player.vimeo.com/video/37698512?title=0&amp;byline=0&amp;portrait=0&amp;autoplay=1" width="600" height="338" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
    $.flxweb.showDialog(embed_code,{'width':'655px','title':'Quick Start Guide','buttons':null})
	}

	function domReady() {
		// Initialize Slides
		$('#slides').slides({
			preload : true,
			preloadImage : 'img/loading.gif',
			patination: false,
			generatePagination : true,
			play : 5000,
			pause : 2500,
			hoverPause : true,
			// Get the starting slide
			start : 1
		});
	}

	$("#btn_videodialog").click(showVideoDialog);
	$(document).ready(domReady);

})(jQuery);
