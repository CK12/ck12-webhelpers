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
(function($){

    function imageDialog_show(){
        if (!($(this).hasClass("x-ck12-math") || $(this).hasClass("x-ck12-block-math") || $(this).hasClass("x-ck12-hwpmath") || $(this).hasClass("x-ck12-img-nopopup"))) {
        
            $.blockUI({
                message: $("#js_imgdialog"),
                css: {
                top:  ($(window).height() - 500) /2 + 'px', 
                left: ($(window).width() - 530) /2 + 'px', 
                width: '530px',
                padding: '0 10px 10px 10px',
                height:'500px',
                cursor:'default'
                }
            });
            var src = $(this).attr('src');
            if (src.indexOf("THUMB_POSTCARD") == -1) {
                src = src.replace("/default/", "/THUMB_POSTCARD/");
            }
            var img = $('<img id="js_imgdialogimage" src="' + src + '" />');
            $("#js_imgdialogcontent").html(img).css({'overflow':'auto', 'height':'450px'});
            
            var width = parseInt($(this).width(),10);
            if(width < 500){
                $("#js_imgdialognav .actions").hide();
                $("#js_imgdialognav .msg").show();
            } else {
                $("#js_imgdialognav .actions").show();
                $("#js_imgdialognav .msg").hide();
            }
        }
    }
    
    function imageDialog_hide(){
        $.unblockUI();
        return false;
    }
    
    function imageDialog_fitsize(){
        var img = $("#js_imgdialogcontent img");
        var src = img.attr('src');
        if (src.indexOf("IMAGE_THUMB") == -1) {
            img.attr('src', src.replace("/default/", "/THUMB_POSTCARD/"));
        }
        return false;
    }
    
    function imageDialog_fullsize(){
        var img = $("#js_imgdialogcontent img");
        var src = img.attr('src');
        if (src.indexOf("THUMB_POSTCARD") != -1) {
            img.attr('src', src.replace("/THUMB_POSTCARD/", "/default/"));
        } else if (src.indexOf("image_thumb") != -1) {
            img.attr('src', src.replace("/thumb_postcard/", "/default/"));
        }
        return false;
    }
    
    function embedbox_click(){
        $(this).select();
        return false;
    }
    
    function ga_track_concept(){
        var encodedID = $("#concept_encoding").text();
        if(encodedID){
            encodedID = encodedID.split('.');
            var category = "Concept:"+encodedID[0]+"."+encodedID[1];
            var action = encodedID[2];
            var title = ""+window.location;
            title = title.replace(webroot_url,'');
            _gaq.push(['_trackEvent',category, action, title]);
        }
    }
    
    function show_embed_block(){
        $("#embed_section").show();
    }
    
    function hide_embed_block(){
        $("#embed_section").hide();
    }
    
    function updateEmbedCode(){
        
        var width = $("#embed_width").val();
        if(!width){
            width = 500;
        }
        var height = $("#embed_height").val();
        if (!height){
            height = 400;
        }
        
        var iframeCode = $("#embed_box").val();
        iframeCode = iframeCode.replace(/width="\w+"/, 'width="'+ width +'"');
        iframeCode = iframeCode.replace(/height="\w+"/, 'height="'+ height +'"');
        $("#embed_box").val(iframeCode);
    }
    
    function embedSizeChange(event){
        var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
        if ( !(key>=48 && key<=57) && !(key>=96 && key<=105) ){//not a number
            if ( !( key==8 || key==9 || key==46 || key==37 || key==39 ) ){//not a backspace, tab, delete, left or right
                event.preventDefault();
                return false;
            }
        } else {
            if (event.shiftKey || event.ctrlKey){
                return false;
            }
        }
    }
    
    function artifact_click() {
        var location = $(this).find("a").attr("href");
        window.location = location;
    }
    
    function backtotop_click(){
        $('html,body').animate({'scrollTop':0},200);
        return false;
    }
    
    function domReady(){
        $(".js_detailbody").find("img").click(imageDialog_show);
        $("#js_imgdialogfullsize").click(imageDialog_fullsize);
        $("#js_imgdialogfitsize").click(imageDialog_fitsize);
        $("#js_imgdialogclose").click(imageDialog_hide);
        $("#concept_embed").toggle(show_embed_block, hide_embed_block);
        // select text in embed code box on click.
        $("#embed_box").click(embedbox_click);
        $("#embed_width").add("#embed_height").keydown(embedSizeChange).keyup(updateEmbedCode);
        // image optimization
        $(".x-ck12-img-postcard img")
            .add($(".x-ck12-img-thumbnail img"))
            .add($(".x-ck12-img-fullpage img"))
            .removeAttr("width");
        
        ga_track_concept();
        // anchor behavior for artifact images 
        $('.js_thumbsmallimgframe').click(artifact_click);
        $('.backtotop a').click(backtotop_click);
        
    }
    
    $(document).ready(domReady);
})(jQuery);
