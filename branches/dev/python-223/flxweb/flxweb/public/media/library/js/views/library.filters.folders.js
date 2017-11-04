define([
        'jquery',
        'backbone',
        'underscore',
        'library/templates/library.templates',
        'common/views/modal.view'
    ],
    function($, Backbone, _, TMPL, ModalView) {
        'use strict';
        var FoldersFilter = Backbone.View.extend({
            labelTemplate: TMPL.LABEL,
            events: {
                "click .delete-label": "confirmLabelDelete",
                "click .label-item": "onLabelClick"
            },
            initialize: function(options) {
                _.bindAll(this, "onModelReset", "onLabelClick", 
                    "onLabelDelete", "setFolder");
                options = $.extend({}, options);
                var self = this;
                this.model.on("reset", this.onModelReset);
                this.model.on("add", function () {
                	self.onModelReset(self.model);
                });
                this.model.off("delete").on("delete", this.onDeleteSuccess);
            },
            render: function() {
                this.$el.html(FoldersFilter.template);
                return this;
            },
            onModelReset: function(data) {
                var item, str = '',
                    i, l, json,
                    labelContainer = this.$(".labels-list");
                for (i = 0, l = data.models.length; i < l; i++) {
                    item = data.models[i];
                    item.set('cid', item.cid);
                    json = item.toJSON();
                    if (this.selectedLabel && json.label.toLowerCase() === this.selectedLabel.toLowerCase()){
                        json.selected = true;
                    }
                    str += this.labelTemplate(json);
                }
                labelContainer.html(str);
            },
            onLabelDelete: function(elem) {
                var options, cid, model, self = this;
                cid = elem.parent().data('cid');
                model = self.model.getByCid(cid);
                options = {
                    'label': model.attributes.label
                };
                model.deleteLabel(options, cid);
            },
            onDeleteSuccess: function(cid) {
                var model, label, self = this;
                model = self.getByCid(cid);
                label = model.toJSON().label;
                model.destroy();
                $('[data-label="' + label + '"]').remove();
                ModalView.alert('label deleted');
            },
            onLabelClick: function(e){
                var target = $(e.currentTarget),
                    selectedLabel = target.data("label");
                this.selectedLabel = selectedLabel;
                this.$(".selected").removeClass("selected");
                target.addClass("selected");
                this.trigger("selectLabel", {label: selectedLabel});
                if (window._ck12) {
                    _ck12.logEvent('FBS_USER_ACTION', {
                        'memberID': window.ads_userid,
                        'value': selectedLabel,
                        'desc': 'FBS_LIBRARY_FILTER'
                    });
                } else if (window.dexterjs) {
                var config = window.dexterjs.get('config');
                if (config && config.hasOwnProperty('mixins') && config.mixins.hasOwnProperty('appID')){
                    if ( config.mixins.appID == 'ltiApp'){
                        window.dexterjs.logEvent('FBS_USER_ACTION', {
                            'memberID': config.memberID,
                            'value': selectedLabel,
                            'desc': 'FBS_LIBRARY_FILTER'
                        });
                    }
                }
            }
                return false;
            },
            confirmLabelDelete: function(e) {
                e.stopPropagation();
                var $this = $(e.currentTarget),
                    labelText = $this.siblings('a').text();
                ModalView.confirm(this.onLabelDelete, 'Are you sure you want to delete label "' + labelText + '"', 'Delete Label', $this);
            },
            setFolder: function(label){
                this.selectedLabel = label;
                this.$(".selected").removeClass('selected');
                this.$el.find(".label-item").each(function(idx, lbl){
                    if ( $(lbl).data('label') === label ){
                        $(lbl).addClass('selected');
                    }
                });
            },
            clearSelectedLabels: function(){
                $.each(this.$el.find("#label-filter div[data-label].selected"), function(i,val){
                    $(val).removeClass("selected")
                });
                this.trigger("selectLabel", {label: "All"});
            }
        }, {
            template: TMPL.FOLDERS
        });
        return FoldersFilter;
    });
