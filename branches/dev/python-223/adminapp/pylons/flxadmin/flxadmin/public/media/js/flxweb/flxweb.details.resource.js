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
 * This file originally written by Nachiket Karve
 *
 * $id$
 */
(function($) {

    function socialShareClick(){
        var socialNetworkName = $(this).data('name');
        $.flxweb.logADS('fbs_share', 'shared', 1, [artifactID, artifactRevisionID, ads_userid], [socialNetworkName]);
    }

    function openReader() {
        window.location.href= $('#readerlink').attr('data-readerurl');
        return false;
    }

    function showAddToLibrary() {
        //Create LibraryItem from current artifact in the details page
        var currentItem = new LibraryItem({resourceRevisionID:resourceRevisionID});
        //loop through current library labels associated with the artifact
        //and set the selectedLabels dictionary. Note, 1 mean selected 
        var selectedLabels = {};
        for (var i = 0; i < artifactLabels.length; i++) {
            var label = artifactLabels[i];
            selectedLabels[label]=1;
        }
        window.labelsChooser.open([currentItem],selectedLabels);
        return false;
    }

    function onAddedToLibrary(event,data) {
        if (data && data.resourceRevisionID == resourceRevisionID) {
            $('#addtolibrary').addClass('hide');
            $('#addtolibraryaction').addClass('hide');
            $('#addedtolibrary').removeClass('hide');
            //NAC: We should check with wei. Does he need bookmarking of resources ?
            //Log with ADS
            //$.flxweb.logADS('fbs_bookmark', 'bookmarked', 1, [data.resourceID, data.resourceRevisionID, ads_userid], []);
        }
    }

    function onRemovedFromLibrary(event,data) {
        if (data && data.resourceRevisionID == resourceRevisionID) {
            $('#addtolibrary').removeClass('hide');
            $('#addtolibraryaction').removeClass('hide');
            $('#addedtolibrary').addClass('hide');
        }
    }

    function domReady() {
        var startTime = new Date();
        $('#sharetwitter,#sharefacebook,#shareemail').click(socialShareClick);
        window.labelsChooser = new LabelsChooser({parent:$('#addtolibrary').parent()});
        $('#addtolibrary').click(showAddToLibrary);
        // Star aka (Add-To-Library) listeners
        $(document).bind('flxweb.library.label.applied',onAddedToLibrary);
        $(document).bind('flxweb.library.item.added',onAddedToLibrary);
        $(document).bind('flxweb.library.item.removed',onRemovedFromLibrary);
        // handler for starring aka fav/add-to-library
        $('#addtolibraryaction').click(function() {
            var currentItem = new LibraryItem({resourceRevisionID:resourceRevisionID});
            window.labelsChooser.addToLibrary([currentItem]);
            return false;
        });
        // handler for un-starring 
        $('#addedtolibrary').click(function() {
            var currentItem = new LibraryItem({resourceRevisionID:resourceRevisionID});
            window.labelsChooser.removeFromLibrary([currentItem]);
            return false;
        });
    }

    $(document).ready(domReady);
})(jQuery);
