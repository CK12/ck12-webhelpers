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


var Book = Backbone.Model.extend({
    urlRoot: '/ajax/bookbuilder/book/',
    defaults:{
        'thumbnail' : '/media/images/thumb_dflt_flexbook_sm.png',
        'title': '',
        'children':[],
        'id':'new'
    },
    initialize: function() {
        if (this.get('coverImageThumbSmall')) {
            this.set('thumbnail',this.get('coverImageThumbSmall'));
        }
    }
});

var BooksList = Backbone.Collection.extend({
    model: Book,
    url: '/ajax/bookbuilder/books/',
    parse: function(response) {
        if ("books" in response) {
            return response.books;
        } else {
            return [];
        }
    }
    
});

var NewBookView = Backbone.View.extend( {
    events: {
        'click': 'onClick',
        'change #newBookTitle': 'onTitleChange'
    },
    onClick: function() {
        // reset any previous selected attributes
        for (var i=0;i<this.model.collection.length;i++) {
            var model = this.model.collection.at(i);
            if (this.model != model) {
                model.set({'selected':false,silent:true});
            }
        }
        this.model.set({'selected':true});
        this.$(':radio').prop('checked',true);
    },
    onTitleChange: function() {
        this.model.set({'title': $('#newBookTitle').val()});
    },
    render: function() {
        var template = _.template($('#tmpl_atb_new_book').html());
        var element = template(this.model.toJSON());
        this.setElement(element,true);
        return this;
    }, 
    destroy: function() {
        $(this.el).remove();
    }
});


var BookView = Backbone.View.extend( {
    events: {
        'click': 'onClick'
    },
    onClick: function() {
        this.model.set({'selected':true});
        this.$(':radio').prop('checked',true);
    },
    render: function() {
        var template = _.template($('#tmpl_atb_book').html());
        var element = template(this.model.toJSON());
        this.setElement(element,true);
        return this;
    },
    destroy: function() {
        $(this.el).remove();
    }
});

var BookbuilderView = Backbone.View.extend({
    events: {
        'click #atb_loadmore': 'loadMore',
        'click #atb_search_btn': 'onSearch'
    },
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0 ||
            $(this.options.target).length == 0) {
            return;
        }
        var self = this;
        //get the current artifact i.e. the artifact you are adding
        this.currentArtifact = {'artifactRevisionID':$(this.options.target).data('artifactrevisionid'),
                               'artifactType':$(this.options.target).data('artifacttype'),
                               'title':$(this.options.target).data('title')};

        this.url = $(this.el).data('url');
        $(this.el).load(this.url,function() {
            $('#atb_books_wrapper').bind('scroll',function(){
                if ($(self.el).data('loadmore') ) {
                    self.showLoadMore();
                } else {
                    self.hideLoadMore();
                }
            });
            self.dialog = $.flxweb.createDialog($(self.el),
                {
                    'title':'Add "'+ self.currentArtifact['title']  +'" to a book in your library',
                    'height':500,
                    'width':500,
                    'buttons':{ 
                        'OK': function() {
                            self.trigger('flxweb.bookbuilder.ok');
                        },
                        'Cancel':function() {
                            $(this).dialog('close');
                        }
                    }
                });
        });

        //initialize books collections
        this.books = new BooksList();
        // maintain a list of book views. Use it to cleanup
        this.bookViews = []
        //add event listeners
        $(this.options.target).click(function(){
                                        self.show();
                                        return false;
                                    });
        this.bind('flxweb.bookbuilder.load',this.onLoad);
        this.bind('flxweb.bookbuilder.ok',this.onOK);
        this.books.bind('add',this.onAdd,this);
    },
    show: function() {
        var self=this;
        self.clean();
        //add data attributes to the el
        // current page default to 1
        $(this.el).data('page',1);
        $('#atb_search_text').val('');
        //initially hide the load more button
        this.hideLoadMore();
        this.dialog.open();
        $.flxweb.showLoading();
        this.books.fetch({
            success:function(collection,response){
                if (response.books && response.books.length == 0) {
                    $(self.el).data('loadmore',false);
                    self.hideLoadMore();
                } else {
                    $(self.el).data('loadmore',true);
                }
                self.trigger('flxweb.bookbuilder.load');
            }
        });
    },
    hide: function() {
        this.clean();
        this.dialog.close();
    },
    clean: function() {
        var self = this;
        //cleanup old view
        for (var i=0;i<this.bookViews.length;i++) {
            this.bookViews[i].destroy();
        }
        this.bookViews = [];
        this.books.reset();
        $(this.el).data('page',0);
        //hide the load more intially
        self.hideLoadMore(); 
    },
    onLoad: function() {
        var self = this;
        $('#atb_books').html('');
        $.flxweb.hideLoading();
        // add the new book view
        this.newBookModel = new Book();
        var newBookView = new NewBookView({model:this.newBookModel});
        $('#atb_books').append(newBookView.render().el);
        this.bookViews[0] = newBookView; 
        //add bookView for each model
        for (var i=0;i<this.books.length;i++) {
            var bookModel = this.books.at(i);
            var bookView = new BookView({model:bookModel});
            this.bookViews[this.bookViews.length] = bookView;
            $('#atb_books').append(bookView.render().el);
        }
        // Then add the newBookModel to the books.
        // NOTE: this is added after the for loop
        // to avoid duplicate view creation
        this.books.add(this.newBookModel);

        // Default selection to the 1st existing book in the list
        // if none exists, then default selection to the new
        // book view.
        if (this.books.length>1) {
            $(this.bookViews[1].el).find(':checkbox').focus();
        } else {
            $(this.bookViews[0].el).find(':checkbox').focus();
        }
    },
    loadMore: function() {
        var self = this;
        $.flxweb.showLoading();
        var page = $(this.el).data('page');
        var nextPage = page + 1;
        $(this.el).data('page',nextPage);
        var search_text = $('#atb_search_text').val();
        var data = {page:nextPage};
        if (search_text && $.trim(search_text) !='') {
            data['q']=search_text;
        }
       
        this.books.fetch({  
                            add:true,
                            data: data,
                            success: function(collection,response){
                               $.flxweb.hideLoading();
                                if (response.books.length == 0) {
                                    $(self.el).data('loadmore',false);
                                    self.hideLoadMore();
                                } else {
                                    $(self.el).data('loadmore',true);
                                }
                            }
                        });
    },
    onAdd: function(bookModel) {
        if (bookModel.get('id')!='new') {
            var bookView = new BookView({model:bookModel});
            this.bookViews[this.bookViews.length] = bookView;
            $('#atb_books').append(bookView.render().el);
        }
    },
    showLoadMore: function() {
        $('#atb_loadmore').removeClass('hide');
        $('#atb_loadmore').html('Load more');
    },
    hideLoadMore: function() {
        $('#atb_loadmore').addClass('hide');
    },
    onSearch: function() {
        var self = this;
        self.clean();
        $.flxweb.showLoading();
        self.loadMore();
        return false;
    },
    onOK: function() {
        var self=this;
        var selectedBook = this.books.find(function(book) {
            return book.get('selected') == true; 
        });

        if (!selectedBook) {
            $.flxweb.showDialog('Please enter a new book title or select an existing book');
            return;
        }
        
        //Make sure if a new book is specified, then the title is non empty
        var title = selectedBook.get('title');
        if (!title || title==undefined || $.trim(title)==''){
            $.flxweb.showDialog('Please enter a new book title or select an existing book');
            return;
        }

        $.flxweb.showLoading('Adding to book "'+ title +'"');
        var children = selectedBook.get('children');
        children[children.length] = this.currentArtifact; 
        selectedBook.set('children',children);
        selectedBook.save(null,{
            'success': function(model,response) {
                if (response.status == 'error') {
                    if (response.message != undefined) {
                        $.flxweb.showDialog(response.message);
                    } else {
                        $.flxweb.showDialog('Could not complete the operation.Please try again later');
                    }
                }else{
                    $.flxweb.hideLoading();
                    $.flxweb.notify('Added to book "'+ title + '"');
                    self.hide();
                }
            },
            'error': function(response) {
                if (response.message != undefined) {
                    $.flxweb.showDialog(response.message);
                } else {
                    $.flxweb.showDialog('Could not complete the operation.Please try again later');
                }
            }
        });
    },
});

