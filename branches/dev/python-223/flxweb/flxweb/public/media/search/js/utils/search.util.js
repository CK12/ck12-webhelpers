//Common search utility methods
define(function () {
    'use strict';

    var search = {
        getSearchTypeGroups: function () {
            // label: display label
            // value: value for search API
            return {
                'label': ['Concepts', 'Read', 'Simulations', 'PLIX', 'Interactive', 'Video', 'Activities', 'Study Aids', 'Lesson Plans', 'Images',
                    'Assessments', 'Web Links', 'Concept Map', 'Real World', 'FlexBook&#174; Textbooks', 'Teacher Editions', 'Workbooks',
                    'Quizzes and Tests', 'Lab Kits'
                ],
                'value': ['concept', 'read', 'simulations', 'plix', 'interactive', 'video', 'activities', 'studyaids', 'teaching_resource', 'images',
                    'assessment', 'web', 'mindmap', 'rwa', 'book', 'tebook', 'workbook',
                    'quizbook', 'labkit'
                ]
            };
        },
        getModalityBlockTypes: function () {
            // modality types to be excluded
            return ['rwaans', 'labans', 'worksheetans', 'activityans', 'prereadans', 'postreadans', 'whilereadans', 'prepostreadans',
                'concept', 'rubric', 'lessonplanx', 'lessonplanxans', 'lessonplanans', 'attachment', 'audio', 'quizans'
            ];
        },
        getModalityMapping: function () {
            // value: URL options: category
            // mapping: group_name from modality xml
            return {
                'value': ['read', 'rwa', 'video', 'activities', 'studyaids', 'assessment', 'mindmap', 'web', 'images', 'teaching_resource', 'simulations', 'interactive', 'plix'],
                'mapping': ['Read', 'Real World', 'Video', 'Activities', 'Study Aids', 'Assessments', 'Mind Map', 'Web Links', 'Images', 'Lesson Plans', 'Simulations', 'Interactive', 'PLIX']
            };
        },
        getSearchableBookTypes: function () {
            // book types allowed for search
            return ['book', 'tebook', 'workbook', 'labkit', 'quizbook'];
        },
        getSortOptions: function () {
            // URL options: sort
            return {
                'label': ['Relevance', 'Title:A-Z', 'Title:Z-A', 'Most Recent', 'Least Recent'],
                'value': ['score', 'stitle,asc', 'stitle,desc', 'modified,desc', 'modified,asc']
            };
        },
        getSpecialSearchFields: function () {
            // URL options: special search
            return {
                'value': ['tag:', 'subject:', 'grade:', 'author:', 'domain:', 'searchTerm:'],
                'mapping': ['tags.ext:', 'subjects.ext:', 'gradeLevels.ext:', 'authors:', 'domains.ext:', 'searchTerms.ext:']
            };
        },
        getGradeFields: function () {
            // displayed grade list
            return {
                'label': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
                'value': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
            };
        },
        getSubjectFields: function () {
            // displayed subject list
            return {
                'Math': {
                    'label': ['Arithmetic', 'Measurement', 'Algebra', 'Geometry', 'Probability', 'Statistics', 'Trigonometry', 'Analysis', 'Calculus'],
                    'value': ['arithmetic', 'measurement', 'algebra', 'geometry', 'probability', 'statistics', 'trigonometry', 'analysis', 'calculus']
                },
                'Science': {
                    'label': ['Earth Science', 'Life Science', 'Physical Science', 'Biology', 'Chemistry', 'Physics'],
                    'value': ['earth-science', 'life-science', 'physical-science', 'biology', 'chemistry', 'physics']
                },
                'English': {
                    'label': ['Spelling', 'Writing'],
                    'value': ['spelling', 'writing']
                },
                'More': {
                    'label': ['Health', 'Engineering', 'Technology', 'Astronomy', 'History'],
                    'value': ['health', 'engineering', 'technology', 'astronomy', 'history']
                }
            };
        },
        getCountryFields: function () {

            return {
                'label': ['India'],
                'value': ['india']
            }
        }

    };

    return search;
});
