define([
    'jquery',
    'underscore',
    'backbone',
    'library/templates/library.templates'
],function($, _, Backbone, TMPL){
    var OwnershipFiltersView = Backbone.View.extend({
        template: TMPL.OWNERSHIP_FILTERS,
        events: {
            'change .js-ownership-filter': 'onFilterClick',
            'click .filter-clear-wrap' : 'onFilterClear',
            'change .js-state-filter': 'onStateFilterClick'
        },
        initialize: function(){
            _.bindAll(this,"render", "onFilterClick", "setOwnership", "onFilterClear", "onStateFilterClick");
        },
        render: function(){
            this.$el.html(this.template);
            return this;
        },
        onFilterClick: function(e){
            var target = $(e.currentTarget),
                is_checked = target.find('input').is(':checked'),
                num_ownership_checked_filters = this.$el.find('.js-ownership-filter input:checked').size(),
                $draftCheck = this.$el.find('#ownership_draft_self'),
                $finalizedCheck = this.$el.find('#ownership_finalized_self'),
                draft_checked,
                publish_checked,
                ownership = target.data('ownership'),
                $targetSibling = target.siblings('.js-ownership-filter').find('input'),
                num_state_checked_filters = this.$el.find('.js-state-filter input:checked').size();;
                
            if ( num_ownership_checked_filters === 0){
                ownership="all";
            }
            if($targetSibling.is(':checked')){
                $targetSibling.prop('checked', false);
            }
            if($('#ownership_self').prop('checked') === false || $targetSibling.is(':checked')){
                $draftCheck.prop('checked', false);
                $finalizedCheck.prop('checked', false);
            }
            if(num_state_checked_filters === 0 || num_state_checked_filters === 2){
                revisionState = false;
            } else{
                revisionState = $('.revision-state-input:checked').parent().data('state');
            }
            this.trigger('ownershipChange', {
                'ownership':ownership,
                'includeRevisionsInState': revisionState
            });
            if (window._ck12) {
                _ck12.logEvent('FBS_USER_ACTION', {
                    'memberID': window.ads_userid,
                    'value': target.find('label').text().trim(),
                    'status': is_checked,
                    'desc': 'FBS_LIBRARY_FILTER'
                });
            } else if (window.dexterjs) {
                var config = window.dexterjs.get('config');
                if (config && config.hasOwnProperty('mixins') && config.mixins.hasOwnProperty('appID')){
                    if ( config.mixins.appID == 'ltiApp'){
                        window.dexterjs.logEvent('FBS_USER_ACTION', {
                            'memberID': config.memberID,
                            'value': target.find('label').text().trim(),
                            'status': is_checked,
                            'desc': 'FBS_LIBRARY_FILTER'
                        });
                    }
                }
            }
        },
        onFilterClear: function(e){
            this.$el.find(".filter-clear-wrap").addClass('hide');
            this.$el.find('.custom-box input').prop('checked', false);
            this.trigger('ownershipChange', { 'ownership': 'all'});
            this.trigger('draftFilterChange', {
                'includeRevisionsInState': false
            });
        },
        setOwnership : function(ownership, state){
            var that = this;
            if (ownership === 'all'){
                this.$el.find("input").removeAttr('checked');
            } else {
                this.$el.find('.custom-box').each(function(idx, el){
                    if ( $(el).data('ownership') === ownership ){
                        $(el).find("input").prop('checked', true);
                        that.$el.find(".filter-clear-wrap").removeClass("hide");
                    } else {
                        $(el).find("input").prop('checked', false);
                    }
                });
            }
            if(state) {
                this.$el.find('.js-state-filter[data-state="' + state + '"] input').prop('checked', true);
            }
        },
        onStateFilterClick: function(e){
            var target = $(e.currentTarget),
                is_checked = target.find('input').is(':checked'),
                revisionState = target.data('state'),
                num_state_checked_filters = this.$el.find('.js-state-filter input:checked').size();
            if(num_state_checked_filters === 0 || num_state_checked_filters === 2) {
                revisionState = false;
            } else if (!revisionState || is_checked == false){
                revisionState = target.siblings('.js-state-filter').data('state');
            }
            $('#ownership_self').prop('checked', true).parent().siblings('.js-ownership-filter').find('input').prop('checked', false);
            this.trigger('revisionStateFilterChange', {
                'includeRevisionsInState': revisionState,
                'ownership': 'owned'
            });
            if (window._ck12) {
                _ck12.logEvent('FBS_USER_ACTION', {
                    'memberID': window.ads_userid,
                    'value': target.find('label').text().trim(),
                    'status': is_checked,
                    'desc': 'FBS_LIBRARY_FILTER'
                });
            } else if (window.dexterjs) {
                var config = window.dexterjs.get('config');
                if (config && config.hasOwnProperty('mixins') && config.mixins.hasOwnProperty('appID')){
                    if ( config.mixins.appID == 'ltiApp') {
                        window.dexterjs.logEvent('FBS_USER_ACTION', {
                            'memberID': config.memberID,
                            'value': target.find('label').text().trim(),
                            'status': is_checked,
                            'desc': 'FBS_LIBRARY_FILTER'
                        });
                    }
                }
            }
        }
    });
    
    return OwnershipFiltersView;
});
