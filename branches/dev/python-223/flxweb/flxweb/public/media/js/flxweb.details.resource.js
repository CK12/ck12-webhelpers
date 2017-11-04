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
define('flxweb.details.resource',[
    'jquery',
    'jquery-ui',
    'flxweb.global',
    'flxweb.library.common',
    'flxweb.edit.resource',
    'flxweb.reviews'
],
function($,UI,global,Library,ResourceModule,ReviewsModule) {
    var adsVisitTime = new Date().getTime();
    function socialShareClick(){
        var socialNetworkName = $(this).data('name');
        var payload = {};
        payload['artifactID'] = artifactID;
        payload['memberID'] = ads_userid;
        payload['shared'] = 1;
        payload['social_network'] = socialNetworkName;
        $.flxweb.logADS('fbs_share', payload);

        //$.flxweb.logADS('fbs_share', 'shared', 1, [artifactID, artifactRevisionID, ads_userid], [socialNetworkName]);
    }

    function openReader() {
        window.location.href= $('#readerlink').attr('data-readerurl');
        return false;
    }

    function showAddToLibrary() {
        //Create LibraryItem from current artifact in the details page
        var currentItem = new Library.LibraryItem({resourceRevisionID:resourceRevisionID});
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
        adsVisitTime = new Date().getTime();
        $('#sharetwitter,#sharefacebook,#shareemail').click(socialShareClick);
        window.labelsChooser = new Library.LabelsChooser({parent:$('#addtolibrary').parent()});
        $('#addtolibrary').click(showAddToLibrary);
        // Star aka (Add-To-Library) listeners
        $(document).bind('flxweb.library.label.applied',onAddedToLibrary);
        $(document).bind('flxweb.library.item.added',onAddedToLibrary);
        $(document).bind('flxweb.library.item.removed',onRemovedFromLibrary);
        // handler for starring aka fav/add-to-library
        $('#addtolibraryaction').click(function() {
            var currentItem = new Library.LibraryItem({resourceRevisionID:resourceRevisionID});
            window.labelsChooser.addToLibrary([currentItem]);
            return false;
        });
        // handler for un-starring 
        $('#addedtolibrary').click(function() {
            var currentItem = new Library.LibraryItem({resourceRevisionID:resourceRevisionID});
            window.labelsChooser.removeFromLibrary([currentItem]);
            return false;
        });
        
        // ADS tracks visit to a modality details page
        if (artifactID && artifactRevisionID && context_eid){
	    var payload = {};
            payload['artifactID'] = artifactID;
            payload['memberID'] = ads_userid;
            payload['context_eid'] = context_eid;
            payload['modality_type'] = modality_type;
            payload['user_role'] = flxweb_role;
            $.flxweb.logADS('fbs_modality', payload);

            //$.flxweb.logADS('modality','visited',1,[artifactID,artifactRevisionID,ads_userid],[modality_type,context_eid,flxweb_role]);
        } 
       	
        window.editResourceDialog.bind('flxweb.resource.edit.link.click',window.editResourceDialog.resourceDetailsEditLink);
        window.editResourceDialog.bind('flxweb.resource.update.onsuccess',window.editResourceDialog.reloadResourceDetailsPage);
        
        //Reviews
        if(artifactID){
            var myReview = new ReviewsModule.MyReviewView({el:$('#myreview'),artifactID:artifactID});
            var reviews = new ReviewsModule.ReviewsListView({el:$('#reviews'),artifactID:artifactID,myReviewView:myReview});
        }
    }

    $(document).ready(domReady);
    
    $(window).unload(function() {
  		// ADS tracks time spent by a user on a modality
  		if (artifactID && artifactRevisionID && context_eid){
		        var payload = {};
		        payload['artifactID'] = artifactID;
		        payload['memberID'] = ads_userid;
		        payload['context_eid'] = context_eid;
		        payload['modality_type'] = modality_type;
		        payload['user_role'] = flxweb_role;
		        $.flxweb.logADS('fbs_modality', payload);

           	//$.flxweb.logADS('modality','time_spent',get_ads_time_spent(),[artifactID,artifactRevisionID,ads_userid],[modality_type,context_eid,flxweb_role]);
  		}
	});
	
    function get_ads_time_spent() {
        if(isNaN(adsVisitTime)){
         adsVisitTime = new Date().getTime();
        }
        var time_spent = Math.round((new Date().getTime() - adsVisitTime)/1000);
        return isNaN(time_spent)?0:time_spent;
    }
	
});
