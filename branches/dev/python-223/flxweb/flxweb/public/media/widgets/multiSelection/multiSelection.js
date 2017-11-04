(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        root.MultiSelection = factory(root.jQuery);
    }
})(this, function($) {
    var now = Date.now || function() {
        return new Date().getTime();
    };
    var debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };
    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    function escapeHtml (string) {
      return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
      });
    }
    var isMobileBrowser = (function () {
        var isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(window.navigator.userAgent);
        return function () {
            return isMobile && 768 > window.innerWidth;
        }
    })();

    function MultiSelection(selector, url){
        this.el = selector;
        this.url = url;
        this.placeholder = "ex: Photosynthesis";

        this.template = '<div class="multi-sel-tag-title-container">'+
                            '<span class="multi-sel-tags">Tags</span>'+
                            '<span class="multi-sel-hint">Max 5</span>'+
                            '<span class="multi-sel-warning hide">'+
                                '<i class="icon-notification"></i>The maximum for tags is 5'+
                            '</span>'+
                        '</div>'+
                        '<div class="multiSelection">'+
                            '<div class="multi-sel-loading-container hide">'+
                                '<img src="/media/common/images/loading.gif">'+
                            '</div>'+
                            '<div class="input-wrapper">'+
                                '<input type="text" class="multi-sel-input" placeholder="'+this.placeholder+'"></input>'+
                            '</div>'+
                        '</div>'+
                        '<ul class="selection-menu hide"></ul>';
        this.init();
    }

    MultiSelection.prototype.init = function() {
        this.onClickContainer = $.proxy(this.onClickContainer, this);
        this.onKeydownInput = $.proxy(this.onKeydownInput, this);
        this.onKeyUpInput = $.proxy(this.onKeyUpInput, this);
        this.onMouseoverMenu = $.proxy(this.onMouseoverMenu, this);
        this.onClickMenuItem = $.proxy(this.onClickMenuItem, this);
        this.onFocusoutMenu = $.proxy(this.onFocusoutMenu, this);
        this.onClickDeleteItem = $.proxy(this.onClickDeleteItem, this);
        this.onMouseleaveMenu = $.proxy(this.onMouseleaveMenu, this);
        this.onChangeInput = $.proxy(this.onChangeInput, this);
        this.show = $.proxy(this.show, this);


        this.createSelection();
    };
    MultiSelection.prototype.createSelection = function(){
        this.elInputContainer = this.el.html(this.template).find('.multiSelection');
        this.width = this.elInputContainer.width();
        this.menu  = this.el.find('.selection-menu');
        this.input = this.elInputContainer.find('input');
        this.loading = this.el.find('.multi-sel-loading-container');
        if(isMobileBrowser()){
        	this.doneButton = this.el.parent().find(".ph-close-add-tag");
        }
        this.isMouseOver = false;
        this.createEventsListener();
        this.selectedItems = [];
        this.newItems = [];
        this.optionsNum = 5;
    };
    MultiSelection.prototype.createEventsListener = function(){
        if (!isMobileBrowser()) this.elInputContainer.on('click', this.onClickContainer);
        this.input.change(this.onChangeInput)
                  .on('keydown', this.onKeydownInput)
                  .on('focusout', this.onFocusoutMenu)
                  .on("keyup",this.onKeyUpInput);

        this.menu.on('mouseover', '.selection-menu-item', this.onMouseoverMenu)
                 .on('mouseleave', this.onMouseleaveMenu)
                 .on('click', '.selection-menu-item', this.onClickMenuItem);
        this.el.on('click', '.multi-select-remove-tag', this.onClickDeleteItem);
    };
    MultiSelection.prototype.onClickContainer = function(){
        this.elInputContainer.find('input').focus();
    };
    MultiSelection.prototype.onKeydownInput = function(e){
        // if(!this.isValidKeys(e.which)){
        //     e.preventDefault();
        //     return;
        // }
        if(e.which === 38){
            this.selectPrev();
            e.preventDefault();
        }else if(e.which === 40){
            this.selectNext();
            e.preventDefault();
        }else if(e.which === 13){
            var ids = this.getSelectedIds().data;
            if(ids.length < 5){
                this.selectAnItem();
                this.sendData();
            }else{
                this.showWarning();
            }
            e.preventDefault();
        }else{
            this.callAPI();
            this.onChangeInput();
        }
    };
    MultiSelection.prototype.onKeyUpInput = function(e){
    	/*code can be use later after discussion */
/*    	if(isMobileBrowser() && this.input.val().trim().length>=1){
    		this.menu.empty();
    		this.menu.removeClass("hide")
    		this.menu.prepend('<li class="selection-menu-item">' + this.input.val().trim()+'<span id="createTag">Create tag</span>' + '</li>')
        	this.createTag = this.el.find('#createTag');
        	this.createTag.on("click",function(e){
        		e.preventDefault();
        		e.stopPropagation();
        		  var ids = this.getSelectedIds().data;
        		  if(ids.length < 5){
                      this.selectAnItem();
                      this.sendData();
                  }else{
                      this.showWarning();
                  }
        	}.bind(this));
    	}*/
    };
    MultiSelection.prototype.onChangeInput = function(){
        if(this.input.val().trim().length <= 1 ){
            this.hideWarning();
        }else{
        	   if(this.doneButton){
        			   this.doneButton.removeClass("disabled-mobile")
               }
        }

        this.input.attr('size', Math.max(this.input.val().length+5, 17));
    };
    MultiSelection.prototype.onMouseoverMenu = function(e){
        this.isMouseOver = true;
        if(this.selected){
            this.selected.removeClass('selected');
        }
        this.selected = $(e.currentTarget).addClass('selected');
    };
    MultiSelection.prototype.onFocusoutMenu = function(){
        if(this.isMouseOver){
            return;
        }
        var items = this.getSelectedIds().data;
        if(items.length < 5){
            this.selectAnItem();
            this.sendData();
        }else{
            this.input.val('');
        }
        this.cleanSelected(true);
    };
    MultiSelection.prototype.onClickMenuItem = function(e){
        var ids = this.getSelectedIds().data;
        if(ids.length < 5){
            this.selectAnItem();
            this.sendData();
            if(this.doneButton){
            	this.doneButton.removeClass("disabled-mobile");
            }
        }else{
            this.showWarning();
        }
    };

    MultiSelection.prototype.onClickDeleteItem = function(e){
        e.preventDefault();
        e.stopPropagation();
        if(this.elInputContainer.find('.selected-element').length === 1){
            this.input.attr('placeholder', this.placeholder);
        }
        var deletedItemId = $(e.currentTarget).parent().attr('data-id');
        if(deletedItemId){
            for(var i = 0; i < this.selectedItems.length; i++){
            	if(this.selectedItems[i].encodedID === deletedItemId){
                	this.selectedItems.splice(i,1);
                    break;
                }
            }
            for(var i = 0; i < this.newItems.length; i++){
            	if(this.newItems[i] === deletedItemId){
                	this.newItems.splice(i,1);
                    break;
                }
            }

        }


        $(e.currentTarget).parent().remove();
        this.hideWarning();
        this.sendData();
    };
    MultiSelection.prototype.onMouseleaveMenu = function(e){
        this.isMouseOver = false;
    };

    MultiSelection.prototype.isValidKeys = function(keycode){
        if(keycode >= 37 && keycode <= 90){
            return true;
        }else if(keycode === 13 || keycode === 8){
            return true;
        }
        return false;
    };
    MultiSelection.prototype.callAPI = debounce(function(){
        var searchedContent = this.input.val().trim();
        if(searchedContent.length <= 0){
            this.menu.addClass('hide');
            return;
        }
        // this.loadingIcon.removeClass('hide');
        var self = this;
        this.loading.removeClass('hide');
        $.ajax({
            //url:this.url+encodeURIComponent(searchedContent),
            url:this.url,
            dataType: 'json',
            data: {"query":searchedContent,"withEncodedIDOnly":true,"limit":15}
        }).done(function(data){
            // self.recomendedContent = data.response.conceptNodes;
            self.loading.addClass('hide');
            if(data.responseHeader.status === 0){
                // self.loadingIcon.addClass('hide');
                // self.options = data.response.conceptNodes;
                self.options = data.response.collections;
                self.showOptions();

            }else{
                console.error('server returns errors!');
            }
        });
    }, 500, false);
    MultiSelection.prototype.showOptions = function(){
        this.menu.empty();
        var selectedItemIDs = this.selectedItems.map(function(item){
            return item.encodedID;
        });
        var menuContent = '';
        var count = 0;
        for(var i = 0; i < this.options.length; i++){
            if(selectedItemIDs.indexOf(this.options[i].encodedID) === -1){
                count++;
                //menuContent += '<li class="selection-menu-item" data-id="' + this.options[i].encodedID + '" data-selection-subject="' + this.options[i].title + ' (' + this.options[i].collectionTitle + ')'+ '">' + this.options[i].title.replace(/<|>/g, "") + ' (' + this.options[i].collectionTitle + ')'+'</li>';
                if(isMobileBrowser())
                {
                    menuContent += '<li class="selection-menu-item" data-id="' + this.options[i].encodedID + '" data-selection-subject="'+ this.options[i].collectionTitle + '">' + this.options[i].title.replace(/<|>/g, "") +'</li>';
                }
                else
                {
                    menuContent += '<li class="selection-menu-item" data-id="' + this.options[i].encodedID + '" data-selection-subject="'+ this.options[i].collectionTitle + '">' + this.options[i].title.replace(/<|>/g, "") + ' (' + this.options[i].collectionTitle + ')'+'</li>';
                }
            }
            if(count >= this.optionsNum){
                break;
            }
        }
        this.menu.append(menuContent);
        if(this.options.length > 0){
            this.menu.removeClass('hide');
        }else{
            this.menu.addClass('hide');
        }
        if(isMobileBrowser() && this.input.val().trim().length>=1){
        	 this.menu.removeClass('hide');
     		this.menu.prepend('<li class="selection-menu-item">' + this.input.val().trim()+'<span id="createTag">Create tag</span>' + '</li>')
        	this.createTag = this.el.find('#createTag');
        	this.createTag.on("click",function(e){
        		e.preventDefault();
        		e.stopPropagation();
        		  var ids = this.getSelectedIds().data;
        		  if(ids.length < 5){
                      this.selectAnItem();
                      this.sendData();
                  }else{
                      this.showWarning();
                  }
        	}.bind(this));

        }
    };
    MultiSelection.prototype.selectPrev = function(){
        if(this.el.find('.selection-menu .selection-menu-item').length > 0){
            this.menu.removeClass('hide');
        }
        if(!this.selected){
            this.selected = this.el.find('.selection-menu .selection-menu-item').last().addClass('selected');
        }else{
            this.selected.removeClass('selected');
            var prev = this.selected.prev();
            if(!prev.hasClass('selection-menu-item')){
                this.selected = this.el.find('.selection-menu .selection-menu-item').last().addClass('selected');
            }else{
                this.selected = prev;
                this.selected.addClass('selected');
            }
        }
        this.input.val(this.selected.html());
        this.input.trigger('change');
    };
    MultiSelection.prototype.selectNext = function(){
        if(this.el.find('.selection-menu .selection-menu-item').length > 0){
            this.menu.removeClass('hide');
        }
        if(!this.selected){
            this.selected = this.el.find('.selection-menu .selection-menu-item').first().addClass('selected');
        }else{
            this.selected.removeClass('selected');
            var next = this.selected.next();
            if(!next.hasClass('selection-menu-item')){
                 this.selected = this.el.find('.selection-menu .selection-menu-item').first().addClass('selected');
            }else{
                this.selected = next;
                this.selected.addClass('selected');
            }
        }
        this.input.val(this.selected.html());
        this.input.trigger('change');
    };
    MultiSelection.prototype.selectAnItem = function(data){
        var selectedItem_id = data? data.id : (this.selected? this.selected.attr('data-id'): null);
        if(this.elInputContainer.find('.multi-sel-input').val().trim().length > 0){
            this.input.attr('placeholder', '');
        }
        if(selectedItem_id){
            var selectedItem = this.options.filter(function(option){
                return option.encodedID === selectedItem_id;
            })[0];
            if(selectedItem){
                this.selectedItems.push(selectedItem);
                this.input.parent().before('<div class="selected-element" data-id="'+ selectedItem_id +'">'+ (data? data.title : this.selected.text()) + '<a class="icon-close multi-select-remove-tag"></a></div>');
            }
        }else{
            var name = this.elInputContainer.find('.multi-sel-input').val().trim();
            if(this.newItems.indexOf(name) === -1 && name.length > 0){
                this.newItems.push(name);
                this.input.parent().before('<div class="selected-element" data-id="'+ escapeHtml(name) + '">' + escapeHtml(name) + '<a class="icon-close multi-select-remove-tag"></a></div>');
            }
        }
        this.cleanSelected();
    };
    MultiSelection.prototype.setupSelections = function(data){
        var that = this;
        if(data.length > 0){
            this.input.attr('placeholder', '');
        }
        data.forEach(function(tag){
            if(tag.encodedID){
                that.selectedItems.push(tag);
                that.input.parent().before('<div class="selected-element" data-id="'+ tag.encodedID +'">'+ escapeHtml(tag.name) + '<a class="icon-close multi-select-remove-tag"></a></div>');
            }else{
                that.newItems.push(tag.name);
                that.input.parent().before('<div class="selected-element" data-id="'+ escapeHtml(tag.name) + '">' + escapeHtml(tag.name) + '<a class="icon-close multi-select-remove-tag"></a></div>');
            }
        });
    };
    MultiSelection.prototype.cleanSelected = function(keepInput){
        this.menu.addClass('hide');
        if(!keepInput){
            this.input.val('');
        }
        if(this.selected){
            this.selected.removeClass('selected');
            this.selected = null;
        }
        this.el.find('.selection-menu').empty();

    };
    MultiSelection.prototype.sendData = function(){
        // var data = this.getSelectedIds();
        var data = {
            data: this.selectedItems,
            newData: this.newItems
        };
        this.el.trigger('selectConcepts', data);
    };
    MultiSelection.prototype.getSelectedIds = function(){
        var responseData = {
            data:[]
        };
        var selected_concpets = this.el.find('.selected-element');
        selected_concpets.each(function(){
            responseData.data.push($(this).attr('data-id'));
        });

        return responseData;
    };
    MultiSelection.prototype.showWarning = function(){
        this.el.find('.multi-sel-warning').removeClass('hide');
        if(isMobileBrowser()){
        	 this.el.find('.selection-menu').empty();
        }

    };
    MultiSelection.prototype.hideWarning = function(){
        this.el.find('.multi-sel-warning').addClass('hide');
    };

    MultiSelection.prototype.addConcept = function(concept){
        var ids = this.getSelectedIds().data;
        if(ids.length < 5){
            this.selectAnItem(concept);
            this.sendData();
        }else{
            this.showWarning();
        }
    };
    MultiSelection.prototype.reset = function(){
        this.hideWarning();
        this.el.find('.selected-element').remove();
        this.el.find('.selection-menu').empty();
        this.input.val('');
        this.selectedItems = [];
        this.newItems = [];
    };
    return MultiSelection;

});
