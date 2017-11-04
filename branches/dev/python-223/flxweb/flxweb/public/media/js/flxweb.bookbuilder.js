/**
 * Copyright 2007-2012 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Ravi Gidwani
 *
 * $Id$
 */
define('flxweb.bookbuilder', ['backbone', 'jquery', 'common/utils/utils','flxwebSave/APIUtil', 'flxwebSaveAdaptor','jquery-ui', 'flxweb.global', 'flxweb.models.artifact'],
    function (Backbone, $, Util, APIUtil, flxwebSaveAdaptor) {

        'use strict';

        var BookbuilderModule = {};

        BookbuilderModule.Book = Backbone.Model.extend({
            urlRoot: '/ajax/bookbuilder/books/',
            defaults: {
                'thumbnail': '/media/images/thumb_dflt_flexbook_sm.png',
                'title': '',
                'id': 'new',
                'artifactType':'book' // @Added By: pratyush : ADDED FOR NEW FLEXBOOK CREATION WHILE ADDING A MODALITY INTO THIS FLEXBOOK
            },
            sync: function(method, model, options) {
                options.beforeSend = function (xhr) {
                    if (this.type === 'PUT' || this.type === 'POST') {
                        this.data = Util.b64EncodeUnicode(this.data);
                        this.contentType = 'text/plain';
                        xhr.setRequestHeader( 'Content-type', 'text/plain' );
                    }
                };
                return Backbone.sync(method, model, options);
            },
            initialize: function () {
                // if no children attribute, create an empty array
                if (!this.get('children')) {
                    this.set('children', []);
                }
                if (this.get('coverImageThumbSmall')) {
                    this.set('thumbnail', this.get('coverImageThumbSmall'));
                }
            },
            formSaveAPIRequest : function(){
              var json = Backbone.Model.prototype.toJSON.call(this);
              return flxwebSaveAdaptor.saveAdaptor(json);
            }
        });

        BookbuilderModule.BooksList = Backbone.Collection.extend({
            model: BookbuilderModule.Book,
            url: '/ajax/bookbuilder/books/',
            parse: function (response) {
                if (response.hasOwnProperty('books')) {
                    return response.books;
                }
                return [];
            }

        });

        BookbuilderModule.NewBookView = Backbone.View.extend({
            events: {
                'click': 'onClick',
                'keyup #newBookTitle': 'onTitleChange'
            },
            onClick: function () {
                // reset any previous selected attributes
                var i, model;
                for (i = 0; i < this.model.collection.length; i++) {
                    model = this.model.collection.at(i);
                    if (this.model !== model) {
                        model.set({
                            'selected': false,
                            silent: true
                        });
                    }
                }
                this.model.set({
                    'selected': true
                });
                this.$(':radio').prop('checked', true);
                return false;
            },
            onTitleChange: function (e) {
                this.model.set({
                    'title': $('#newBookTitle').val()
                });
                if (e.which == 13 || e.keyCode == 13) {
                    $('.add-to-book-wrapper button:last-child').trigger('click');
                }
            },
            render: function () {
                var template = _.template($('#tmpl_atb_new_book').html());
                this.setElement(template(this.model.toJSON()), true);
                return this;
            },
            destroy: function () {
                $(this.el).remove();
            }
        });


        BookbuilderModule.BookView = Backbone.View.extend({
            events: {
                'click': 'onClick'
            },
            onClick: function () {
                this.model.set({
                    'selected': true
                });
                this.$(':radio').prop('checked', true);
            },
            render: function () {
                var template = _.template($('#tmpl_atb_book').html());
                this.setElement(template(this.model.toJSON()), true);
                return this;
            },
            destroy: function () {
                $(this.el).remove();
            }
        });

        BookbuilderModule.BookbuilderView = Backbone.View.extend({
            tagName: 'div',
            events: {
                // Bug 8911 - Removed 'Load More' button
                //'click #atb_loadmore': 'loadMore',
                'click #atb_search_btn': 'onSearch'
            },
            initialize: function () {
                //exit if the element does not exist
                if ($(this.options.target).length === 0) {
                    return;
                }
                var self = this;
                //get the current artifact i.e. the artifact you are adding
                this.currentArtifact = {
                    'artifactRevisionID': $(this.options.target).data('artifactrevisionid'),
                    'id': $(this.options.target).data('artifactid'),
                    'artifactType': $(this.options.target).data('artifacttype'),
                    'title': $(this.options.target).data('title'),
                    'added': true
                };

                this.url = '/dialog/addtobook/';
                $(self.el).attr('data-dialogueparentclass', 'js_ck12_dialog_common add-to-book-wrapper');
                $(this.el).load(this.url, function () {
                    self.dialog = $.flxweb.createDialog($(self.el), {
                        'title': $.flxweb.gettext('Add to your FlexBook&#174;'),
                        'height': 500,
                        'width': 500,
                        'buttons': {
                            'Cancel': function () {
                                $(this).dialog('close');
                            },
                            'OK': function () {
                                self.trigger('flxweb.bookbuilder.ok');
                            }
                        }
                    });

                    self.dialog.bind('scroll', function () {
                        var scrolltop = self.dialog.scrollTop(),
                            scrollheight = self.dialog.prop('scrollHeight'),
                            windowheight = self.dialog.prop('clientHeight');
                        if (scrolltop >= (scrollheight - windowheight) && $(self.el).data('loadmore')) {
                            self.loadMore();
                        }

                        // Bug 8911 - Removed 'Load More' button
                        //if ($(self.el).data('loadmore') ) {
                        //        self.showLoadMore();
                        //    } else {
                        //        self.hideLoadMore();
                        //}
                    });
                    $(self.options.target).trigger('flxweb.bookbuilder.showonload');
                });

                //initialize books collections
                this.books = new BookbuilderModule.BooksList();
                // maintain a list of book views. Use it to cleanup
                this.bookViews = [];
                //add event listeners
                $(this.options.target).click(function () {
                	if(this.className.indexOf('already_in_library') === -1) {
                        self.show();
                	}
                    return false;
                });
                this.bind('flxweb.bookbuilder.load', this.onLoad);
                this.bind('flxweb.bookbuilder.ok', this.onOK);
                this.books.bind('add', this.onAdd, this);
                this.books.on('change:selected', this.onSelect, this);
            },
            show: function () {
                var self = this;
                self.clean();
                //add data attributes to the el
                // current page default to 1
                $(this.el).data('page', 1);
                $('#atb_search_text').val('');
                //initially hide the load more button
                //this.hideLoadMore();
                this.dialog.open();
                //$.flxweb.showLoading();
                $('#load_flexbook_progress').removeClass('hide');
                this.books.fetch({
                    success: function (collection, response) {
                        if (response.hasOwnProperty('books') && response.books instanceof Array) {
                            if (response.books.length === 0 || collection.length >= response.total) {
                                $(self.el).data('loadmore', false);
                                // Bug 8911 - Removed 'Load More' button
                                //self.hideLoadMore();
                            } else {
                                $(self.el).data('loadmore', true);
                            }
                        } else {
                            $(self.el).data('loadmore', false);
                        }
                        self.trigger('flxweb.bookbuilder.load');
                    }
                });
            },
            hide: function () {
                this.clean();
                this.dialog.close();
            },
            clean: function () {
                var i;
                //cleanup old view
                for (i = 0; i < this.bookViews.length; i++) {
                    this.bookViews[i].destroy();
                }
                this.bookViews = [];
                this.books.reset();
                $(this.el).data('page', 0);
                //hide the load more intially
                // Bug 8911 - Removed 'Load More' button
                //self.hideLoadMore();
            },
            onLoad: function () {
                $('#atb_books').html('');
                //$.flxweb.hideLoading();
                $('#load_flexbook_progress').addClass('hide');
                // add the new book view
                var i, bookModel, bookView,
                    newBookModel = new BookbuilderModule.Book(),
                    newBookView = new BookbuilderModule.NewBookView({
                        model: newBookModel
                    });
                $('#atb_books').append(newBookView.render().el);
                this.bookViews[0] = newBookView;
                //add bookView for each model
                for (i = 0; i < this.books.length; i++) {
                    bookModel = this.books.at(i);
                    bookView = new BookbuilderModule.BookView({
                        model: bookModel
                    });
                    this.bookViews[this.bookViews.length] = bookView;
                    $('#atb_books').append(bookView.render().el);
                }
                // Then add the newBookModel to the books.
                // NOTE: this is added after the for loop
                // to avoid duplicate view creation
                // if changing this, look at loadMore method and change equality
                this.books.add(newBookModel);

                // Default selection to the 1st existing book in the list
                // if none exists, then default selection to the new
                // book view.
                if (this.books.length > 1) {
                    $(this.bookViews[1].el).find(':checkbox').focus();
                } else {
                    $(this.bookViews[0].el).find(':checkbox').focus();
                }
            },
            loadMore: function () {
                //$.flxweb.showLoading();
                $('#load_flexbook_progress').removeClass('hide');
                var data,
                    self = this,
                    page = $(this.el).data('page'),
                    search_text = $('#atb_search_text').val();
                data = {
                    page: page + 1
                };
                $(this.el).data('page', page + 1);
                if (search_text && $.trim(search_text) !== '') {
                    data.q = search_text;
                }

                this.books.fetch({
                    add: true,
                    data: data,
                    success: function (collection, response) {
                        //$.flxweb.hideLoading();
                        $('#load_flexbook_progress').addClass('hide');
                        if (response.hasOwnProperty('books') && response.books instanceof Array) {
                            // a "new book" model was added to collection onLoad, therefore greater than and not greater than or equal to
                            if (response.books.length === 0 || collection.length > response.total) {
                                $(self.el).data('loadmore', false);
                                // Bug 8911 - Removed 'Load More' button
                                //self.hideLoadMore();
                            } else {
                                $(self.el).data('loadmore', true);
                            }
                        } else {
                            $(self.el).data('loadmore', false);
                        }
                    }
                });
            },
            onAdd: function (bookModel) {
                if (bookModel.get('id') !== 'new') {
                    var bookView = new BookbuilderModule.BookView({
                        model: bookModel
                    });
                    this.bookViews[this.bookViews.length] = bookView;
                    $('#atb_books').append(bookView.render().el);
                }
            },
            onSelect: function (bookModel) {
                var i, book;
                for (i = 0; i < this.books.length; i++) {
                    book = this.books.at(i);
                    if (book.get('id') !== bookModel.get('id')) {
                        //IMPORTANT: silent:true is needed, else infinite loop
                        book.set({
                            'selected': false
                        }, {
                            silent: true
                        });
                    }
                }
            },
            onSearch: function () {
                var self = this;
                self.clean();
                $.flxweb.showLoading();
                self.loadMore();
                return false;
            },
            onOK: function () {
                var selectedBook, title, children, index,
                    self = this,
                    origSelectedBook = this.books.find(function (book) {
                        return book.get('selected') === true;
                    });

                if (!origSelectedBook) {
                    $.flxweb.showDialog($.flxweb.gettext('Please create a new FlexBook&#174; Textbook title or select an existing FlexBook&#174; Textbook'));
                    return;
                }

                //copy the origSelectedBook to selectedBook. So that the original object is
                // unchanged in case of a failure
                selectedBook = new BookbuilderModule.Book($.extend(true, {}, origSelectedBook.attributes));
                if (selectedBook.get('revisions') && selectedBook.get('revisions')[0]) {
                    children = selectedBook.get('revisions')[0].children;
                } else {
                    children = selectedBook.get('children');
                }
                //Make sure if a new book is specified, then the title is non empty
                title = $.trim(selectedBook.get('title'));
                if (!title || title === undefined || $.trim(title) === '') {
                    $.flxweb.showDialog($.flxweb.gettext('Please enter a new FlexBook&#174; textbook title or select an existing FlexBook&#174; textbook'));
                    return;
                }

                if (selectedBook.get('id') === this.currentArtifact.id) {
                    $.flxweb.showDialog($.flxweb.gettext('Cannot add a FlexBook&#174; textbook to itself'));
                    return;
                }

                for (index=0; index< children.length; index++) {
                    if (children[index].revisionID === parseInt(artifactRevisionID, 10)) {
                        $.flxweb.showDialog($.flxweb.gettext('This artifact is already part of the selected FlexBook&#174; textbook'));
                        return;
                    }
                }

                /*        if (selectedBook){
                            var children = selectedBook.get('children');
                            if (children && children.length ){
                                for (var c_idx = 0; c_idx < children.length; c_idx++){
                                    if (children[c_idx].artifactID == this.currentArtifact.id){
                                        $.flxweb.showDialog($.flxweb.gettext('This chapter already exists in selected FlexBook'));
                                        return;
                                    }
                                }
                            }
                        }
                */
                if (Util.validateResourceTitle(title, 'artifact')) {
                    $.flxweb.showLoading($.flxweb.gettext('Adding to FlexBook&#174; textbook "<%= title %>"', {
                        'title': $.flxweb.truncate(title, 50)
                    }));

                    var successCb =  function (model, response) {
                        if (response.status === 'error') {
                            if (response.message !== undefined) {
                                $.flxweb.showDialog(response.message);
                            } else {
                                $.flxweb.showDialog($.flxweb.gettext('Could not complete the operation.Please try again later'));
                            }
                        } else {
                            $.flxweb.hideLoading();
                            $.flxweb.notify($.flxweb.gettext('Added to FlexBook&#174; textbook <a href="/' + response.perma + '"><%= title %>', {
                                'title': $.flxweb.truncate(title, 50)
                            }));
                            self.hide();
                        }
                    };

                    var errorCb =  function (response) {
                        if (response.message !== undefined) {
                            $.flxweb.showDialog(response.message);
                        } else {
                            $.flxweb.showDialog($.flxweb.gettext('Could not complete the operation.Please try again later'));
                        }
                    };


                    if(window.toggleForOldAPI){

                      children[children.length] = this.currentArtifact;
                      selectedBook.set('children', children);
                      selectedBook.save(null, {
                          'success': function (model, response) {
                              if (response.status === 'error') {
                                  if (response.message !== undefined) {
                                      $.flxweb.showDialog(response.message);
                                  } else {
                                      $.flxweb.showDialog($.flxweb.gettext('Could not complete the operation.Please try again later'));
                                  }
                              } else {
                                  $.flxweb.hideLoading();
                                  $.flxweb.notify($.flxweb.gettext('Added to FlexBook&#174; textbook <a href="/' + response.perma + '"><%= title %>', {
                                      'title': $.flxweb.truncate(title, 50)
                                  }));
                                  self.hide();
                              }
                          },
                          'error': function (response) {
                              if (response.message !== undefined) {
                                  $.flxweb.showDialog(response.message);
                              } else {
                                  $.flxweb.showDialog($.flxweb.gettext('Could not complete the operation.Please try again later'));
                              }
                          }
                      });

                    }else{
                      // ADDED BY @Pratyush: ADDING BOOK TO ANOTHER BOOK IS ESSENTIALLY ADDING CHILDREN OF ONE TO ANOTHER
                      if(['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook'].indexOf(this.currentArtifact.artifactType) > -1){
                          // children  = children.concat(this.currentArtifact.children);
                          window.vocabContainer.data().loader.done(function(data){  // TODO: CLEAR THIS GARBAGE
                              var newChildren =  data.revisions[0] && data.revisions[0].children ? data.revisions[0].children : [];

                              // FIX FOR 55166. OLD SAVE API ADDS MODALITIES, even if duplicates
                              var newChildrenArtifactRevisionId =  [],
                                  map ={},
                                  hasDuplicates =  false;

                              if( typeof newChildren[0] == 'object'){
                                newChildrenArtifactRevisionId =  newChildren.map(function(child){
                                    return child.artifactRevisionID;
                                })
                              }else{
                                 newChildrenArtifactRevisionId = newChildren.slice();
                              }

                              newChildrenArtifactRevisionId.forEach(function(value){
                                if(value){
                                  map[value] = true;
                                }
                              })

                              for( var i =0 , chilLen = children.length; i < chilLen; i++ ){
                                  if( typeof children[i] == 'number' && map[children[i]] || typeof children[i] == 'object' && map[children[i].revisionID]){
                                    hasDuplicates = true;
                                    break;
                                  }
                              }
                              if( hasDuplicates ){
                                $.flxweb.showDialog($.flxweb.gettext('This artifact is already part of the selected FlexBook&#174; textbook'));
                                return;
                              }
                              //55166
                              children = children.concat(newChildren);
                              selectedBook.set('children', children);
                              if( selectedBook.get('revisions') && selectedBook.get('revisions')[0]){
                                  selectedBook.get('revisions')[0].children = children;
                              };
                              APIUtil.requestSaveAPI( selectedBook, 'POST', successCb, errorCb );
                          })
                      }else{
                        children[children.length] = this.currentArtifact;
                        selectedBook.set('children', children);
                        APIUtil.requestSaveAPI( selectedBook, 'POST', successCb, errorCb );
                      }
                    }
                }
            }
        });

        return BookbuilderModule;

    });
