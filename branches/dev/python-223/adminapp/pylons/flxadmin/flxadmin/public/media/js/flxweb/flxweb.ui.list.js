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
    function listicon_click(){
        var href = $(this).find('a').attr('href');
        window.location = href;
    }
    
    function ui_grid_domReady(){
        $(".listimgwrap").live('click',listicon_click);
    }
    
    $(document).ready(ui_grid_domReady);
})(jQuery);