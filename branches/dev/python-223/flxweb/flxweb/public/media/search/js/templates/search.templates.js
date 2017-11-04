define([
    'text!search/templates/search.main.html',
    'text!search/templates/category.filter.html',
    'text!search/templates/category.filter.small.html',
    'text!search/templates/grade.filter.html',
    'text!search/templates/grade.filter.small.html',
    'text!search/templates/country.filter.html',
    'text!search/templates/country.filter.small.html',
    'text!search/templates/subject.filter.html',
    'text!search/templates/subject.filter.small.html',
    'text!search/templates/content.filter.html',
    'text!search/templates/search.header.html',
    'text!search/templates/search.list.html',
    'text!search/templates/search.pagination.html',
    'text!search/templates/search.zero.results.html'
], function (main, category_filter, category_filter_small, grade_filter, grade_filter_small, country_filter, country_filter_small, subject_filter, subject_filter_small, content_filter, search_header, search_list, search_pagination, search_zero_results) {
    'use strict';
    return {
        'main': main,
        'category_filter': category_filter,
        'category_filter_small': category_filter_small,
        'grade_filter': grade_filter,
        'grade_filter_small': grade_filter_small,
        'country_filter': country_filter,
        'country_filter_small': country_filter_small,
        'subject_filter': subject_filter,
        'subject_filter_small': subject_filter_small,
        'content_filter': content_filter,
        'search_header': search_header,
        'search_list': search_list,
        'search_pagination': search_pagination,
        'search_zero_results': search_zero_results
    };
});