/**
 * Copyright 2007-2013 CK-12 Foundation
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
define(['jquery',
        'common/utils/url',
        'modality/controllers/concept'], 
function($, URL, ConceptModule){
    'use strict';
    function Modalities(){
        
        /*var modules = ['concept','modality'];*/
       /* var active_module_name = '';*/
        var active_module = null;
        
        function hashchange(){
            active_module.hashchange();
        }
        
        function init(){
            var url = new URL();
            var cm = new ConceptModule();
            //parse the URL and initialize the page
            active_module = cm;
            var params;
            if (url.path_fragments[0] === "c") {
                /* It is a collections */
                if (url.path_fragments[1].substring(0, 5) === "user:") {
                    params = {
                        'collectionHandle': url.path_fragments[2],
                        'creator': url.path_fragments[1].substring(5),
                        //'branch': url.path_fragments[2], //branch name can be different from collection
                        'conceptCollectionAbsoluteHandle': url.path_fragments[3],
                        'el': $("#modality_main")
                    };
                } else {
                    params = {
                        'collectionHandle': url.path_fragments[1],
                        'creator': 3,
                        //'branch': url.path_fragments[1], //branch name can be different from collection
                        'conceptCollectionAbsoluteHandle': url.path_fragments[2],
                        'el': $("#modality_main")
                    };
                }
            } else {
                params = {
                    'branch': url.path_fragments[0],
                    'handle': url.path_fragments[1],
                    'el': $("#modality_main")
                };
            }
            cm.init(params);
            $(window).on('hashchange',hashchange);
        }
        
        this.init = init;
    }
    
    return Modalities;
});
