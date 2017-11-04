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
define(['jquery','jquery-ui','../lib/jquery-plugins/jquery.cookie','js/flxweb.jquery.plugins'],
function ($) {

    var mobileView = false;
    /**
     * Update or inserts the parameter in the passed queryString
     */
    function updateQueryParam(queryString,paramKey,paramValue) {
        var temp = queryString.split('?');
        var kvps = [];
        var existingParam = false;
        if (temp.length > 1) {
            kvps = temp[1].split('&');
        } else if (temp.length === 1) {
            kvps = temp[0].split('&');
        }

        for (var i=0;i<kvps.length;i++) {
            var kvp = kvps[i].split('=');
            if (kvp[0] === paramKey) {
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
    
    function searchResults() {
        var mQuery = '';
        $(".js_modality_filters").find('input:checked').each(function() {
            mQuery += "&m=" + $(this).val();
        });
        window.location = $(".js_modality_filters").data('search_url') + mQuery;
    }
    
    function onMFilterCheck(event) {
        var mCheckBox = $(this);
        if ( mCheckBox.is(':checked') && mCheckBox.val() === 'all') {
            resetFilters();
            mCheckBox.prop('checked', true);
        } else if ( mCheckBox.is(':checked') && mCheckBox.val() !== 'all') {
            $('.js_modality_filters input[id="all"]').attr('checked',false);
        }
    }
    
    function resetFilters() {
        $('.js_modality_filters').find('input').attr('checked',false);
    }
    
    function convertToSlug(text) {
        return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
    }
    
    function getSearchTerm(name, url){
          var regexS = "[\\?&]"+name+"=([^&#]*)";
          var regex = new RegExp( regexS );
          var tmpURL = (url === undefined) ? window.location.href : url;
          var results = regex.exec( tmpURL );
          if( results === null ) {
            return "";
          } else {
            return results[1];
          }
    }
    
    function searchADS(category, myLibrary) {
        var memberID, payload, params, referrer, autoComplete, searchTerm, modalities = [];
        params = window.location.href.split('referrer=');
        if (params[1]) {
            params = params[1].split('&autoComplete=');
            referrer = params[0];
            autoComplete = params[1]; 
        } else {
            referrer = 'search';
            autoComplete = 'false';
        }
        memberID = $('header').attr('data-user');
        $(".js_modality_filters").find('input:checked').each(function() {
            modalities.push($(this).val());
        });
        searchTerm = getSearchTerm('q', window.location.href);
        payload = {
                'searchTerm': searchTerm,
                'referrer': referrer,
                'autoComplete': autoComplete,
                'category': category,
                'myLibrary': myLibrary,
                'modalities': modalities,
                'resultsCount': $('.toptitleresulthint').attr('data-result-count')
        };
        if (window._ck12){
            _ck12.logEvent('FBS_SEARCH', payload);
        }
    }
    
    function searchHitADS(category, myLibrary, href) {
        var memberID, payload, searchTerm, modalities = [];
        memberID = $('header').attr('data-user');
        $(".js_modality_filters").find('input:checked').each(function() {
            modalities.push($(this).val());
        });
        searchTerm = getSearchTerm('q', window.location.href);
        payload = {
                'searchTerm': searchTerm,
                'memberID': memberID ? memberID : '2',
                'category': category,
                'myLibrary': myLibrary,
                'modalities': modalities,
                'clickedLink': href,
                'resultsCount': $('.toptitleresulthint').attr('data-result-count')
        };
        if (window._ck12){
            _ck12.logEvent('FBS_SEARCH_HIT', payload);
        }
    }
    
    function sethrefAttr() {
        var href;
        $('.category-filter').add('.content-type').each(function() {
            href = $(this).attr('href');
            href = href.replace(/[\\?&]referrer=([^&#]*)/, "").replace(/[\\?&]autoComplete=([^&#]*)/, "").replace(/search\/&/, 'search/?');
            $(this).attr('href', href);
        });
    }
    
    function updatePaginationLinks(href) {
        var regex, str = "[\\&]referrer=[^?&]+";
        regex = new RegExp(str);
        href = href.replace(regex, "");
        str = "[\\?&]autoComplete=[^?&]+";
        regex = new RegExp(str);
        href = href.replace(regex, "");
        href = href.replace(/\/search\/\&/,'/search/?');
        return href;
    }
    

    function search_domReady() {
        var category, myLibrary, href;
        sethrefAttr();
        category = convertToSlug($('.selected-category').text());
        myLibrary = $('.my-library').length ? 'true' : 'false';
        searchADS(category, myLibrary);
        if (window.innerWidth < 768) {
            mobileView = true;
            $('.resultfiltertitle .tip').removeClass('up');
        }
        $('.result_pagination a').each(function() {
            href = $(this).attr('href');
            href = updatePaginationLinks(href);
            $(this).attr('href', href);
        });
        $('#search_sortby').change(onSortByChange);
        $('.js_modality_filters').find('input').each(function(){
            $(this).change(onMFilterCheck);
        });
        $('#applyFilters').off("click.apply").on("click.apply", function() {
            searchResults();
        });
        $('#view_search_result a').off('click.ads').on('click.ads', function() {
            var myLibrary, category, href;
            category = convertToSlug($('.selected-category').text());
            myLibrary = $('.my-library').length ? 'true' : 'false';
            href = $(this).attr('href');
            searchHitADS(category, myLibrary, href);
        });
        $('.resultfiltertitle').off("click.filter").on("click.filter", function() {
            if (window.innerWidth < 768) {
                $('#content').toggleClass('hide');
                $('.paginationbottom').toggleClass('hide');
            } else {
                $('#content').removeClass('hide');
                $('.paginationbottom').removeClass('hide');
            }
            $('.resultfiltertitle .tip').toggleClass('up');
            if ($('.resultfiltercontainer').is(':hidden')) {
                $('.resultfiltercontainer').slideDown('slow');
            }
            else {
                $('.resultfiltercontainer').hide('slow');
            }
        });
        $(window).off('resize.resize').on('resize.resize', function() {
            if (window.innerWidth < 768) {
                if (!mobileView) {
                    $('.resultfiltercontainer').hide();
                    $('.resultfiltertitle .tip').removeClass('up');
                    mobileView = true;
                }
            } else {
                if (mobileView) {
                    $('.resultfiltertitle .tip').addClass('up');
                    $('.resultfiltercontainer').show();
                    $('#content').removeClass('hide');
                    $('.paginationbottom').removeClass('hide');
                    mobileView = false;
                }
            }
        });
    }
    $(document).ready(search_domReady);
});
