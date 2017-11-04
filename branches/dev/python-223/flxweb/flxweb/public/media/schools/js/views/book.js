define([
    'underscore',
    'backbone1x',
    'marionette',
    'schools/templates/templates'
], function(_, Backbone, Mn, TMPL){
    'use strict';
    var BookView = Mn.ItemView.extend({
        defaults:{
          editMode:false
        },
        'template': _.template(TMPL.BOOK, null, {variable:'data'}),
        radio:  Backbone.Wreqr.radio.channel('global'),
        triggers: {
            //'touchstart .bookWrap' : {event:'toggleBookView', preventDefault:false},
            'touchmove .bookWrap' : {event:'stopToggleBookView', preventDefault:false},
            'mouseenter .bookWrapHoverElement' : {event:'bookHover', preventDefault:false},
            'mouseleave .bookWrapHoverElement' : {event:'bookHoverOut', preventDefault:false},
            //'click .bookLink' : {event: 'bookLinkClick',preventDefault: false}
        },
        events: {
            'touchstart .bookWrap' : 'onToggleBookView',
            'click .bookLink' : 'onBookLinkClick',
            'click .delete-book': 'onDeleteSchoolBook'
        },
        initialize: function(options){
            _.bindAll(this, "onBookLinkClick","onToggleBookView",'onDeleteSchoolBook');
            this.index = options.index;
            this.editMode = options.editMode
        },
        convertToElipsisString  : function(str, editMode){
            var len =  str.length;
            var maxLen  =  editMode ? 50 : 60;
            if( len < maxLen )return str;
            return str.slice(0, maxLen-3) + '...' ;
        },
        templateHelpers: function(){
            var _c = this,
                classname = "book_hide_large";
            if (_c.index == 2){
                classname = "book_hide_small";
            } else if(_c.index < 2) {
                classname = "";
            }
            var thumb = ( _c.model.get('cover') || '').replace('show/','show/THUMB_LARGE/');
            thumb = thumb.replace('http://', '//');
            var perma = _c.model.get('artifactPerma') || '';
            perma = perma.replace('http://', '//');
            return {
                artifactCoverThumb : thumb,
                classname: classname,
                artifactPerma : perma,
                editMode:_c.editMode,
                artifactTitleElipsis : _c.convertToElipsisString(_c.model.get('artifactTitle'), _c.editMode),
                artifactTitle : _c.model.get('artifactTitle')
            };
        },
        onToggleBookView: function(e){
            if(!$(e.target).hasClass('bookLink')){
                var _c = this;
                //set a toggle timeout
                _c.__tt = window.setTimeout(function(){
                    window.clearTimeout(_c.__tt);
                    _c.$('.bookWrap').toggleClass('flipped');
                }, 50);
            }
        },
        onStopToggleBookView: function(){
            var _c = this;
            //if user moves the touch too soon, don't toggle
            if(_c.__tt){
                window.clearTimeout(_c.__tt);
            }
        },
        onBookHover: function(){
            this.$('.bookWrap').addClass('flipped');
        },
        onBookHoverOut: function(){
            this.$('.bookWrap').removeClass('flipped');
        },
        onBookLinkClick: function(){
            this.radio.vent.trigger('bookClick', this);
        },
        onDeleteSchoolBook : function (e) { 
            this.radio.vent.trigger('SchoolPage-DeleteBook', this)
        }

    });
    return BookView;
});
