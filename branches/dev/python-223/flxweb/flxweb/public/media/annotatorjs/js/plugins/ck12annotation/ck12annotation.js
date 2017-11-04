define(['jquery', 'annotator'], function($){

    var COLORS;

    var _bind = function(thisObj, fn){
        return function(){
            return fn.apply(thisObj, arguments);
        };
    };

    var gettext = null;

    if (typeof Gettext !== 'undefined' && Gettext !== null) {
        _gettext = new Gettext({
            domain: 'annotator'
        });
        gettext = function(msgid) {
            return _gettext.gettext(msgid);
        };
    } else {
        gettext = function(msgid) {
            return msgid;
        };
    }

    var _t = function(msgid) {
        return gettext(msgid);
    };

// =============================== CK12 Annotation Plugin ===============================
    Annotator.Plugin.CK12Annotation = function (element, config) {
        // Same as before.
        Annotator.Plugin.apply(this, arguments);
        this.highlightColors = COLORS = config.colors;
        this.isLoggedIn = config.isLoggedIn;
    };

    jQuery.extend(Annotator.Plugin.CK12Annotation.prototype, new Annotator.Plugin(), {
        events:{
            '.annotator-hl click': 'showEditAdder',
            '.annotator-viewer .annotator-item mouseover': 'onHoverView',
            '.annotator-cancel click.annotator': 'onClickCancel',
            '.signin-link': 'showSigninDialog',
            // '.adder-container click': 'onAdderClick',
            // '.adder-container mousedown': 'onAdderMousedown',
            '.toolbar-btn-container click': 'onToolbarClick',
            // '.annotation-icon click': 'onAnnotationIconClick'
        },
        options: {
            // Any default options.
            // clickOrSelect: 'select',
            defaultColor: 'c4',
            mode: 'normal', //could be 'normal', 'highlight' or 'note'
            containerPos: 'middle', //left, middle, right
            annotation:{},
            action: '' //update or create
            // source: '' // for ADS (floating, select or my_notes)
        },
        pluginInit: function () {

            this.onAnnotationEditorSubmit = _bind(this, this.onAnnotationEditorSubmit);
            this.onAnnotationCreatedInServer = _bind(this, this.onAnnotationCreatedInServer);
            this.onAnnotationViewShown = _bind(this, this.onAnnotationViewShown);
            this.onHideViewer = _bind(this, this.onHideViewer);
            this.onAnnotationCreated = _bind(this, this.onAnnotationCreated);
            this.onAnnotationUpdated = _bind(this, this.onAnnotationUpdated);
            this.onGetAllAnnotations = _bind(this, this.onGetAllAnnotations);
            this.onAnnotationDeleted = _bind(this, this.onAnnotationDeleted);
            this.onAnnotationIconClick = _bind(this, this.onAnnotationIconClick);
            this._onSelection = _bind(this,this._onSelection);
            this._onDeselection=_bind(this,this._onDeselection);
            this.showEditAdder = _bind(this, this.showEditAdder);
            this.onAdderClick = _bind(this, this.onAdderClick);
            this.onAdderMousedown = _bind(this, this.onAdderMousedown);
            this.onToolbarClick = _bind(this, this.onToolbarClick);
            this.onAnnotationEditorShown = _bind(this, this.onAnnotationEditorShown);
            this.onAnnotationEditorHidden = _bind(this, this.onAnnotationEditorHidden);

            this.showAdder = _bind(this, this.showAdder);

            this.annotator.subscribe('annotationEditorSubmit',this.onAnnotationEditorSubmit);
            this.annotator.subscribe('annotationViewerShown', this.onAnnotationViewShown);
            this.annotator.subscribe('annotationCreatedInServer', this.onAnnotationCreatedInServer);
            this.annotator.subscribe('annotationCreated', this.onAnnotationCreated);
            this.annotator.subscribe('annotationUpdated', this.onAnnotationUpdated);
            this.annotator.subscribe('allAnnotations', this.onGetAllAnnotations);
            this.annotator.subscribe('annotationDeleted', this.onAnnotationDeleted);
            this.annotator.subscribe('annotationEditorShown', this.onAnnotationEditorShown);
            this.annotator.subscribe('annotationEditorHidden', this.onAnnotationEditorHidden);

            this.annotator.viewer.subscribe('hide', this.onHideViewer);
            this.createNewEditor();

            this.annotationsPromise = $.Deferred();
            this.createAnnotationToolbar();
            this._setupAdder();
            this.annotator.subscribe("showAdder", this._onSelection);
            this.annotator.subscribe("hideAdder", this._onDeselection);
        },
        _fieldIDs: {
            colors: 'ck12annotation-colors',
            noteEditor: 'ck12annotation-noteEditor'
        },
        _fieldEls: {
            colors: null,
            noteEditor: null
        },
        _setupAdder: function(){
            this.annotator.adder.remove();
            this.createAdderTemplate();
            this.adder = jQuery(this.template).appendTo(this.annotator.wrapper.parent()[0]);
            this.adder.off('click').on('click', this.onAdderClick)
                      .off('mousedown').on('mousedown', this.onAdderMousedown);
            if(!this.isLoggedIn){
                this.adder.find('.disable-mask').removeClass('hide');
                this.adder.find('.signin-message').removeClass('hide');
            }
            this.hideAdder();
        },
        createAdderTemplate: function(){
            return this.template = '<div class="adder-container">'+
                                        '<div class="disable-mask hide"></div>'+
                                        '<div class="adder-item colors-container">'+
                                            this.createColorHTML()+
                                        '</div>'+
                                        '<div class="adder-item add-note-btn new-item">' +
                                            'Add Note'+
                                        '</div>'+
                                        '<div class="adder-item edit-note-btn edit-item">' +
                                            'Edit Note'+
                                        '</div>'+
                                        '<div class="adder-item remove-note-btn edit-item">' +
                                            '<i class="icon-remove"></i>'+
                                        '</div>'+
                                        '<div class="signin-message hide"> Please <a href="#" class="signin-link">Sign In</a> to create your own Highlights / Notes</div>'+
                                    '</div>';
        },
        _onSelection: function(pos){
            this.showAdder(pos, true);
            if(this.options.mode === 'highlight'){
                this.adder.find('.circle').first().trigger('click');
            }else if( this.options.mode === 'note'){
                this.adder.find('.add-note-btn').trigger('click');
            }
        },
        _onDeselection: function(){
            this.hideAdder();
        },
        showEditAdder: function(e){   //when click on highlighted text
            e.stopPropagation();
            this.options.annotation  = $(e.currentTarget).data('annotation');
            var annotation = this.options.annotation;

            var pos = Annotator.Util.mousePosition(e, this.annotator.wrapper[0]);

            if(annotation.text && annotation.text.trim().length > 0){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_NOTE', {
                        artifactID: annotation.artifactID,
                        artifactRevisionID: annotation.revisionID,
                        color: annotation.highlightColor,
                        source : 'select',
                        annotationID: annotation.id,
                        action: 'click'
                    });
                }
            }else{
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_HIGHLIGHT', {
                        artifactID: annotation.artifactID,
                        artifactRevisionID: annotation.revisionID,
                        color: annotation.highlightColor,
                        source : 'select',
                        annotationID: annotation.id,
                        action: 'click'
                    });
                }
            }
            this.showAdder(pos, false);
        },
        showAdder: function(pos, isNewAnnotation){
            if(isNewAnnotation){
                this.adder.find('.edit-item').addClass('hide');
                this.adder.find('.new-item').removeClass('hide');
            }else{
                this.adder.find('.edit-item').removeClass('hide');
                this.adder.find('.new-item').addClass('hide');
                this.adder.find('.circle').removeClass('selected-color');
                this.adder.find('[data-color='+this.options.annotation.highlightColor+']').addClass('selected-color');
                if(this.options.annotation.text && this.options.annotation.text.length > 0){
                    this.adder.find('.edit-note-btn').html('Edit Note');
                }else{
                    this.adder.find('.edit-note-btn').html('Add Note');
                }
            }
            var container = this.annotator.wrapper;
            var containerWidth = container.width();
            var containerPaddingLeft = parseInt(container.css('padding-left')),
                containerPaddingTop = parseInt(container.css('padding-top'));
            var adderWidth = 329;
            var adderPos = this.adder.position();
            if(pos.left > containerWidth - adderWidth/2){     // right
                this.adder.attr('class','adder-container exceedRight');
                if(pos.left > containerWidth - 22){
                    pos.left = containerWidth - adderWidth - 2 * containerPaddingLeft -22;
                }else{
                    pos.left -= adderWidth;
                }
                this.options.containerPos = 'right';
            }else if(pos.left - adderWidth/2 < 0){    // left
                this.adder.attr('class', 'adder-container exceedLeft')
                if(pos.left < 22 ){
                    pos.left = containerPaddingLeft+22;
                }
                this.options.containerPos = 'left';
            }else{   //middle
                this.options.containerPos = 'middle';
                this.adder.attr('class', 'adder-container');
            }
            this.adder.css(pos).show();

        },
        hideAdder: function(){
            this.adder.find('.circle').removeClass('selected-color');
            this.options.annotation = {};
            this.adder.hide();
        },
        onAdderClick: function(e){
            var $adderItem = $(e.target);
            var position = this.adder.position();
            var isNewAnnotation = true;

            var annotation = this.options.annotation;

            if($adderItem.hasClass('disable-mask') || $adderItem.hasClass('signin-message')){
                return false;
            }else if($adderItem.hasClass('signin-link')){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_SIGNIN_CTA', {
                        feature: 'annotations',
                        source : 'select',
                        additional_params1: window.artifactID,
                        additional_params2: window.artifactRevisionID
                    });
                }
                this.showSigninDialog();
                this.hideAdder();
                return false;
            }
            if(Object.keys(annotation).length === 0){
                if(!$(e.target).hasClass('colors-container')){
                    annotation = this.annotator.setupAnnotation(this.annotator.createAnnotation());
                }
            }else{
                isNewAnnotation = false;
            }

            var color = $adderItem.attr('data-color');

            if(color){  //selecte a color
                this.createColorAnnotation(color, annotation, isNewAnnotation);
                $(annotation.highlights).attr('class', 'annotator-hl '+ (color || this.options.defaultColor));
                this.hideAdder();
            }else if($adderItem.hasClass('icon-remove') || $adderItem.hasClass('remove-note-btn')){
                if(annotation.text && annotation.text.trim().length > 0){ //note
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_NOTE', {
                            artifactID: window.artifactID,
                            artifactRevisionID: window.artifactRevisionID,
                            color: annotation.highlightColor,
                            source : 'select',
                            annotationID: annotation.id,
                            action: 'delete'
                        });
                    }
                }else{ //highlight
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_HIGHLIGHT', {
                            artifactID: window.artifactID,
                            artifactRevisionID: window.artifactRevisionID,
                            color: annotation.highlightColor,
                            source : 'select',
                            annotationID: annotation.id,
                            action: 'delete'
                        });
                    }
                }
                this.hideAdder();
                this.annotator.deleteAnnotation(annotation);
            }else if($adderItem.hasClass('edit-note-btn')||$adderItem.hasClass('add-note-btn')){  //click on addNote button
                if(this.options.containerPos === 'right'){
                    position.left += 310;
                }
                if(isNewAnnotation){
                    annotation.highlightColor = this.options.defaultColor;
                    $(annotation.highlights).attr('class', 'annotator-hl '+ (color || this.options.defaultColor));
                }
                this.hideAdder();
                this.showEditor(annotation, position, isNewAnnotation);
            }
            return false;
        },
        // call this function when there is just a selected color
        createColorAnnotation: function(color, annotation, isNewAnnotation){
            annotation.highlightColor = color || this.options.defaultColor;
            annotation.annotation_type = annotation.text ? 'note' : 'highlight';
            var state = isNewAnnotation? 'annotationCreated': 'annotationUpdated';
            if(state === 'annotationUpdated'){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_HIGHLIGHT', {
                        artifactID: window.artifactID,
                        artifactRevisionID: window.artifactRevisionID,
                        color: annotation.highlightColor,
                        source : 'select',
                        annotationID: annotation.id,
                        action: 'edit'
                    });
                }
            }
            this.annotator.publish(state, [annotation]);
        },
        showEditor: function(annotation, position, isNewAnnotation){
            var that = this;

            if(isNewAnnotation){
                var cleanup = function(){
                    that.annotator.unsubscribe('annotationEditorHidden', cancel);
                    that.annotator.unsubscribe('annotationEditorSubmit', save);
                }
                var save = function(){
                    cleanup();
                    $(annotation.highlights).removeClass('annotator-hl-temporary');
                    that.annotator.publish('annotationCreated', [annotation]);
                }
                var cancel = function(){
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_NOTE', {
                            artifactID: window.artifactID,
                            artifactRevisionID: window.artifactRevisionID,
                            color: annotation.highlightColor,
                            source : that.options.mode === 'normal'? 'select': 'floating',
                            // annotationID: annotation.id,
                            action: 'cancel'
                        });
                    }
                    cleanup();
                    that.annotator.deleteAnnotation(annotation);
                }

                this.annotator.subscribe('annotationEditorHidden', cancel);
                this.annotator.subscribe('annotationEditorSubmit', save);
            }else{

                var cleanup = function() {
                    that.annotator.unsubscribe('annotationEditorHidden', cancel);
                    that.annotator.unsubscribe('annotationEditorSubmit', update);
                };
                var update = function() {
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_NOTE', {
                            artifactID: window.artifactID,
                            artifactRevisionID: window.artifactRevisionID,
                            color: annotation.highlightColor,
                            source : 'select',
                            annotationID: annotation.id,
                            action: 'edit'
                        });
                    }
                    cleanup();
                    that.annotator.updateAnnotation(annotation);
                };
                var cancel = function(){
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_NOTE', {
                            artifactID: window.artifactID,
                            artifactRevisionID: window.artifactRevisionID,
                            color: annotation.highlightColor,
                            source : 'select',
                            annotationID: annotation.id,
                            action: 'cancel'
                        });
                    }
                    cleanup();
                }

                this.annotator.subscribe('annotationEditorHidden', cancel);

                this.annotator.subscribe('annotationEditorSubmit', update);
            }

            this.annotator.showEditor(annotation, position);
        },
        onAdderMousedown: function(event){
            event.preventDefault();
            this.annotator.ignoreMouseup = true;
        },
        createAnnotationToolbar: function(){
            var content_container = this.annotator.wrapper;
            var toolBarHTML = '<div class="ck12-annotation-toolbar-container">'+
                                    '<div class="toolbar-btn-container btn-highlight" title="Highlight Text"><img src="/media/annotatorjs/img/highlight_white.png"></div>' +
                                    '<div class="toolbar-btn-container btn-note" title="Add Notes"><img src="/media/annotatorjs/img/notes_white.png"></div>'+
                               '</div>';
            var $toolBar = $(toolBarHTML);
            this.toolBar = $toolBar;
            content_container.append($toolBar);
            var that = this;
            var maxPos = this.annotator.wrapper.height();

            var diff = content_container.offset().top;
            if(window.isWidgetAvailable){
            	$toolBar.addClass("widget-annotation-aposition");
            }

            $(window).scroll(function(){
                var rightSide = content_container.offset().left + content_container.width();
                if($(window).scrollTop() > maxPos+200){
                    $toolBar.removeClass('fixed-position');
                    $toolBar.css({
                        left: "",
                        top: maxPos
                    });
                }else if($(window).scrollTop() > diff-200){
                    if(!$toolBar.hasClass('fixed-position')){
                        // var offset = $toolBar.offset();
                        $toolBar.addClass('fixed-position');
                    }
                    if(window.isWidgetAvailable){
                    	$toolBar.css({
                            top: 200,
                            left: rightSide-106 //subtracting change in right for widget
                        })
                    }else{
                    	  $toolBar.css({
                              top: 200,
                              left: rightSide-106
                          })
                    }

                }else{
                    $toolBar.removeClass('fixed-position');
                    $toolBar.css({
                        top:"",
                        left: ""
                    })
                }
            });
        },
        showSigninDialog: function(){
            require(['common/views/login.popup.view'], function(loginPopup){
                loginPopup.showLoginDialogue();
            });
        },
        onToolbarClick: function(e){
            if(!this.isLoggedIn){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_SIGNIN_CTA', {
                        feature: 'annotations',
                        source : 'floating',
                        additional_params1: window.artifactID,
                        additional_params2: window.artifactRevisionID
                    });
                }
                this.showSigninDialog();
                return false;
            }
            var toolbarBtn = $(e.currentTarget)
            toolbarBtn.toggleClass('selected');

            if(toolbarBtn.hasClass('btn-note')&& toolbarBtn.hasClass('selected')){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_NOTE', {
                        artifactID: window.artifactID,
                        artifactRevisionID: window.artifactRevisionID,
                        color: 'c4',
                        source : 'floating',
                        action: 'click'
                    });
                }
                if(!toolbarBtn.parent().hasClass('tool-enable')){
                  toolbarBtn.parent().addClass('tool-enable');
                }
                toolbarBtn.siblings().removeClass('selected');
                this.options.mode = 'note';
                this.annotator.wrapper.attr('class', 'annotator-wrapper note-cursor');
            }else if(toolbarBtn.hasClass('btn-highlight')&& toolbarBtn.hasClass('selected')){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_HIGHLIGHT', {
                        artifactID: window.artifactID,
                        artifactRevisionID: window.artifactRevisionID,
                        color: 'c4',
                        source : 'floating',
                        action: 'click'
                    });
                }

                if(!toolbarBtn.parent().hasClass('tool-enable')){
                  toolbarBtn.parent().addClass('tool-enable');
                }
                toolbarBtn.siblings().removeClass('selected');
                this.options.mode = 'highlight';
                this.annotator.wrapper.attr('class', 'annotator-wrapper highlight-cursor');
            }else{
                toolbarBtn.parent().removeClass('tool-enable');
                this.options.mode = 'normal';
                this.annotator.wrapper.attr('class', 'annotator-wrapper');
            }
        },
        createNewEditor: function(){

            var noteEditorField = this.annotator.editor.addField({
                ck12ID: this._fieldIDs.noteEditor,
                type: 'textarea',
                label: _t('Add note here') + '…',
                load: function(field, annotation) {
                    return $(field).find('textarea').val(annotation.text || '');
                },
                submit: function(field, annotation) {
                    return annotation.text = $(field).find('textarea').val();
                }
            });

            var titleField = this.annotator.editor.addField({
                ck12ID: this._fieldIDs.colors,
                innerHTML: '<div class="title">Add Note</div>',

                load: function(field, annotation){}
            });

            this._fieldEls.noteEditor   = $(noteEditorField);
            this._fieldEls.colors       = $(titleField);
        },
        createColorHTML: function(){
            var highlightColorsHTML = '';

            Object.keys(this.highlightColors).forEach(function(color, index){
                highlightColorsHTML += '' +
                '<div class="circle "' +
                    // (index === 0 ? 'selected-color' : '' ) + '"' +
                    ' data-color="' + color + '"' +
                    ' style="background:' + this.highlightColors[color] + '">' +
                '</div>';

            }, this);
            return highlightColorsHTML;
        },
        isContainedHighlight: function(){
            return ($('.annotator-hl > .annotator-hl-temporary').length !== 0) || ($('.annotator-hl-temporary > .annotator-hl').length !== 0);
        },
        getAnnotation: function(){
            var annotation = null;
            if($('.annotator-hl > .annotator-hl-temporary').length !== 0){
                annotation = $('.annotator-hl > .annotator-hl-temporary').parent().data('annotation');
            }else{
                annotation = $('.annotator-hl-temporary > .annotator-hl')[0].data('annotation');
            }
            return annotation;
        },
        setSelectedColor: function(color){
            $('.circle').removeClass('selected-color');
            $('.circle[data-color='+color+']').addClass('selected-color');
        },
        onGetAllAnnotations: function(annotations){
            this.annotationsPromise.resolve(annotations);
        },
        getAnnotations: function(){
            return this.annotationsPromise;
        },
        onAnnotationEditorSubmit: function(editor, annotation){
            var color = $('.circle.selected-color').attr('data-color');
            if(color){
                annotation.highlightColor  = color;
            }

            annotation.annotation_type = annotation.text ? 'note' : 'highlight'; // eslint-disable-line camelcase

            // this.options.annotation = annotation;
        },
        onAnnotationCreated: function(annotation){
            this.options.action = 'create';
            this.removeTextSelection();
            this.createAnnotationIcon(annotation);
        },
        createAnnotationIcon: function(annotation){
            var $selected = $(annotation.highlights).last();
            var isInMath = $selected.closest('.x-ck12-mathEditor');
            // $(annotation.highlights).addClass(annotation.highlightColor);
            if(isInMath.length !== 0){
                isInMath.addClass('highlight-temp');
                isInMath.data('annotation', annotation);
                if(annotation.text && annotation.text.trim().length > 0){
                    isInMath.append('<i class="annotation-icon icon-notes annotation-icon-temp"></i>');
                }
            }else{
                // $(annotation.highlights).addClass(annotation.highlightColor);
                if(annotation.text && annotation.text.trim().length > 0) {
                    $selected.append('<i class="annotation-icon icon-notes annotation-icon-temp"></i>');
                }
            }

            annotation.annotation_type = annotation.text ? 'note' : 'highlight'; // eslint-disable-line camelcase
        },
        onAnnotationUpdated: function(annotation){
            this.options.action = 'update';
            this.options.annotation = {};
            $(document).trigger('updateAnnotation', annotation);
            if( !annotation.text || annotation.text.trim().length === 0){
                $('.annotation-icon[data-id='+annotation.id+']').remove();
            }
            if($('.annotation-icon[data-id='+annotation.id+']').length === 0){
                this.createAnnotationIcon(annotation);
            }
        },
        onAnnotationViewShown: function(viewer, annotations){
            if(annotations.length === 0){
                return;
            }
            var overlapIcons = [];
            var targetPosition = null;
            for(var i = 0; i < annotations.length; i++){
                targetPosition = $('.annotation-icon[data-id='+(annotations[i].id)+']').position();
                if(targetPosition){
                    break;
                }

            }
            var allAnnotationIcons = $('.annotation-icon');
            $.each(allAnnotationIcons, function(index, value){
                var position = $(value).position();
                if($(value).parent().data('annotation').text.trim().length !== 0){
                    if(targetPosition.top === position.top  && targetPosition.left === position.left){

                        overlapIcons.push($(value).parent().data('annotation'));
                    }
                }
            });
            if(overlapIcons.length > 1){   // multiple note icons overlap
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_NOTE', {
                        artifactID: window.artifactID,
                        memberID: annotations[0].memberID,
                        artifactRevisionID: window.artifactRevisionID,
                        source : 'multiple_side_note',
                        action: 'click'
                    });
                }
                overlapIcons.forEach(function(anno){
                    if(annotations[0].id !== anno.id){
                        annotations.push(anno);
                    }
                });
                viewer.load(overlapIcons);
            }else{   // one note icon
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_NOTE', {
                        artifactID: window.artifactID,
                        artifactRevisionID: window.artifactRevisionID,
                        color: annotations[0].highlightColor,
                        source : 'single_side_note',
                        annotationID: annotations[0].id,
                        action: 'click'
                    });
                }
                var that = this;
                viewer.element.find('.annotator-edit').each(function(index, el){
                    if($(el).closest('.annotator-item').data('annotation').text.length > 0){
                        $(el).trigger('click');
                    }
                });
            }
        },
        onAnnotationCreatedInServer: function(annotation){
            if(this.options.action === 'create'){
                if(annotation.text && annotation.text.trim().length > 0){ // hightlight create
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_NOTE', {
                            artifactID: annotation.artifactID,
                            artifactRevisionID: annotation.revisionID,
                            color: annotation.highlightColor,
                            source : this.options.mode === 'normal'? 'select': 'floating',
                            annotationID: annotation.id,
                            action: 'create'
                        });
                    }
                }else{                                                      //note create
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_HIGHLIGHT', {
                            artifactID: annotation.artifactID,
                            artifactRevisionID: annotation.revisionID,
                            color: annotation.highlightColor,
                            source : this.options.mode === 'normal'? 'select': 'floating',
                            annotationID: annotation.id,
                            action: 'create'
                        });
                    }
                }
                $(document).trigger('createdNewAnnotation', annotation); // send to table(outside of annotator)
                this.options.action = '';
            }
            if(annotation.text && annotation.text.trim().length > 0){
                var icon = $('.annotation-icon-temp');
                icon.attr('data-id', annotation.id);
                icon.removeClass('annotation-icon-temp');
            }

            $(annotation.highlights).data('annotation', annotation);
            $(annotation.highlights).attr('data-annotation-id', annotation.id);

        },
        removeTextSelection: function(){
            if (window.getSelection) {
                if(window.getSelection().empty) {  // Chrome
                    window.getSelection().empty();
                }else if(window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
                }else if(document.selection) {  // IE?
                    document.selection.empty();
                }
        },
        onAnnotationDeleted: function(annotation){
            $('.annotation-icon[data-id='+annotation.id+']').remove();
            $(document).trigger('deletedAnnotation', annotation);
        },
        onHoverView: function(e){
            var anno = $(e.currentTarget).data('annotation');
            $('.selected-annotation').removeClass('selected-annotation');
            $('.annotator-hl[data-annotation-id='+anno.id+']').addClass('selected-annotation');
        },
        onHideViewer: function(){
            $('.selected-annotation').removeClass('selected-annotation');
        },
        onClickCancel: function(){
            $('.selected-annotation').removeClass('selected-annotation');
        },
        onAnnotationEditorShown: function(editor, annotation){
            $('.annotator-hl[data-annotation-id='+annotation.id+']').addClass('selected-annotation');
        },
        onAnnotationEditorHidden: function(editor){
            $('.selected-annotation').removeClass('selected-annotation');
        },
        destroy: function(){
            this.annotator.wrapper.unbind('click');
            this.annotator.wrapper.attr('class', 'annotator-wrapper');
            this.toolBar.remove();
            this.adder.remove();
            $('.annotation-icon.icon-notes').remove();
            this.annotator.unsubscribe('annotationEditorSubmit',this.onAnnotationEditorSubmit);
            this.annotator.unsubscribe('annotationViewerShown', this.onAnnotationViewShown);
            this.annotator.unsubscribe('annotationCreatedInServer', this.onAnnotationCreatedInServer);
            this.annotator.unsubscribe('annotationCreated', this.onAnnotationCreated);
            this.annotator.unsubscribe('annotationUpdated', this.onAnnotationUpdated);
            this.annotator.unsubscribe('allAnnotations', this.onGetAllAnnotations);
            this.annotator.unsubscribe('annotationDeleted', this.onAnnotationDeleted);
            this.annotator.unsubscribe('annotationEditorShown', this.onAnnotationEditorShown);
            this.annotator.unsubscribe('annotationEditorHidden', this.onAnnotationEditorHidden);
            this.annotator.viewer.unsubscribe('hide', this.onHideViewer);
            this.annotator.unsubscribe("showAdder", this._onSelection);
            this.annotator.unsubscribe("hideAdder", this._onDeselection);
        }
    });
});
