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
 * This file originally written by $Author$
 *
 * $Id$
 */

(function($) {

	// Callback function to fire ADS event
	$.flxweb.logScribleEvent = function (action) {
		try {
			var ops = { "note-added": 1, "note-removed": -1, "highlight-added": 1, "highlight-removed": -1 };
			if (action in ops)
				$.flxweb.logADS("fbs_" + action.split('-')[0], 'count', ops[action], [artifactID, artifactRevisionID, ads_userid], []);
		} catch (e) {
			console.error(e);
		}
	};
	

})(jQuery);

// Register Scrible callbacks
var SkribelCallbacks=SkribelCallbacks || [];
SkribelCallbacks.push(["highlight-added", function(data) { $.flxweb.logScribleEvent("highlight-added"); }]);
SkribelCallbacks.push(["highlight-removed", function(data) { $.flxweb.logScribleEvent("highlight-removed") ;}]);
SkribelCallbacks.push(["note-added", function(data) { $.flxweb.logScribleEvent("note-added"); }]);
SkribelCallbacks.push(["note-removed", function(data) { $.flxweb.logScribleEvent("note-removed"); }]);
