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
 * This file originally written by Ravi Gidwani
 * 
 * $Id$
 */

(function($) {

    function initBrowseTree() {
        var tree = $('#browse_tree').jstree({
            "ui" : {
                "initially_select": ["node_" + $('#current_selected').val()]
            },
            "themes" : {
                "theme" : "default",
                "icons" : false
            },
            "plugins" : [ "themes", "html_data","ui"]
        });
        
        
        $("#browse_tree").bind("loaded.jstree", function (event, data) {
            $("#browse_tree").jstree("open_node", "[id^='node']");
            
            $('.clickable_node').click(function(){
                var hrefValue = $(this).attr('href');
                var branchName = hrefValue.split('#')[1];
                $(".listheading").removeClass('selected');
                var elementToScrollTo = $("[name='" + branchName + "']");
                $('html,body').animate({scrollTop: elementToScrollTo.offset().top},1000,function(){
                    moveTree();
                });
                elementToScrollTo.addClass('selected');
            });

            $("#browse_tree .clickable_node").live('click', function () {
                document.location = $(this).attr("href");
            });
        });
    }
    
    function domReady() {
        $('.js_carouselcontainer').ck12_carousel({step:4,visible:4});
        $("#landing_carousel").removeClass('hide');
        initBrowseTree();
        makeTreeFloating();
    }
    
    function moveTree() {
        var treeDiv = $('#browse_tree_wrapper');
        var treeDivTop = treeDiv.data('treeDivTop');
        var winTop = $(window).scrollTop();
        var footerTop = $('#footer').offset().top;
        var treeDivHeight = treeDiv.height();
        if(winTop > treeDivTop) {
            if ((winTop + treeDivHeight) < footerTop)  {
                // if it is iPAD/iPhone, we set the top to the scroll displacement.This is done, since 
                // the iOS safari browser has issues with position:fixed.
                // Note: the news is that this has been fixed in iOS5
                if(navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod') {
                   treeDiv.css('position','fixed');
                   treeDiv.css('top',winTop);
                } else {
                   treeDiv.css('position','fixed');
                   treeDiv.css('top','0px');
                }
            } else {
                treeDiv.css('position','fixed');
                treeDiv.css('top', footerTop - (winTop + treeDivHeight) + "px");
            }
        } else {
            treeDiv.css('position','relative');
            treeDiv.css('top','0px');
        }
    }
    
    function makeTreeFloating() {
        // make the tree div into a float div
        var treeDiv = $('#browse_tree_wrapper');
        var treeDivTop = treeDiv.offset().top;
        treeDiv.data('treeDivTop',treeDivTop);
        //adjust the initial tree position 
        moveTree();
        // add the window scroll listener to move the tree
        // as the window is scrolled.
        $(window).scroll(function(){
            moveTree();
        });
    }
    
    $(document).ready(domReady);
    
})(jQuery);
