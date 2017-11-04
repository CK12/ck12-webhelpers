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
define('flxweb.modality_models', 
       ['jquery', 'underscore', 'backbone', 'flxweb.global', 'flxweb.models.artifact', 
        'flxweb.settings'],

function ($, _, Backbone, Global, Artifact){

    ModalityArtifact = Artifact.extend({
    },{
        'modality_sizes': ['xlarge', 'large', 'med', 'small'],
        'MODALITY_SIZE_XLARGE' : 'xlarge',
        'MODALITY_SIZE_LARGE' : 'large',
        'MODALITY_SIZE_MEDIUM' : 'med',
        'MODALITY_SIZE_SMALL' : 'small'
    });
    
    ModalityArtifactCollection = Backbone.Collection.extend({
        'model': ModalityArtifact,
        'initialize': function(data, options) {
            if (options && options.concept_handle) {
                this.url = '/ajax/modalities/' + options.concept_handle;
            }
        },

        'parse': function(resp) {
            var modalities = [];
            if (resp.modalities){
                modalities = resp.modalities;
            }
            return modalities;
        }

    });
    
    ModalityGroup = Backbone.Model.extend({
        'initialize': function(obj){
            if (!obj.count){
                this.set('count', 0);
            }
            this.set('show_text_label', obj.show_text_label || null);
        }
    });
    
    ModalityGroups = Backbone.Collection.extend({
        'model': ModalityGroup,

        'type_to_group': {},

        'getModalityGroupForArtifactType': function(artifact_type, artifacts){
            var modality_group = null, group_types;
            //try to get from cache
            modality_group = this.type_to_group[artifact_type];
            
            if (!modality_group){
                _.find(this.models,function(model){
                    if ( _.include(model.get('artifact_types'), artifact_type)  ){
                        modality_group = model;
                    }
                });
                if (!modality_group){
                    modality_group = new ModalityGroup({'name': 'unknown', artifact_types:[]}) //create a dummy group
                    group_types = modality_group.get('artifact_types');
                    group_types.push(artifact_type);
                    modality_group.set('artifact_types',group_types);
                }
                //add to cache
                this.type_to_group[artifact_type] = modality_group;
            }
            
            return modality_group;
        }

    });

    return {
        ModalityArtifact: ModalityArtifact,
        ModalityArtifactCollection: ModalityArtifactCollection,
        ModalityGroup: ModalityGroup,
        ModalityGroups: ModalityGroups
    };
});