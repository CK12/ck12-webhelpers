define([
  'jquery',
  'underscore',
  'backbone',
  'text!modality/templates/plix.widget.html'
], function($, _, Backbone, plixWidgetTemplate) {
  'use strict';
  var plixWidgetView = Backbone.View.extend({
    template: _.template(plixWidgetTemplate),
    initialize: function(options) {
      var ua = navigator.userAgent.toLowerCase();
      options = options || {};
      window.plixOfflineMessageTimer = 0;
      this.plixFrame = options.plixFrame;
      this.count = options.count;
      this.plixIconContainerHeight = 30;
      this.isAndroid = ua.indexOf("android") > -1;
      this.isIOS = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
      this.isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
      this.getModel(this.render.bind(this));
    },
    getModel: function(render){
      var decode = window.decodeURIComponent,
          plixUrl = decode(decode(this.plixFrame.src)),
          qIndex = plixUrl.indexOf("qID"),
          qEndIndex = plixUrl.indexOf("&",qIndex),
          qId;
      if(-1 == qEndIndex){
        qEndIndex = plixUrl.length;
      }
      qId = plixUrl.substring(qIndex + 4, qEndIndex);
      this.model = new (Backbone.Model.extend({
        url: "/assessment/api/get/info/question/"+ qId + "?includeBasicPlixDataOnly=true",
        parse: function(data){
          return data.response.question.questionData;
        }
      }));

      $.when(this.model.fetch()).then(render);
    },
    setMaximizeMinimizeVisibility: function(){
      var desc = this.container.find(".plix-description"),
          descLineHeight = window.getComputedStyle(desc[0])['line-height'].slice(0,-2)*1,
          descHeight = desc.height();
      if(descHeight < descLineHeight*3){
        this.container.find(".maximize-minimize").css("display","none");
      }
    },
    setWidgetWidth: function(){
      // in landscape, displaying small widget
      if(!this.expanded){
        this.container.css("max-width",Math.min(window.innerHeight, 500));
      } else {
        this.container.attr("style","");
      }
    },
    render: function() {
      var _this = this,
          attrs = this.model.attributes;
      this.$el.html( this.template({
        model: {
          title: attrs.content[1].title,
          description: attrs.content[1].description,
          previewImageUrl: attrs.previewImageUrl,
          count: _this.count
        }
      }));
      this.container = this.$(".plix-thumbnail-container:first");
      this.addClassMobileOrDesktop();
      this.setHeaderTextWidth();
      this.$(".plix-thumbnail-box img").off("load").on("load", function(){
        _this.$(".button-container").removeClass("hide");
      });
      var description = this.$('.plix-description')[0];
      try {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, description]);
      } catch(e) {
        console.log("MathJax not available ",e);
      }
      window.addEventListener("orientationchange", function(event){
        var initialHeight = window.innerHeight,
            outerHeight = window.outerHeight,
            counter = 1;
          // _this.onOrientationChange();
          var int = setInterval(function(){
            if((window.innerHeight !== initialHeight) || counter >= 20){
              clearInterval(int);
              console.log("detected in "+counter+ ' initialHeight '+initialHeight+' innerHeight '+window.innerHeight+' outerHeight '+window
                .outerHeight+' H2 '+outerHeight);
              if(_this.expanded){
                _this.container.find("button.try-online").trigger("click",true);
              }
              _this.setHeaderTextWidth();
            }
            counter ++;
          },100);
      });

      /* using events hash is not working sometimes on this page.
         So, binding event on document
      */
      $(document)
      .on("click.plix", "button.try-online, img.plix-thumbnail", _this.loadPlix.bind(_this))
      .on("click.plix", ".maximize-minimize", _this.maximizeMinimizeDescription.bind(_this))
      .on("click.plix", ".close-plix", _this.closePlixModal.bind(_this))
      .on("plixClosed.plix", _this.setHeaderTextWidth.bind(_this));
    },
    addClassMobileOrDesktop: function(){
      var container = this.container,
          allElm = container.find("*");
      if(this.isMobile){
        container.addClass("mobile");
        allElm.addClass("mobile");
      } else {
        container.addClass("desktop");
        allElm.addClass("desktop");
      }
    },
    maximizeMinimizeDescription: function(e){
      var targetEl = $(e.currentTarget),
          desc = this.container.find(".plix-description"),
          descLineHeight = window.getComputedStyle(desc[0])['line-height'].slice(0,-2)*1;
      if(this.count != targetEl.data("count")){
        return;
      }
      var expand = targetEl.find(".desc-expand"),
          collapse = targetEl.find(".desc-collapse");
      if(expand.hasClass("hide")){
        // minimze
        expand.removeClass("hide");
        collapse.addClass("hide");
        desc.css("max-height",descLineHeight*2+10 +"px");
      } else {
        //maximize
        expand.addClass("hide");
        collapse.removeClass("hide");
        desc.attr("style","");
      }
    },
    setHeaderTextWidth: function(){
      // set header text width to truncate title
      var rightButtonWidth = 0;
      this.setWidgetWidth();
      if(this.isMobile && this.expanded){
        rightButtonWidth = this.container.find(".interactive-header a").outerWidth(true);
      } else {
        // rightButtonWidth = this.$(".interactive-header button").outerWidth(true);
        rightButtonWidth = 0;
      }
      this.container.find(".interactive-header-text").css("width",
        (this.container.find(".interactive-header").outerWidth(true) - this.container.find(".interactive-header-icon").outerWidth(true) -
        rightButtonWidth)+ "px");
    },
    applyOrientationChanges: function(landscape){
      var plixDimension = this.plixDimension,
          width = this.isIOS ? window.innerWidth : window.outerWidth,
          height = this.isIOS ? window.innerHeight : window.outerHeight,
          plixDescription = this.container.find(".plix-description"),
          headerHeight = this.container.find(".interactive-header").outerHeight(),
          screenWidth = window.screen.availWidth;

        console.log("applyOrientationChanges---innerWidth "+width+" availWidth "+screenWidth+" outerWidth "+window.outerWidth)

      screenWidth = width;
      // this.loadIframe();
      if(landscape){
        // landscape
        this.container.find(".plix-meta").css("float","right").css("width", screenWidth - plixDimension + this.plixIconContainerHeight + "px");
        this.container.find(".plix-box").css("float","left").removeClass("portrait");
        plixDescription.css("max-height", height - headerHeight);
      } else {
        // portrait
        this.container.find(".plix-meta").attr("style","");
        this.container.find(".plix-box").css("float","none").addClass("portrait");
        plixDescription.css("max-height", height - headerHeight - plixDimension - this.plixIconContainerHeight);
      }
      this.setHeaderTextWidth();
    },
    onOrientationChange: function(){
      if(!this.container.find(".plix-meta").hasClass("mobile")){
        return;
      }
      var portrait = window.innerHeight > window.innerWidth;

      this.applyOrientationChanges(!portrait);
    },
    getPlixDimension: function(){
      var width = this.container.outerWidth(),
          screenHeight = this.isIOS ? window.innerHeight : window.outerHeight,
          screenWidth = this.isIOS ? window.innerWidth : window.outerWidth,
          plixDimension = 0,
          portrait = screenHeight > screenWidth,
          desc = this.container.find(".plix-description"),
          descLineHeight = window.getComputedStyle(desc[0])['line-height'].slice(0,-2)*2+10,
          headerHeight = this.container.find(".interactive-header").height();
      plixDimension = this.isMobile ? portrait ? Math.min(screenWidth, screenHeight - headerHeight - descLineHeight - this.plixIconContainerHeight) : Math.min(screenWidth, screenHeight) : Math.min(width, screenHeight);
      return plixDimension;
    },
    closePlixModal: function(e){
      if(this.count != $(e.currentTarget).data("count")){
        return;
      }
      if(this.isMobile){
        $("body > *:not(script)").removeClass("hide");
        this.hiddenChildren.addClass("hide");
        $(window).scrollTop(this.scrollTop);
        this.$el.append($("body > .plix-thumbnail-container"));
      }
      // $("body").removeClass("no-scroll-plix");
      this.container.removeClass("expand");
      this.container.find("*").removeClass("expand");
      this.container.find(".plix-box iframe").addClass("hide");
      this.container.find(".plix-meta, .plix-box").attr("style","");
      this.expanded = false;
      this.container.trigger("plixClosed");
    },
    logADS: function(){
      var dexterjs = window.dexterjs,
          artifactID = window.artifactID;
      if(dexterjs && artifactID){
        dexterjs.logEvent("FBS_USER_ACTION",{
          desc: "plix_embed_fb_try_it",
          artifactID: artifactID
        });
      }
    },
    loadIframe: function(){
      var portraitOrDesktop = this.isMobile ? window.innerHeight > window.innerWidth : true;
      this.plixDimension = this.getPlixDimension();
      this.container.find(".plix-box").css({
        'width': portraitOrDesktop ? this.plixDimension : this.plixDimension - this.plixIconContainerHeight, // adding space for reset icon
        'height': portraitOrDesktop ? this.plixDimension + this.plixIconContainerHeight : this.plixDimension
      });
      this.container.find(".plix-box").append(this.plixFrame);
      this.container.find(".plix-box iframe").removeClass("hide");
    },
    loadPlix: function(e,orientationchanged) {
      var target = $(e.currentTarget);
      if(this.count != target.data("count")){
        return;
      }
      var container = this.container,
        header = this.container.find(".interactive-header:first"),
        allElm = container.find("*"),
        meta = this.container.find(".plix-meta"),
        button = meta.find("button"),
        _this = this;
      
      // do offline check
      window.clearTimeout(window.plixOfflineMessageTimer);
      if(!window.navigator.onLine && !orientationchanged){
        this.container.find('.offline-text').stop().fadeOut(0).fadeIn(0);
        window.plixOfflineMessageTimer = window.setTimeout(function(){
          _this.container.find('.offline-text').stop().fadeOut(2000);
        },10000);
        return;
      } else {
        this.container.find('.offline-text').stop().fadeOut(0);
      }
      if(!orientationchanged){
        this.logADS();
      }
      allElm.addClass("expand");
      if(this.isMobile){
        container.addClass("expand");
        this.scrollTop = $(window).scrollTop();
        $(window).scrollTop(0);
        // $("body").addClass("no-scroll-plix");// disabling scrolling on body
      } else {
        this.setMaximizeMinimizeVisibility();
      }
      container.addClass("expand");
      this.loadIframe();
      this.expanded = true;
      this.onOrientationChange();
      if(this.isMobile){
        $("body").prepend(container);
        if(!orientationchanged){
          this.hiddenChildren = $("body").children(".hide");
        }
        $("body > *:not(script)").addClass("hide");
        container.removeClass("hide");
      }
    }
  });
  return plixWidgetView;
});
