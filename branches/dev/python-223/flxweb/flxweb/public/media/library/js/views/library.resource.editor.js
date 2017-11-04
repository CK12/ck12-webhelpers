define([
    'jquery',
    'underscore',
    'backbone',
    'common/views/modal.view',
    'library/templates/library.templates',
    'library/services/ck12.library'
],function($, _, Backbone, ModalView, LibraryTemplates, LibraryService){
    'use strict';
    var ResourceEditor = ModalView.extend({
        initialize: function(){
            _.bindAll(this, "save");
            this.options = $.extend(this.options, {
                showOnOpen: true,
                contentPartial: LibraryTemplates.RESOURCE_EDITOR(this.model.toJSON()),
                headerPartial: "Edit Resource",
                css: {
                    'max-width': '480px'
                },
                buttons: [
                    {
                        text:"Save", 
                        className:"turquoise", 
                        onclick: this.save
                    },
                    {
                        text:"Cancel", 
                        className:"dusty-grey modal-uikit-cancel", 
                        onclick: function(){
                            this.close();
                        }
                    }
                ]
            });
            ModalView.prototype.initialize.apply(this);
            this.addClass('modal-resource-editor');
        },
        save: function(){
            var published = this.$el.find('.js_published').is(':checked'),
                title = $.trim(this.$el.find('.txt_resource_title').val()),
                rtype = this.$el.find('.js_res_type').val(),
                desc = $.trim(this.$el.find('.txt_resource_desc').val()),
                that = this,
                $err_title = this.$el.find('.js_error_title'),
                $err_desc = this.$el.find('.js_error_desc');
            $err_title.addClass('hide');
            $err_desc.addClass('hide');
            if (!title || title.indexOf("/") !== -1 || title.length > 100){
                $err_title.text("Please enter a valid title.").removeClass("hide");
                return false;
            }
            if (published && !desc){
                $err_desc.text("Please enter some description.").removeClass("hide");
                return false;
            }
            LibraryService.updateResource({
                'id': this.model.get('id'),
                'resourceName': title,
                'resourceType': rtype,
                'resourceDesc': desc,
                'isAttachment': this.model.get('isAttachment'),
                'isExternal': this.model.get('isExternal'),
                'isPublic': published
            }).done(function(){
                var model = that.model,
                    revs = that.model.get('revisions');
                revs[0].isPublic = published;
                model.set({
                    name: title,
                    type: rtype,
                    description: desc,
                    revisions: revs
                });
                that.close();
                ModalView.alert("Resource was updated successfully");
            }).fail(function(){
                ModalView.alert("There was an error while saving this resource.");
            });
            return false;
        }
    });
    return ResourceEditor;
});