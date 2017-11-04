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

    /**
     * Update or inserts the parameter in the passed queryString
     */
    function updateQueryParam(queryString,paramKey,paramValue) {
        var temp = queryString.split('?');
        var kvps = []
        var existingParam = false;
        if (temp.length > 1) {
            kvps = temp[1].split('&')
        } else if (temp.length == 1) {
            kvps = temp[0].split('&')
        }

        for (var i=0;i<kvps.length;i++) {
            var kvp = kvps[i].split('=');
            if (kvp[0] == paramKey) {
                kvp[1] = paramValue; 
                kvps[i] = kvp.join('=');
                existingParam = true;
                break;
            }
        }
        
        if (!existingParam) {
            kvps[kvps.length] = [paramKey,paramValue].join('=');
        }
        return kvps.join('&');
    }
    
    function onSortByChange() {
        // when sort changes, reset the pageNum to 1
        var newQueryString = updateQueryParam(window.location.search,'pageNum',1);
        // add/update the sort parameter and set the browser URL
        newQueryString = updateQueryParam(newQueryString,'sort',$(this).val());
        window.location.search = newQueryString;
    }

    function search_domReady() {
        $('#search_sortby').change(onSortByChange);
    }

    $(document).ready(search_domReady);
})(jQuery);
