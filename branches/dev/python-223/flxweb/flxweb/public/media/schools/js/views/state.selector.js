define([
    'underscore',
    'marionette',
    'schools/models/models',
    'schools/templates/templates',
    'common/utils/utils',
     'schools/config/SchoolConfig',
    'jquery'
],
function(_, Mn, Models, TMPL, utils, SchoolConfig,  $){
    'use strict';
    var StateView = Mn.ItemView.extend({
        template: _.template(TMPL.STATELINK, null, {variable: 'data'}),
        tagName: 'li',
        triggers: {
            'click .statelink': 'select'
        },
        initialize: function(){
            var name = this.model.get('name'),
                val = this.model.get('slug');
            this.$el.text(name)
                .attr('data-value', val)
                .attr('href', '/schools/' + val);
        },
        templateHelpers: function(){
        }
    });
    var StateSlectorView = Mn.CompositeView.extend({
        template: _.template(TMPL.STATESELECTOR, null),
        selectedState: 'california',
        readyState : $.Deferred(),
        childViewContainer: '#state-selection',
        childView: StateView,
        collection: new Models.StateCollection(),
        collectionEvents: {
            sync : 'render'
        },
        initialize: function(){
            var _c = this;
            this.$el.attr('name', 'states').attr('id', 'stateID').addClass('state-select');
            this.collection.fetch(SchoolConfig.stateCountRequestParams).done(function(){
                _c.triggerMethod('ready');
            });
            this.on('childview:select', function(e){
                _c.selectedState = e.model.get('slug');
                _c.triggerMethod('stateSelectionChange');
                _c.$('.js-dropdown').trigger('click');
                _c.refreshDropdown();

            });
        },
        refreshDropdown: function(){
            var state = this.selectedState,
                stateObj = this.findStateBySlug(state),
                stateName;
                console.log(stateObj);
            if (stateObj){
                stateName = stateObj.get('name');
                this.$('.state-selected-label').text(stateName+' ('+ stateObj.get('total') +')');
            }
        },
        onRender: function(){
            this.refreshDropdown();
        },
        setSelectedState: function(state){
            this.selectedState = state;
            this.refreshDropdown();
        },
        findStateBySlug: function(stateSlug){
            var state = this.collection.find(function(m){
                return m.get('slug') === stateSlug;
            });
            return state;
        },
        onReady: function(){
            this.readyState.resolve();
        },
        ready: function(){
            return this.readyState.promise();
        }
    });
    return StateSlectorView;
});
