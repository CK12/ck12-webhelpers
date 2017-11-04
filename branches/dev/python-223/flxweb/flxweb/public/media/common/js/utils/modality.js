//Common modality utility methods
define(function (require) {
    'use strict';

    var modalityGroups;
    var modalities;
    var modalityConfig;

    var modality = {
        bookTypes: {
            'book': 'FlexBook&#174; Textbooks',
            'tebook': 'Teacher Editions',
            'workbook': 'Workbooks',
            'labkit': 'Lab Kits',
            'quizbook': 'Quizzes and Tests'
        },
        getURLfromJSON: function (obj) {

            var branch, conceptHandle, modalityType, realm, modalityHandle, revision;

            function getParentHandle(obj) {
                if (!obj || !obj.parent) {
                    return '';
                }
                obj = obj.parent;
                if (obj.encodedID.match(/\./g) && 1 === obj.encodedID.match(/\./g).length) {
                    return obj.handle;
                }
                return getParentHandle(obj);
            }

            if (!obj || !obj.artifact) {
                return '';
            }
            obj = obj.artifact;
            realm = obj.realm;
            realm = realm ? realm + '/' : '';
            modalityHandle = obj.handle;
            modalityType = obj.artifactType;
            if (
                'book' === modalityType ||
                'tebook' === modalityType ||
                'workbook' === modalityType ||
                'labkit' === modalityType ||
                'quizbook' === modalityType ||
                'section' === modalityType
            ) {
                revision = obj.revisions && obj.revisions[0] ? obj.revisions[0].revision || '' : '';
                revision = revision ? 'r' + revision : '';
                if (!revision || !modalityType || !modalityHandle) {
                    return '';
                }
                return '/' + realm + modalityType + '/' + modalityHandle + '/' + revision + '/';
            }
            branch = getParentHandle(obj.domain);
            conceptHandle = obj.domain ? obj.domain.handle : '';
            branch = branch || 'na';
            if (!conceptHandle || !modalityType || !modalityHandle) {
                return '';
            }
            return '/' + branch.toLowerCase() + '/' + conceptHandle + '/' + modalityType + '/' + realm + modalityHandle + '/';
        },

        getModalityConfig: function () {
            if (!modalityConfig) {
                var modalityConfigJSON = require('text!modality/json/modality_config.json');
                modalityConfig = JSON.parse(modalityConfigJSON);
            }
            return modalityConfig;
        },

        getModalityIcon: function (type) {
            type = type.toLowerCase();
            var modalityIcon = {
                'read': 'icon-read',
                'video': 'icon-video',
                'activities': 'icon-activity',
                'study aids': 'icon-studyaid',
                'lesson plans': 'icon-lessonplans',
                'images': 'icon-images',
                'assessments': 'icon-exercise',
                'simulations': 'icon-simulations',
                'web links': 'icon-links',
                'real world': 'icon-rwa',
                'concept map': 'icon-mindmap',
                'plix': 'icon-interactive_practice',
                'interactive': 'icon-interactive_practice',
                'flexbook&#174 textbook': 'icon-book',
                'teacher editions': 'icon-book',
                'workbooks': 'icon-book',
                'lab kits': 'icon-book',
                'quizzes and tests': 'icon-book'
            };
            return modalityIcon[type] || 'icon-lightbulb';
        },

        getModalityGroupByType: function (type) {
            if (!modalityGroups) {
                modalityGroups = this.getModalityConfig().modality_groups;
            }

            if (!modalityGroups) {
                return 'undefined';
            }

            // to find the modality group, the resource type belongs to.
            var modalityGroup;
            for (var i = 0; i < modalityGroups.length; i++) {
                var group = modalityGroups[i];
                if (group.artifact_types.indexOf(type) !== -1) {
                    modalityGroup = group;
                    break;
                }
            }
            return modalityGroup;
        },

        getModalityByType: function (type) {
            if (!modalities) {
                modalities = this.getModalityConfig().modalities;
            }

            if (modalities && (type in modalities)) {
                return modalities[type];
            }
        },

        getModalityType: function (type) {
            if (this.bookTypes.hasOwnProperty(type)) {
                return this.bookTypes[type];
            }
            if (type == 'domain') {
                return 'Concepts';
            }
            // to find the modality group, the resource type belongs to.
            var modalityGroupType = 'Others';
            var group = this.getModalityGroupByType(type);
            if (group) {
                modalityGroupType = group.display_text;
            }
            return modalityGroupType;
        },

        getModalityGroups: function () {
            if (!modalityGroups) {
                modalityGroups = this.getModalityConfig().modality_groups;
            }

            if (!modalityGroups) {
                return 'undefined';
            }

            // to get all available modality groups
            var groups_arr = [];
            for (var i = 0; i < modalityGroups.length; i++) {
                var group = modalityGroups[i];
                var groupClassName = group.group_classname;
                if (!(groupClassName === 'all' || groupClassName === 'other')) {
                    groups_arr.push(groupClassName);
                }
            }
            return groups_arr;
        },

        /**
         * Returns the modality group classname
         */
        getModalityClassName: function (type) {
            // to get all available modality groups
            var groupClassName = 'all';
            var group = this.getModalityGroupByType(type);
            if (group) {
                groupClassName = group.group_classname;
            }
            return groupClassName;
        },

        /**
         * Returns the modality types for the specified group
         */
        getModalitiesFromGroup: function (group) {
            if (!modalityGroups) {
                modalityGroups = this.getModalityConfig().modality_groups;
            }

            if (!modalityGroups) {
                return '';
            }

            // to find the modalities present in a particular group.
            var modalities = '';
            for (var i = 0; i < modalityGroups.length; i++) {
                var item = modalityGroups[i];
                if (item.group_name === group) {
                    modalities = item.artifact_types;
                    break;
                }
            }
            return modalities;
        },

        getModalitySequence: function (type) {
            var groupSequence = 100;
            var group = this.getModalityGroupByType(type);
            if (group) {
                groupSequence = group.sequence;
            }
            return groupSequence;
        },

        getDefaultThumb: function (type) {
            var thumb = '';
            var group = this.getModalityGroupByType(type);
            if (group) {
                thumb = group.default_thumb;
            }
            return thumb;
        },

        getStudentShow: function (type) {
            var show = true;
            var modality = this.getModalityByType(type);
            if (modality) {
                show = modality.student_show;
            }
            return show;
        }
    };

    return modality;
});
