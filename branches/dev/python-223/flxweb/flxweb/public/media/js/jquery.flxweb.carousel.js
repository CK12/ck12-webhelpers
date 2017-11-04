/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Nachiket Karve
 * 
 * $Id$
 */

$.fn.ck12_carousel = function(options){
    /*
     * CK-12 jQuery Carousel Plugin
     * initializes the carousel and binds the click handlers for prev/next buttons
     * 
     */
    
    //Default settings
    var defaults = {
            step : 2, //number of items scrolled with prev/next is clicked
            speed: 300, //scrolling animation speed
            visible: 2, //number of items visible
            inactiveBtnClass : 'inactive', //class to be applied on prev/next buttons when showing first/last set of items
            btnPrev  : null, //Default: null; expects: jQuery object that will act as previous button; eg: $("#btn_prev")
            btnNext : null //Default: null; expects: jQuery object that will act as next button; eg: $("#btn_next")
    };
    //overwrite defaults with specified options
    var options = $.extend(defaults, options);
    
    return this.each(function(){
        var c = $(this); //container
        
        var carousel = $(c).find(".carousel");
        var carouselList = $(carousel).find('ul');
        var carouselItems = $(carousel).find('ul li');
        var btnPrev = options.btnPrev;
        if(!btnPrev){
            btnPrev = $(c).find('.btnPrev');
        }
        
        var btnNext = options.btnNext;
        if(!btnNext){
            btnNext = $(c).find('.btnNext');
        }
        
        var step = options.step; 
        var speed = options.speed;
        
        var current = 0; 
        var maximum = carouselItems.size(); 
        var visible = 2; 
        var liSize = parseInt(carouselItems.width());
        var carousel_height = $(carousel).height();
        
        var ulSize = liSize * maximum;   
        var divSize = liSize * visible;
        
        var animating = false;
        
        $(carouselList).css("width", ulSize+"px");
        
        function setBtnStates(){
            $(btnPrev).removeClass('inactive');
            $(btnNext).removeClass('inactive');
            //no scrollable items
            if (maximum < visible){
                $(btnPrev).addClass('inactive');
                $(btnNext).addClass('inactive');
            }
            //no scroll forward
            if (current >= maximum-step){
                $(btnNext).addClass('inactive');
            }
            //no scroll backwards
            if(current <=0){
                $(btnPrev).addClass('inactive');
            }
            //TODO: alternative approach to make this information available on the carousel object
            $(carousel).data('scrollLeft', liSize * current);
        }
        
        function carousel_next(){
            if($(this).hasClass('inactive')){
                return false;
            }
            
            if(current + step < 0) {
                return false; 
            } else if(current + step > maximum - visible) {
                current = maximum - visible;
            } else {
                current = current + step;
            }
            $(carousel).animate({'scrollLeft':liSize * current},speed);
            setBtnStates();
            return false;
        }
        
        function carousel_prev(){
            if($(this).hasClass('inactive')){
                return false;
            }
            
            if(current - step > maximum - visible) {
                 return false;
            } else if (current - step < 0) {
                current = 0;
            } else {
                current = current - step;
            }
            $(carousel).animate({'scrollLeft':liSize * current},speed);
            setBtnStates();
            return false;
        }
        
        function artifact_click() {
            var location = $(this).find("a").attr("href");
            window.location = location;
        }
        
        //bind events
        $(btnNext).click(carousel_next);
        $(btnPrev).click(carousel_prev);
        setBtnStates();
        // anchor behavior for artifact images 
        $('.js_thumbsmallimgframe').click(artifact_click);
    })
}