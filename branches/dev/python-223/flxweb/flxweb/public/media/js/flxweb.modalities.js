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
 * $ID$
 */
define('flxweb.modalities',['jquery', 'underscore', 'backbone', 'flxweb.global', 'flxweb.modality_views', 
        'jquery-ui', 'flxweb.settings','jquery.isotope'],

function ($, _, Backbone, Global, mv){

    $(document).ready(function() {
        var modality_data = window.js_modality_data;
        window.modality_data = modality_data;
        new mv.ModalitiesRouter({'modality_data': modality_data});
        Backbone.history.start();
    });

});
