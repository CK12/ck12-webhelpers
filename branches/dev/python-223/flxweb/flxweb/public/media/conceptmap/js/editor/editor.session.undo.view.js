define([
    'exports',
    'jquery',
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.session.manager'
], function(exports, $, helpers, editorSessionManager){

    var $undoList = $('#editor-undo-widget');

    function template(d){
        return '' +
        '<li class="row undo-item">' +
            '<div class="column small-9 undo-titles">' +
                d.name + '<br>' +
                '<span class="undo-titles__subject">' + helpers.getSubject(d.EID) + '</span>' +
            '</div>' +
            '<div class="column small-3 undo-button">' +
                '<a href="#">Undo</a>' +
            '</div>' +
        '</li>';
    }

    function add(d){
        $undoList.find('ul').append(
            template(d)
        );

        $undoList.find('li a').last().on('click', undo);
        $undoList.removeClass('hide');
    }


    function undo() {
        var $parent = $(this).parent().parent('li'),
            $li     = $undoList.find('li'),
            index   = $li.index($parent);

        $li.eq(index).remove();
        editorSessionManager.undo(index, {
            editor: true,
            undo: true
        });

        if( !$undoList.find('li').length ){
            $undoList.addClass('hide');
        }
    }

    function clear(){
        $undoList.find('li').remove();
        $undoList.addClass('hide');
    }


    exports.add    = add;
    exports.clear  = clear;
});