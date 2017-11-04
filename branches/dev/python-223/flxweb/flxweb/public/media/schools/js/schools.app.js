define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'schools/models/models',
    'schools/views/school.layout',
    'schools/views/school.list',
    'schools/views/school',
    'schools/views/banner',
    'schools/views/school.banner',
    'schools/views/state.selector',
    'schools/services/schools.services',
    'schools/services/school.seo',
    'common/utils/utils',
    'common/utils/url',
    'common/views/footer.view',
    'schools/views/SchoolModals',
    'schools/config/SchoolConfig'

], function($, _, Backbone, Marionette, Models, SchoolLayoutView, SchoolListView, SchoolView,
    BannerView, SchoolBannerView, StateSelectorView, schoolServices, schoolSEO, utils, URLHelper, FooterView , SchoolModals ,
    SchoolConfig ){
    'use strict';
    var SchoolsApp = Marionette.Application.extend({
        el: 'body',
        DEFAULT_STATE:'california',
        SHARE_THUMB_PREFIX : '/media/schools/images/share_thumbnails/',
        SHARE_THUMB_SUFFIX : '_school.png',
        SCHOOL_THUMB: 'school_individual.png',
        TMPL_STATE_META : _.template('List of all the CK-12 FlexBooks&reg; customized by schools from <%- data.state %>.', null, {variable:'data'}),
        TMPL_SCHOOL_META : _.template('List of all CK-12 FlexBooks&reg; customized by <%- data.school %>.', null, {variable:'data'}),
        viewMode: 'state',  //possible values: "state|school"
        readyState: $.Deferred(), //a js deferred object to handle sone weird race conditions,
        schoolBanner:null,
        initialize: function(){
            var _c = this;
            _.bindAll(this, 'loadSelection', 'bindEvents', 'showSchool',
                'onSchoolClick', 'showState', 'ready', 'onStatesReady',
                'onBookLinkClick', 'onBookDelete');

            this.schoolLocation = new Models.SchoolLocation();

            this.layout = new SchoolLayoutView();
            this.bannerView = new BannerView({});
            this.stateSelector = new StateSelectorView({});
            this.schoolList = new SchoolListView({
                collection: new Models.SchoolCollection([])
            });


            this.layout.render();
            this.layout.getRegion('stateSelector').show(this.stateSelector);
            this.layout.getRegion('list').show(_c.schoolList);
            this.bannerView.render();
            this.bindEvents();
        },
        home: function(){
            var _c = this,
                _state = _c.DEFAULT_STATE,
                _stateSlug;
            $.when(schoolServices.getLocation(), _c.ready()).done(function(data){
                if (data.region){
                    if(_c.stateSelector.findStateBySlug(utils.slugify(data.region))){
                        _state = data.region;
                    }
                }
            }).always(function(){
                _stateSlug = utils.slugify(_state);
                _c.stateSelector.setSelectedState(_stateSlug);
                _c.triggerMethod('stateNavigation', _stateSlug, true);
                _c.showSchoolsForState(_state);
                _c.logADS('SCHOOL_STATE_SELECTED', {
                    state:_state.replace(/-/g, ' '),
                    autoSelect: true
                });
            });
        },
        state: function(state){
            var _c = this;
            _c.ready().done(function(){
                if (_c.stateSelector.findStateBySlug(state)){
                    _c.showSchoolsForState(state);
                    _c.stateSelector.setSelectedState(state);
                } else {
                    _c.home();
                }
            });
        },
        school: function(state, school, id){
            var _c = this,
                school_slug = school,
                _state = state.replace(/-/g," "),
                school,
                data =  SchoolConfig.stateDetailsRequestParams;
            this.ready().done(function(){
                  data.state = state.replace(/-/g, ' ');
                _c.schoolLocation.fetch({
                    data: data
                }).done(function(data){
                    school = data.schoolArtifacts.find(function(m){
                        return m.get('schoolID') === id || m.get('slug') === (school_slug+'-'+id) || m.get('slug') === school_slug;
                    });
                    if(school){
                        _c.schoolDetailModel = school;
                        _c.showSchool(school);
                    }else{
                        _c.home();
                    }
                    
                });
            });
        },
        showSchoolsForState: function(state){
            var _c = this,
                statestr = state.replace(/-/g, ' '),
                stateName = utils.toTitleCase(statestr),
                stateThumb = new URLHelper(_c.SHARE_THUMB_PREFIX + statestr.replace(/\s+/g, '') + _c.SHARE_THUMB_SUFFIX).url(),
                data =  SchoolConfig.stateDetailsRequestParams; 
                data.state = statestr;
            _c.schoolLocation.fetch({
                data:data
             }).done(function(){
                var pageTitle = schoolSEO.getTitle(state) || stateName + ' Schools',
                    pageDescription = schoolSEO.getDescription(state) || _c.TMPL_STATE_META({state: stateName});
                _c.showState(_c.schoolLocation.get('schoolArtifacts').models);
                //SHARE OPTIONS FOR STATE
                FooterView.initShare({
                    'shareImage': stateThumb,
                    'shareUrl': window.location.href,
                    'shareTitle': 'Schools from ' + stateName,
                    'context': 'Share Schools from ' + stateName,
                    '_ck12': true
                });
                //SET DOCUMENT TITLE
                _c.setDocumentTitle(pageTitle);
                _c.setMetaDescription(pageDescription);
            });
        },
        showState: function(schools){
            this.schoolList.collection.reset(schools);
            this.layout.getRegion('list').show(this.schoolList);
            this.bannerView.render();
            this.layout.$('#schoolsFiltersTop').removeClass('hide');
            this.viewMode = 'state';
            $(this.el).addClass('app_view_state').removeClass('app_view_school');
        },
        showSchool: function(schoolModel){
            var _c = this;
                if(this.schoolBanner){
                    this.schoolBanner.$el.empty();
                    this.schoolBanner.undelegateEvents()
                    this.schoolBanner = null
                }
               var school = new SchoolView({
                    model: schoolModel,
                    detailView:true
                });

                this.schoolBanner = new SchoolBannerView({
                    model: schoolModel
                });
                schoolModel.fetchSchoolClaimStatus();

                schoolModel.on('change:schoolName', this.changePageTitle, this)
                
            this.layout.getRegion('list').show(school, { preventDestroy: true });
            // school.hideTitle();
            // school.showBreadcrumb();
            school.on('stateBreadcrumbClick', function(e){
                var _state = e.model.get('stateSlug');
                _c.state(_state);
                _c.triggerMethod('stateNavigation', _state);
            });
            this.layout.$('#schoolsFiltersTop').addClass('hide');
            this.viewMode = 'school';
            $(this.el).addClass('app_view_school').removeClass('app_view_state');
            this.schoolBanner.render();
            this.changePageTitle()


           
        },
        changePageTitle : function(){
            var _c = this,
                thumb = new URLHelper(_c.SHARE_THUMB_PREFIX + _c.SCHOOL_THUMB).url(),
                 schoolName = this.schoolDetailModel.get('schoolName');

             //SHARE OPTIONS FOR SCHOOL
            FooterView.initShare({
                'shareImage': thumb,
                'shareUrl': window.location.href,
                'shareTitle': schoolName,
                'context': 'Share School',
                '_ck12': true
            });
            //SET DOCUMENT TITLE
            this.setDocumentTitle(schoolName);
            this.setMetaDescription(this.TMPL_SCHOOL_META, {
                school: schoolName
            });
        },
        loadSelection: function(){
            var _c = this,
                _state = _c.stateSelector.selectedState;
            _c.triggerMethod('stateNavigation', _state);
            _c.showSchoolsForState(_state);
            _c.logADS('SCHOOL_STATE_SELECTED', {
                state:_state.replace(/-/g, ' '),
                autoSelect: false
            });
        },
        onSchoolClick: function(e){
            var state = e.model.get('stateSlug'),
                school = e.model.get('slug'),
                id = e.model.get('schoolID');
            this.triggerMethod('schoolNavigation', state, school, id);
            this.schoolDetailModel =  e.model
            this.showSchool(this.schoolDetailModel);
            $(document).scrollTop(0);
            this.logADS('SCHOOL_CLICK', {
                schoolName: e.model.get('schoolName'),
                state: e.model.get('state')
            });
        },
        onBookLinkClick: function(e){
            this.logADS('SCHOOL_FLEXBOOK_CLICK', {
                referer: this.viewMode,
                artifactID: e.model.get('artifactID'),
                state: e.model.get('state'),
                schoolName: e.model.get('schoolName'),
                title: e.model.get('artifactTitle')
            });
        },
        onBookDelete : function (e) {
          var bookModel = e.model
            console.log('deleting book with model data ', JSON.stringify(bookModel))
            SchoolModals.deleteFlexBook({
                schoolName : this.schoolDetailModel.get('schoolName'),
                schoolID : this.schoolDetailModel.get('schoolID'),
            }, function () {
                this.schoolDetailModel.deleteABook(bookModel);
            }.bind(this))

        },
        onStatesReady: function(){
            this.readyState.resolve();
            $('#stateSelector').removeClass('hide');
        },
        bindEvents: function(){
            this.stateSelector.on('stateSelectionChange', this.loadSelection);
            this.stateSelector.ready().done(this.onStatesReady);
            this.schoolList.on('childview:schoolClick', this.onSchoolClick);
            this.vent.on('bookClick', this.onBookLinkClick);
            this.vent.on('SchoolPage-DeleteBook', this.onBookDelete)
        },
        ready: function(){
            return this.readyState.promise();
        },
        logADS: function(eventName, payload){
            return window.dexterjs && window.dexterjs.logEvent(eventName, payload || {});
        },
        setDocumentTitle: function(title){
            var _title = '';
            if (title){
                _title += title + ' | ';
            }
            _title += 'CK-12 Foundation';
            document.title = _title;
        },
        setMetaDescription: function(description){
            var $meta = $('meta[name="description"]');
            if (!$meta.size()){
                $meta = $('<meta>').attr('name', 'description');
                $(document.head).append($meta);
            }
            $meta.attr('content', description);
        }
    });
    return SchoolsApp;
});
