define(['jquery', 'underscore', 'common/utils/utils', 'text!cbse/templates/cbse.book.wrapper.html'], function ($, _, util, individualBook) {
    'use strict';

    var cbse_books = {
        'Maths': [
            {
                'perma': '/book/CBSE-Maths-Book-Class-9',
                'handle': 'CBSE-Maths-Book-Class-9',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868665-68-81-india_math_09.png',
                'title': 'CK-12 CBSE Maths Class 9'
            },
            {
                'perma': '/book/CBSE-Maths-Book-Class-10',
                'handle': 'CBSE-Maths-Book-Class-10',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868233-42-23-india_math_10.png',
                'title': 'CK-12 CBSE Maths Class 10'
            },
            {
                'perma': '/book/CBSE_Maths_Book_Class_11',
                'handle': 'CBSE_Maths_Book_Class_11',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868823-04-79-india_math_11.png',
                'title': 'CK-12 CBSE Maths Class 11'
            },
            {
                'perma': '/book/CBSE-Maths-Book-Class-12',
                'handle': 'CBSE-Maths-Book-Class-12',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868868-6-48-india_math_12.png',
                'title': 'CK-12 CBSE Maths Class 12'
            }
        ],
        'Biology': [
            {
                'perma': '/book/CBSE_Biology_Book_Class_9',
                'handle': 'CBSE_Biology_Book_Class_9',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868276-48-66-india_biology_grade-09.png',
                'title': 'CK-12 CBSE Biology Class 9'
            },
            {
                'perma': '/book/CBSE_Biology_Book_Class_X',
                'handle': 'CBSE_Biology_Book_Class_X',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868319-19-11-india_biology_grade-10.png',
                'title': 'CK-12 CBSE Biology Class 10'
            },
            {
                'perma': '/book/CBSE_Biology_Book_Class_XI',
                'handle': 'CBSE_Biology_Book_Class_XI',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456869023-11-1-india_biology_grade-11.png',
                'title': 'CK-12 CBSE Biology Class 11'
            },
            {
                'perma': '/book/CBSE_Biology_Book_Class_XII',
                'handle': 'CBSE_Biology_Book_Class_XII',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868363-34-50-india_biology_grade-12.png',
                'title': 'CK-12 CBSE Biology Class 12'
            }
        ],
        'Chemistry': [
            {
                'perma': '/book/CBSE_Chemistry_Book_Class_IX',
                'handle': 'CBSE_Chemistry_Book_Class_IX',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868992-52-95-india_chemistry_grade09.png',
                'title': 'CK-12 CBSE Chemistry Class 9'
            },
            {
                'perma': '/book/CBSE-Chemistry-Book-Class-X',
                'handle': 'CBSE-Chemistry-Book-Class-X',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868909-6-33-india_chemistry_grade10.png',
                'title': 'CK-12 CBSE Chemistry Class 10'
            },
            {
                'perma': '/book/CBSE-Chemistry-Book-Class-11',
                'handle': 'CBSE-Chemistry-Book-Class-11',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868080-83-18-india_chemistry_grade11.png',
                'title': 'CK-12 CBSE Chemistry Class 11'
            },
            {
                'perma': '/book/CBSE_Chemistry_Book_Class_XII',
                'handle': 'CBSE_Chemistry_Book_Class_XII',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868745-97-1-india_chemistry_grade12.png',
                'title': 'CK-12 CBSE Chemistry Class 12'
            }
        ],
        'Physics': [
            {
                'perma': '/book/CBSE_Physics_Book_Class_IX',
                'handle': 'CBSE_Physics_Book_Class_IX',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868784-6-88-india_physics_grade09.png',
                'title': 'CK-12 CBSE Physics Class 9'
            },
            {
                'perma': '/book/CBSE-Physics-Book-Class-X',
                'handle': 'CBSE-Physics-Book-Class-X',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868705-79-100-india_physics_grade10.png',
                'title': 'CK-12 CBSE Physics Class 10'
            },
            {
                'perma': '/book/CBSE_Physics_Book_Class_XI',
                'handle': 'CBSE_Physics_Book_Class_XI',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868139-97-53-india_physics_grade11.png',
                'title': 'CK-12 CBSE Physics Class 11'
            },
            {
                'perma': '/book/CBSE_Physics_Book_Class_XII',
                'handle': 'CBSE_Physics_Book_Class_XII',
                'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868009-18-25-india_physics_grade12.png',
                'title': 'CK-12 CBSE Physics Class 12'
            }
        ]
    };
    function CBSEBOOKS() {
        function bindEvents() {
            $('.subject-selector').off('click').on('click', function() {
                var subject, updatedUrl;
                subject = $(this).data('subject');
                if ($('.'+subject+'-container').length) {
                    $('.subject-container').addClass('hide');
                    $('.subject-header').addClass('hide');
                    $('.'+subject+'-container').removeClass('hide');
                    updatedUrl = updateQueryStringParameter(window.location.href, 'subject', subject);
                    history.replaceState({}, document.title, updatedUrl);
                } else {
                    $('.subject-container').removeClass('hide');
                    $('.subject-header').removeClass('hide');
                }
                $('#dropSubjects').removeClass('open').css({
                    left: '-99999px'
                });
            });
            $('.grade-selector').off('click').on('click', function() {
                var grade;
                grade = $(this).data('grade');
                if ($('.'+grade+'-grade-container').length) {
                    $('.grade-container').addClass('hide');
                    $('.'+grade+'-grade-container').removeClass('hide');
                } else {
                    $('.grade-container').removeClass('hide');
                }
                $('#dropGrades').removeClass('open').css({
                    left: '-99999px'
                });
            });
            $('#dropSubjects').off('click').on('click', '.subject-selector', function() {
                $('#selectSubjects').html($(this).find('a').text() + '<span></span>');
            });
            $('#dropGrades').off('click').on('click', '.grade-selector', function() {
                $('#selectGrades').html($(this).find('a').text() + '<span></span>');
            });
        }
        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
            var separator = uri.indexOf('?') !== -1 ? '&' : '?';
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + '=' + value + '$2');
            }
            else {
                return uri + separator + key + '=' + value;
            }
        }
        function queryParam(name) {
            name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
            var regexS = '[\\?&]' + name + '=([^&#]*)',
                regex = new RegExp(regexS),
                results = regex.exec(window.location.search);
            if (results) {
                return decodeURIComponent(results[1].replace(/\+/g, ' '));
            }
            return '';
        }
        function renderBooks() {
            var detailTemplate, subject, validSubjects = [], htmlstring = '';
            validSubjects = ['Maths', 'Biology', 'Chemistry', 'Physics'];
            detailTemplate = _.template(individualBook, null, {
                'variable': 'data'
            });
            htmlstring = detailTemplate({
                'model': cbse_books
            });
            $('#cbse_contentwrap').append(htmlstring);
            bindEvents();
            subject = queryParam('subject');
            if (validSubjects.indexOf(subject) != -1) {
                $('[data-subject="'+ subject +'"]').trigger('click');
            }
        }
        function load() {
            renderBooks();
        }
        this.load = load;
    }

    return new CBSEBOOKS();
});
