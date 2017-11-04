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
 * $id$
 */
(function($) {

    function initConceptTree() {
        var tree = $('#browse_tree').jstree({
            "ui" : {
                "initially_select" : ["node_" + $('#current_selected').val()]
            },
            "themes" : {
                "theme" : "default",
                "icons" : false
            },
            "plugins" : ["themes", "html_data", "ui"]
        });

        
    }

    function domready() {
        initConceptMap();
        initConceptTree();
        $(".js_conceptmap_leafnode .js_nodelink").each(function(){
            var encodeid = $(this).data('encodeid');
            if (encodeid){
                encodeid = encodeid.split(".")[1];
                encodeid = encodeid.toLowerCase();
            }
            $(this).attr('href','/conceptmap/'+encodeid+'/');
        });
        $("#conceptmap_encodelist").hover(
            function(){
                $("#conceptmap_navigation",this).hide().removeClass('hide').show(200);
            },
            function(){
                $("#conceptmap_navigation",this).hide(200);
            }
        );
    }
    
    $(document).ready(domready);

})(jQuery);
