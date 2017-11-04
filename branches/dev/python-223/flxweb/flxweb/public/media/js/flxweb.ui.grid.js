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
(function($) {
    
    function griditem_mouseover(){
        $(this).addClass("active");
    }
    
    function griditem_mouseout(){
        $(this).removeClass("active");
    }
    
    function griditem_click(){
        var location = $(this).find("a").attr("href");
        window.location = location;
    }
    
    function grid_domReady(){
        $(".griditem").live("mouseover",griditem_mouseover);
        $(".griditem").live("mouseout", griditem_mouseout);
        $(".griditem").live("click",griditem_click);
    }
    
    $(document).ready(grid_domReady);
    
})(jQuery)