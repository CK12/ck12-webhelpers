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
                $('html,body').animate({scrollTop: elementToScrollTo.offset().top},1000);
                elementToScrollTo.addClass('selected');
                
            });

            $("#browse_tree .clickable_node").live('click', function () {
                document.location = $(this).attr("href");
            });
        });
    }
    
    function domReady() {
        initBrowseTree();
        makeTreeFloating();
    }
    
    function moveTree(treeDiv,treeDivTop) {
        var winTop = $(window).scrollTop();
        var footerTop = $('#footer').offset().top;
        var treeDivHeight = treeDiv.height();

        if(winTop > treeDivTop) {
            if ((winTop + treeDivHeight) < footerTop) {
                treeDiv.css('position','fixed');
                treeDiv.css('top','0px');
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
        //adjust the initial tree position 
        moveTree(treeDiv,treeDivTop);
        // add the window scroll listener to move the tree
        // as the window is scrolled.
        $(window).scroll(function(){
            moveTree(treeDiv,treeDivTop);
        });
    }
    
    $(document).ready(domReady);
    
})(jQuery);
