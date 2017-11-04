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

define( 'flxweb.details.modality.exercise',
    ['jquery', 'underscore', 'backbone', 'flxweb.global', 
    'flxweb.modality_views', 'flxweb.exercise.clock', 'flxweb.exercise.common',  'flxweb.exercise.quiz','flxweb.utils.base64',
    'jquery-ui', 'flxweb.settings'], 
    function($, _, Backbone, Global, mv, Clock, ExerciseModule, Quiz, Base64) {
        'use strict';
        
        var ExerciseModalityDetailsView = mv.ModalityDetailsView.extend({
            'initialize': function(options){
                var self = this;
                ExerciseModalityDetailsView.__super__.initialize.call(this, options);
            }
        });
        $(document).ready(function() {
            var mdv, modality_data;
            modality_data = window.js_modality_data;
            window.artifact_json = modality_data.artifact;
            mdv = new ExerciseModalityDetailsView(modality_data);
            ExerciseModule.initExercise();
        });
    }
);
