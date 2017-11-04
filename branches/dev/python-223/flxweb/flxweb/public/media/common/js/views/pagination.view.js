define([
    'jquery',
    'underscore',
    'backbone',
    'text!common/templates/pagination.html'
], function($, _, Backbone, tmpl){
    'use strict';
    var PaginationView = Backbone.View.extend({
        num_pages_shown: 3,
        current: 1,
        total: 1,
        separator: '...',
        events: {
            'click .js-pagination-link': 'onPageChange'
        },
        initialize: function(options){
            options = $.extend({}, options);
            _.bindAll(this, 'render', 'getPageData','update','onPageChange');
        },
        render: function(){
            this.$el.empty();
            this.$el.html( (this.template || PaginationView.template)( this.getPageData() )  );
            return this;
        },
        getPageData: function(){
            var total = this.total,
                current = this.current,
                pages_shown = this.num_pages_shown,
                side_pages = Math.floor(this.num_pages_shown/2),
                data = {
                    currentPage: current,
                    totalPages: total,
                    nextPage : (current + 1 > total)?total:current + 1,
                    prevPage: (current - 1 < 1)?1:current - 1,
                    pages: [],
                    separator: this.separator
                },
                i;

            if (total < (pages_shown + 2) ){
                for(i=1; i <= this.total; i++){
                    data.pages.push(i);
                }
            } else {
                if(current <= side_pages + 2){
                    //current page is near beginning
                    for (i=1; i<= pages_shown; i++){
                        data.pages.push(i);
                    }
                    if (current === side_pages + 2){
                        data.pages.push(current+1);
                    }
                    data.pages.push('|');
                    data.pages.push(total);
                } else if(current >= total - side_pages - 1){
                    //current page is towards end
                    data.pages.push(1);
                    data.pages.push('|');
                    if(current === total - side_pages -1){
                        data.pages.push(current -1);
                    }
                    for (i=total - pages_shown + 1; i<=total; i++){
                        data.pages.push(i);
                    }
                } else {
                    data.pages.push(1);
                    data.pages.push('|');
                    for(i=current-side_pages; i<= current + side_pages; i++){
                        data.pages.push(i);
                    }
                    data.pages.push('|');
                    data.pages.push(total);
                }
            }
            return data;
        },
        update: function(data){
            this.current = data.current;
            this.total = data.total;
            this.render();
        },
        onPageChange: function(e){
            var target = $(e.currentTarget);
            if (!target.hasClass('disabled')) {
                this.trigger('pageChange', { pageNum: target.data('pagenum') });
            }
        }
    }, {
        template: _.template(tmpl, null, {variable: 'data'})
    });
    return PaginationView;
});
