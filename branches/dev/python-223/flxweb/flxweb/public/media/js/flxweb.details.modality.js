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
 * $Id$
 */

define( 'flxweb.details.modality',
    ['jquery', 'underscore', 'backbone', 'flxweb.global',
    'flxweb.modality_views','flxweb.utils.base64', 'flxweb.reviews', 
    'jquery-ui', 'flxweb.settings', 'jquery.isotope'],
    function($, _, Backbone, Global, mv, Base64, ReviewsModule) {
        
        $(document).ready(function() {
            var mdv, modality_data;
            modality_data = window.js_modality_data;
            mdv = new mv.ModalityDetailsView(modality_data);
            if(window.artifactID){
            	window.myReview = new ReviewsModule.MyReviewView({el:$('#myreview'),artifactID:window.artifactID});
            	$('#review_list_container').bind('flxweb.modality.read.initreviewlist',initReviewList);
            }
        });
        
        function initReviewList() {
        	if(window.artifactID){
        		var reviews = new ReviewsModule.ReviewsListView({el:$('#reviews'),artifactID:window.artifactID,myReviewView:window.myReview});
        	}
        }
    }
);
