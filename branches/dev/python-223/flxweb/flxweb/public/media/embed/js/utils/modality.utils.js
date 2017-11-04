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
define(['underscore'],
function(_){
    'use strict';
    var utils = {};

    utils.modalityIsResource = function(modality){
        /**
         * returns True if ModalityArtifact is a resource
         */

        if (_.contains(['lesson','concept'],modality.artifactType)){
            return false; //lessons are ALWAYS xhtml based.
        } else {
            if (modality.hasXhtml){
                return false;
            }
        }
        return true;
    };

    utils.getModalityRevision = function(modality){
        var revision = null;
        if (modality.revisions && modality.revisions.length){
            revision = modality.revisions[0];
        }
        return revision;
    };

    utils.getModalityResource = function(modality){
        /**
         * returns the modality resource.
         */
        var resource = null, rev;
        rev = utils.getModalityRevision(modality);
        if (rev && rev.attachments){
            resource = rev.attachments[0];
        }
        return resource;
    };

    utils.resourceIsEmbed = function(resource){
        return !!(resource.embeddedObject);
    };

    utils.hasAnswerKeys = function(modality){
        return _.contains(['activity', 'lab', 'lessonplanx','lessonplan', 'postread', 'prepostread', 'whileread', 'worksheet'], modality.artifactType);
    };

    utils.getRenderType = function(modality){
        //returns render type for a modality
        var rendertype = 'read', resource;
        var artifactType = modality.artifactType;
        if (artifactType === 'exerciseint'){ //exerciseint objects are ck-12 produced ILOs, they need to be rendered differently to enable ADS tracking for ILO events
            rendertype = 'ilo';
        } else if (artifactType === 'exercise'){ //template for HWP exercises
            rendertype = 'exercise';
        } else if (artifactType === 'asmtpractice'){ //template for Assessment Engine practices
            rendertype = 'asmtpractice';
        } else if (artifactType === 'asmtpracticeint'){ //template for Assessment Engine interactive practices
            rendertype = 'asmtpracticeint';
        } else if (artifactType === 'asmtquiz'){ //template for Assessment Engine quiz
            rendertype = 'asmtquiz';
        } else if (modality.hasXhtml){ // if artifact has xhtml, it is user created modality and use read template with edit and download actions.
            rendertype = 'read';
        } else if (artifactType === 'quiz'){ //template for quiz modality detail page
            rendertype = 'quiz';
        } else if ( artifactType === 'rwa'){ //template for xhtml based real world applications. similar to read but with less actions.
            if (self.get_modality_resource()){
                resource = self.get_modality_resource();
                if (resource && utils.resourceIsEmbed(resource)){
                    rendertype = 'embed';
                } else if (resource && resource.isExternal ){
                    rendertype = 'link';
                } else{
                    rendertype = 'download';
                }
            }

        } else if ( utils.modalityIsResource(modality) && utils.getModalityResource(modality) ){
            resource = utils.getModalityResource(modality);
            if (resource && utils.resourceIsEmbed(resource)){
                rendertype = 'embed';
            } else if (resource && resource.isExternal){
                rendertype = 'link';
            } else{
                rendertype = 'download';
            }
        }
        return rendertype;
    };

    return utils;
});
