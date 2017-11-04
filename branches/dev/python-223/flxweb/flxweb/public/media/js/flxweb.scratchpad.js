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
 * This file originally written by Deepak Babu
 * 
 * $Id$
 */
(function($){
   
    var show_pad = '.showscratchpad_btn'
    var hide_pad = '.closescratchpad_btn'
    var question_display_text = '.questiondisplaytext' 

    function show_scratchpad_btn_click() {
        $(show_pad).removeClass('btn').addClass('hide');
        $(hide_pad).removeClass('hide').addClass('btn');
        $(question_display_text).parent().addClass('scrachpadmode')
	if($(question_display_text).parent().hasClass('scrachpadmode')) {
           //Initialize canvas 
           $('#canvasdiv').scratchpad({
                canvasWidth: 800,
                canvasHeight: 600,
                drawingAreaX: 32,
                drawingAreaY: 39,
                drawingAreaWidth: 732,
                drawingAreaHeight: 518,	
                markerSize: 3,  
           });
        }
        $(hide_pad).removeClass('hide');
    }

    function close_scratchpad_btn_click() {
        $(hide_pad).addClass('hide').removeClass('btn');
        $(show_pad).addClass('btn').removeClass('hide');
        $(question_display_text).parent().removeClass('scrachpadmode')
        $('#canvasdiv').deleteScratchpad(); 
        $(show_pad).removeClass('hide');
    }  

    function domReady(){
        $(show_pad).click(show_scratchpad_btn_click);
        $(hide_pad).click(close_scratchpad_btn_click);
        //Wheneven move to another question
 	$("#exercisebtnwrap .skip_btn").live('click', close_scratchpad_btn_click);
        $("#exercisebtnwrap .next_btn").live('click', close_scratchpad_btn_click);
    }
    $(document).ready(function(){
        domReady();
    });
})(jQuery);

jQuery.fn.exists = function(){return jQuery(this).length>0;}
