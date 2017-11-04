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
    
    function favoriteAddSuccess(){
        var val = parseInt($("#js_tabfavorites .js_resulttotal .js_resultvalue").text());
        $("#js_tabfavorites .js_resulttotal .js_resultvalue").text(val + 1);
    }
    
    function favoriteRemoveSuccess(){
        var val = parseInt($("#js_tabfavorites .js_resulttotal .js_resultvalue").text());
        $("#js_tabfavorites .js_resulttotal .js_resultvalue").text(val - 1);
    }
    
    function domReady(){
        //Component Initializations
        $(document).bind("FAVORITE_ADD_SUCCESS", favoriteAddSuccess)
        $(document).bind("FAVORITE_REMOVE_SUCCESS", favoriteRemoveSuccess)

    }
    
    $(document).ready(domReady);
})(jQuery);
