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
 * $Id$
 */
(function($) {

    function initLayout() {
        $('.js_browse_section').isotope({
            itemSelector: '.browsetitles',
            layoutMode : 'masonry',
            transformsEnabled: false
        });
    }

    function showConceptMap() {
        initConceptMap();
        $('#browse_tabs').data('map-initialized',true);
        $.flxweb.hideLoading();
    }

    function browse_domReady() {
        initLayout();
        $('#browse_tabs').tabs({
            'create': function(){
                $('#browse_tabs').find('ul').removeClass('hide');
            },
            'show': function(event, ui) {
                if (ui.index==1) {
                    var mapInitialized = $('#browse_tabs').data('map-initialized');
                    if (!mapInitialized) {
                        $.flxweb.showLoading('Initializing map');
                        //NOTE: the setTimeout is needed to avoid the tabs
                        //getting freezed.
                        setTimeout(showConceptMap,300);
                    }
                }
            }
        });
    }

    $(document).ready(browse_domReady);
    
})(jQuery)
