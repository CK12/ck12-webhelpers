define([
    'underscore',
    'text!library/templates/library.main.html',
    'text!library/templates/library.category.html',
    'text!library/templates/library.categories.html',
    'text!library/templates/library.folders.html',
    'text!library/templates/library.createmenu.html',
    'text!library/templates/library.foldermanager.html',
    'text!library/templates/library.sort.html',
    'text!library/templates/library.item.html',
    'text!library/templates/library.item.label.html',
    'text!library/templates/library.filters.html',
    'text!library/templates/library.label.html',
    'text!library/templates/library.labelselect.html',
    'text!library/templates/library.emptyitems.html',
    'text!library/templates/library.ownership.html',
    'text!library/templates/library.googledocs.modal.html',
    'text!library/templates/library.worddocs.modal.html',
    'text!library/templates/library.coursegen.modal.html',
    'text!library/templates/library.coursegen.subject.html',
    'text!library/templates/library.coursegen.standardboard.html',
    'text!library/templates/library.coursegen.grade.html',
    'text!library/templates/library.googledoc.item.html',
    'text!library/templates/library.resource.editor.html',
    'text!library/templates/library.quiz.copy_modal.html'
], function (_, main, category, categories, folders, createMenu, folderManager, sort, item, itemLabel, filters, label, label_select, empty_items, ownership_filters,
		google_docs, word_docs, coursegen, subject, standardboard, grade, googleDocItem, resourceEditor,copyQuizModal) {
    'use strict';
    function _t(tmpl){
        return _.template(tmpl, null, {"variable":"data"});
    }
    return {
        'MAIN': _t(main),
        'CATEGORY': _t(category),
        'CATEGORIES': _t(categories),
        'FOLDERS': _t(folders),
        'CREATE_MENU': _t(createMenu),
        'FOLDER_MANAGER': _t(folderManager),
        'CONTENT_SORTER': _t(sort),
        'LIBRARY_ITEM': _t(item),
        'ITEM_LABEL': _t(itemLabel),
        'FILTERS': filters,
        'LABEL': _t(label),
        'LABEL_SELECT': _t(label_select),
        "OWNERSHIP_FILTERS": ownership_filters,
        'EMPTY_ITEMS': _t(empty_items),
        'GOOGLE_DOCS': _t(google_docs),
        'WORD_DOCS': _t(word_docs),
        'COURSEGEN': _t(coursegen),
        'SUBJECT': _t(subject),
        'STANDARDBOARD': _t(standardboard),
        'GRADE': _t(grade),
        'GOOGLEDOCITEM': _t(googleDocItem),
        'RESOURCE_EDITOR': _t(resourceEditor),
        'COPY_QUIZ_MODAL':_t(copyQuizModal)
    };
});