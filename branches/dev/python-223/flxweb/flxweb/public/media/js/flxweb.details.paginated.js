$(document).ready(function(){
    $('#toc_container').fadeOut("fast", "linear");
    content_fix_height = Math.round(($(window).height()*55.843)/100);
    full_content_size = $('#actual_content').innerHeight();
    expected_max_pages = Math.round(full_content_size/content_fix_height);
    expected_max_pages = expected_max_pages * $('.toc_button').length;
    fixTOC();
    $(window).resize(function(){
        var $lefty = $('#toc_enclosure');
        $lefty.css('left',-$lefty.outerWidth());
    });
    $('#current_content_covered_info').hide();
    $('#content_frame').resize(function(){
        content_fix_height = Math.round(($(window).height()*44.843)/100);
        if($.browser.webkit) {
            $('#current_content_covered_info').show();
            if(content_fix_height <= 400){
                $('#content_frame').css('top','7.4%');
            } else {
                $('#content_frame').css('top','3.4%');
            }
            $('#current_content_covered_info').hide();
        }
        $('#actual_content').show();
        if($('#actual_content').children().length == 0)
            $('#content_frame').contents().appendTo($('#actual_content'));
        else
            $('#content_frame').contents().insertBefore($('#actual_content').children(':first-child'));
        goToNextPage(true);
        if($('#content_frame').children().length == 1)
            goToNextPage(true);
        $('#actual_content').hide();
    });

    current_artifact_type = $('#current_content_covered_info').attr('data-artifactType');
    if(current_artifact_type == "lesson")
        current_artifact_type = "concept"
    current_artifact_type = current_artifact_type.substr(0,1).toUpperCase()+current_artifact_type.substr(1).toLowerCase();

    if($.browser.webkit){
        if(content_fix_height <= 400)
            $('#content_frame').css('top','7.4%');
        else
            $('#content_frame').css('top','3.4%');
        $('#content_frame_holder').css('height','95%');
        $('#reader_page_info').css('height','15%');
        $('#reader_page_info').css('width','76%');
        $('#reader_page_info').css('margin-top','-6.1%');
        $('#reader_page_slider').remove();
        $('<input id="reader_page_slider" type="range" min="1" max="100" step="1" value="1" />').insertBefore($('#percent_covered_info_full'));
        $('#reader_page_slider').css('top','30%');
        $('#reader_page_slider').css('margin-left','1%');
        $('#reader_page_slider').css('margin-top','3%');
        $('#reader_page_slider').css('width','94%');
        $('#percent_covered_info_full').css('position','relative');
        $('#percent_covered_info_full').css('margin-top','3%');
        $('#percent_covered_info_full').css('margin-left','-84%');
        /*if((navigator.userAgent.indexOf("Linux") != -1) && (navigator.userAgent.indexOf("Chrome") != -1) )
            $('#percent_covered_info_full').css('margin-top','18%');
        */
        $("#reader_page_slider").change(function(){
            $('#current_content_covered_info').show();
            if(content_fix_height <= 400){
                $('#content_frame').css('top','7.4%');
            } else {
                $('#content_frame').css('top','3.4%');
                $('#toc_pull_button').css('top','1%');
            }
            $('#current_content_covered_info').hide();
            clearTimeout(onChangeLoadTimer); 
            $('#current_content_covered_info').show();
            if($('#current_content_covered_info').attr('data-artifactType') == "book"){
                $('#current_content_covered_info').text(current_artifact_type+' ' + current_chapter_index + ' : '+ $('#reader_page_slider').attr('value') + '%');
                current_info_pos = -5 + ($('#reader_page_slider').attr('value')/100) * 94 + '%';
            } else {
                $('#current_content_covered_info').text( $('#reader_page_slider').attr('value') + '%');
                current_info_pos = -3 + ($('#reader_page_slider').attr('value')/100) * 94 + '%';

            }
            $('#current_content_covered_info').css('left', current_info_pos);
            onChangeLoadTimer = setTimeout("navigateToPage()",500);
        });
    } else {
        $('#reader_page_slider').slider({
            slide: function(event, ui){
                $('#current_content_covered_info').show();
                page_slider_value = $('#reader_page_slider').slider('option', 'value');
                if(page_slider_value == 0)
                    page_slider_value = 1;
                if($('#current_content_covered_info').attr('data-artifactType') == "book"){
                    $('#current_content_covered_info').text(current_artifact_type+' ' + current_chapter_index + ' : '+ page_slider_value + '%');
                    current_info_pos = 7 + (parseInt($('#reader_page_slider').slider('option','value'))/100) * 76 + '%';
                } else {
                    $('#current_content_covered_info').text( page_slider_value + '%');
                    current_info_pos = 10 + (parseInt($('#reader_page_slider').slider('option','value'))/100) * 76 + '%';

                }
                $('#current_content_covered_info').css('left', current_info_pos);

            },
            stop: function(event, ui){
                full_content_size = $('#actual_content').innerHeight();
                full_content_size += $('#actual_content_first').innerHeight();
                load_mask('#content_frame', 'Loading')
                setTimeout("goToPage($('#reader_page_slider').slider('option', 'value'))", 10);
   
            }
        });


        $("#reader_page_slider").mouseup(function(){
            full_content_size = $('#actual_content').innerHeight();
            full_content_size += $('#actual_content_first').innerHeight();
            load_mask('#content_frame', 'Loading')
            setTimeout("goToPage($('#reader_page_slider').slider('option', 'value'))", 10);
       
        });

    }
    $('#reader_page_slider').mouseenter(function(){
        $('#current_content_covered_info').show();
        if($.browser.webkit){
            $('#current_content_covered_info').show();
            if($('#current_content_covered_info').attr('data-artifactType') == "book"){
                $('#current_content_covered_info').text(current_artifact_type+' ' + current_chapter_index + ' : '+ $('#reader_page_slider').attr('value') + '%');
                current_info_pos = -5 + ($('#reader_page_slider').attr('value')/100) * 94 + '%';
            } else {
                $('#current_content_covered_info').text( $('#reader_page_slider').attr('value') + '%');
                current_info_pos = -3 + ($('#reader_page_slider').attr('value')/100) * 94 + '%';
            }
            $('#current_content_covered_info').css('left', current_info_pos);

        } else {
            page_slider_value = $('#reader_page_slider').slider('option', 'value');
            if(page_slider_value == 0)
                page_slider_value = 1;
            if($('#current_content_covered_info').attr('data-artifactType') == "book"){
                $('#current_content_covered_info').text(current_artifact_type+' ' + current_chapter_index + ' : '+ page_slider_value + '%');
                current_info_pos = 7 + (parseInt($('#reader_page_slider').slider('option','value'))/100) * 76 + '%';
            } else {
                $('#current_content_covered_info').text( page_slider_value + '%');
                current_info_pos = 10 + (parseInt($('#reader_page_slider').slider('option','value'))/100) * 76 + '%';
            }
            $('#current_content_covered_info').css('left', current_info_pos);
        }
    });

    $('#reader_page_slider').mouseleave(function(){
        $('#current_content_covered_info').hide();
    });
    $('#reader_page_slider').hover(
        function() {
                $(this).addClass('reader_page_slider_hover');
        },
        function() {
                $(this).removeClass('reader_page_slider_hover');
        }
    );

    $('#toc_pull_button').hover( 
        function() {
            $(this).css('color', '#FFFFFF');
        },
        function() {
            $(this).css('color', '#707070');
        }
    );

    $('.toc_button').hover( 
        function() {
            $(this).css('color', '#000000');
        },
        function() {
            if($(this).css('color') == 'rgb(0, 0, 0)')
                $(this).css('color', '#B3B3B3');
        }
    );

    $('img#previous_button_image').hover(
        function(){
            
            img_src = $(this).attr('src');
            img_src = img_src.replace('left','left_mouseover');
            $(this).attr('src',img_src);
        },
        function(){
            img_src = $(this).attr('src');
            img_src = img_src.replace('_mouseover','');
            $(this).attr('src',img_src);
        }

    );
    $('img#next_button_image').hover(
        function(){
            
            img_src = $(this).attr('src');
            img_src = img_src.replace('right','right_mouseover');
            $(this).attr('src',img_src);
        },
        function(){
            img_src = $(this).attr('src');
            img_src = img_src.replace('_mouseover','');
            $(this).attr('src',img_src);
        }

    );
    /*$('#preprocessed_content').show();
    $('#actual_content').show();
    preProcessContent();
    $('#preprocessed_content').contents().appendTo('#actual_content');
    $('#preprocessed_content').hide();
    $('#actual_content').hide();*/
    pull_switch = false; 
    $('#toc_pull_button').click(function() {
        $('#content_frame').contents().find('iframe').each(function(){
            iframe_ele = $(this).contents().find('iframe');
            youtube_src = $(iframe_ele).attr('src');
            if(youtube_src != undefined){
                if(youtube_src.toLowerCase().indexOf("wmode=opaque") == -1)
                    if(youtube_src.toLowerCase().indexOf("?") == -1)
                        youtube_src += "?wmode=Opaque";
                    else{
                        youtube_src += "&wmode=Opaque";
                    }
            }
            iframe_ele = $('#content_frame').contents().find('iframe').contents().find('iframe');
            $(iframe_ele).attr('src', youtube_src);
        });
        hide_toc_help();
        /*$('#toc_skeleton_enclosure').slideToggle("slow");
        if((pull_switch == undefined) || (pull_switch == false)) {   
                $('#toc_pull_button').text('↓ Table of contents ↓');
                pull_switch = true;
        } else {
                $('#toc_pull_button').text('↑ Table of contents ↑');
                pull_switch = false;
        }*/
    });
    
    callContent();
    $('#footer').css('margin-top','90%');

	$('#prev').click(function(event){
		event.preventDefault();
	        goToPrevious(true);
        });

	$('#next').click(function(event){
		event.preventDefault();
	        goToNextPage(true);
	});

	$('#close').click(function(event){
		event.preventDefault();
                close_reader();
	});

	$('#decreaseFont').click(function(event){
		event.preventDefault();
                decrease_font_size();
	});
	$('#increaseFont').click(function(event){
		event.preventDefault();
                increase_font_size();
	});

	$('#toc').click(function(event){
		event.preventDefault();
		$('#toc_container').fadeToggle("fast", "linear");
	});
    $('#reader_page_slider > a').keydown(function(event) {
        if((event.keyCode == 37) || (event.keyCode == 39))
            $(document).mouseup();
    });

    $(document).keyup(function(event) {
         suggested_max_pages = expected_max_pages;
         if(suggested_max_pages < max_pages)
            suggested_max_pages = max_pages;
         if(event.keyCode == 37) {
             //if(page > 2)
             goToPrevious(true);
             event.preventDefault();
         }
         if(event.keyCode == 39) {
             //if(page < suggested_max_pages + 1)
             goToNextPage(true);
             event.preventDefault();
         }
    });
    $("#cur_page_num").keydown(function(event) {
        // Allow only backspace and delete
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 13 ) {
            // let it happen, don't do anything
        }
        else {
            // Ensure that it is a number and stop the keypress
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
    $("#cur_page_num1").keydown(function(event) {
        // Allow only backspace and delete
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 13 ) {
            // let it happen, don't do anything
        }
        else {
            // Ensure that it is a number and stop the keypress
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }
        }
    });
    
    firstChild = $('#table_of_contents').find('.toc_button')[0];
    if(firstChild) {
        firstChildType = $.trim($(firstChild).attr('data-artifactType'));
        loadChapter(firstChild, false, firstChildType);
    }
    setTimeout("hide_toc_help()",10000);
    /*if((current_artifact_type == 'Section') || (current_artifact_type == 'Concept')) {
        $('#toc_pull_button').trigger('click');
    
    }*/
});

function hide_toc_help(){
    $('#toc_help_text').hide('slow');
}

/*
$.fn.imagesLoaded = function(callback){

  // mit license. paul irish. 2010.
  // webkit fix from Oren Solomianik. thx!

  var elems = this.filter('img'),
      len = elems.length,
      blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      
  elems.bind('load.imgloaded',function(){
      if (--len <= 0 && this.src !== blank){
        elems.unbind('load.imgloaded');
        callback.call(elems,this);
      }
  }).each(function(){
     // cached images don't fire load sometimes, so we reset src.
     if (this.complete || this.complete === undefined){
        var src = this.src;
        // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
        // data uri bypasses webkit log warning (thx doug jones)
        this.src = blank;
        this.src = src;
     }
  });

  return this;
};
*/

function close_reader() {
    if (document.referrer == "") {
        window.location.href = window.location.href.replace('read/','');
    }else {
        if(window.history.length > 1)
            window.history.back();
        else{
            window.open('','_parent','');
            window.close();
        }
    }
}
jQuery.fn.exists = function(){return this.length>0;}

function fixTOC() {
    tmp_chap_index = 1;
    $('#table_of_contents').find('.toc_button').each(function(i,toc_button){
        $(toc_button).parent().find('.toc_nested_button').each(function(j,toc_nested_button){
            buttonText = $(this).text();
            buttonClass = $(this).attr('class');
            $(toc_nested_button).replaceWith("<button class='"+buttonClass+"' onmouseup='loadSection(this,"+tmp_chap_index+")'>"+ buttonText + "</button>");
        });
        tmp_chap_index++;
    });
    tmp_chap_index = 1;
    $('#table_of_contents').find('.toc_section_button').each(function(i, toc_section_button){
            buttonText = $(this).text();
            buttonClass = $(this).attr('class');
            $(toc_section_button).replaceWith("<button class='"+buttonClass+"' style='background:none;border:0;color:#B3B3B3;cursor:pointer;text-align:left;vertical-align:top;' onmouseup='loadSection(this,"+tmp_chap_index+")'>"+ buttonText + "</button>");
    });
}

function loadSection(ele_val, chapter_index) {
    if ($.trim($(ele_val).text()) != '')
        ele_val = $(ele_val).text();
    if(chapter_index != current_chapter_index){
        firstChild = $('#table_of_contents').find('.toc_button')[chapter_index - 1];
        if(firstChild) {
            firstChildType = $.trim($(firstChild).attr('data-artifactType'));
            setTimeout("loadChapter(firstChild, false, firstChildType, \""+ele_val+"\")",100);
            return;
        }
    }
    /*if(to_push_toc == true)
        $('#toc_pull_button').trigger('click');
    */
    $('#toc_container').fadeOut("fast", "linear");
    to_push_toc = true;
    is_section_found = 'False';
    $('#content_frame').find('h1').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    });    
    $('#content_frame').find('h2').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    });    
    $('#content_frame').find('h3').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    });    
    $('#content_frame').find('h4').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    }); 
    if(is_section_found == 'True')
        return;  
    is_section_found = 'False'; 
    holders = [
                  '#actual_content_first',
                  '#actual_content',
              ];
    headings = [
                  'h1',
                  'h2',
                  'h3',
                  'h4',
              ];
    $.each(holders, function(i,holder){
        $.each(headings, function(j, heading){
            $(holder).find(heading).each(function(){
                if($.trim($(this).text()) == $.trim(ele_val))
                    is_section_found = 'True'; 
            });    
 
        });
    });
    if(is_section_found == 'False')
        return;  
    load_mask('#content_frame', 'Loading')
    setTimeout("goToSectionPage(\""+ele_val+"\")",1000)
}

function goToSectionPage(ele_val) {
    $('actual_content').show();
    $('actual_content_first').show();
    is_section_found = 'False';
    $('#actual_content').find('h1').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    });    
    $('#actual_content').find('h2').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    });    
    $('#actual_content').find('h3').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    });    
    $('#actual_content').find('h4').each(function(){
        if($.trim($(this).text()) == $.trim(ele_val))
            is_section_found = 'True'; 
    }); 
    if(is_section_found == 'True') {
            $('#content_frame').contents().appendTo($('#actual_content_first'));
            next_ele_val = $('#actual_content').children(':first-child').text();
            while($.trim(next_ele_val) != $.trim(ele_val)) {
                $('#actual_content').children(':first-child').appendTo($('#actual_content_first'));
                next_ele_val = $('#actual_content').children(':first-child').text();
            }
            goToNextPage(true);  
    } else {
            if($('#actual_content').children().length == 0)
                $('#content_frame').contents().appendTo($('#actual_content'));
            else
                $('#content_frame').contents().insertBefore($('#actual_content').children(':first-child'));
            next_ele_val = $('#actual_content').children(':first-child').text();
            while($.trim(next_ele_val) != $.trim(ele_val)) {
                $('#actual_content_first').children(':last-child').insertBefore($('#actual_content').children(':first-child'));
                next_ele_val = $('#actual_content').children(':first-child').text();
            }
            goToNextPage(true);
    }
    
    $('actual_content').hide();
    $('actual_content_first').hide();
    $('#content_frame').unmask();
    $('#actual_content > .loadmask').remove();
    $('#actual_content > .loadmask-msg').remove();
    $('#actual_content_first > .loadmask').remove();
    $('#actual_content_first > .loadmask-msg').remove();
}

function loadChapter(ele,prev, artifactType, toLoadSection) {
   if(ele == undefined){
        return;
     }
    realm = $(ele).attr('data-realm');
    content_fix_height = Math.round(($(window).height()*44.843)/100);
    current_artifact_type = artifactType.substr(0,1).toUpperCase()+artifactType.substr(1).toLowerCase();
    chapter_index = 1; 
    total_chapters = 0;
    $('#table_of_contents').find('.toc_button').each(function() {
        if(this == ele) {
            current_chapter_index = chapter_index;
        }
        $(this).css('color','#B3B3B3');
        chapter_index++;
        total_chapters++;
    });
    $('#actual_content_first').text('');
    $('#actual_content').text('');
    $('#content_frame').text('');
    $(ele).css('color', '#000000');
    //$('#toc_pull_button').trigger('click');
    setTimeout("load_mask('#content_frame', 'Loading')", 100);
    if(realm != "None") {
        realm = encodeURIComponent(realm) + "/";
    } else {
        realm = "";
    }
    $('#toc_container').fadeOut("fast", "linear");
    $.getJSON(webroot_url + 'getinfo/' +realm+ artifactType +'/'+encodeURIComponent($(ele).attr('id')), function(data){
        if(data.artifact_xhtml){
            $('#actual_content').html(data.artifact_xhtml);
            /*if((data.nested_toc_titles) && (toLoadSection == undefined)) {
                nested_toc_content = "<ol style='list-style:circle; text-align:left; vertical-align:top'>";
                $.each(data.nested_toc_titles, function(index, each_title){
                    nested_toc_content += "<li><button class='toc_nested_button' onmouseup='loadSection(\""+data.nested_toc_ids[index]+"\","+current_chapter_index+")'>"+ each_title + "</button></li>";
                }); 
                nested_toc_content += "</ol>";
                $(ele).parent().append($(nested_toc_content));
            }*/
            $('<div id="artifact_reader_title">'+$(ele).text()+'</div>').insertBefore($('#actual_content').children(':first-child'));
            if($.browser.webkit) {
            $('#reader_page_slider').attr('value', 0);
            $('#artifact_reader_title').css('width','100%');
            } else {
            $('#reader_page_slider').slider('option', 'value', 0);
            }
            if(prev == true) {
                setTimeout("callContent(true)",100);
                setTimeout("goToPage(100)",500)
            } else {
                if(toLoadSection != undefined) {
                    to_push_toc = false;
                    is_section_found = 'False'; 
                    holders = [
                                '#actual_content'
                              ];
                    headings = [
                                'h1',
                                'h2',
                                'h3',
                                'h4',
                               ];
                    $('#actual_content').show();
                    $.each(holders, function(i,holder){
                        $.each(headings, function(j, heading){
                            $(holder).find(heading).each(function(){
                            if($.trim($(this).text()) == $.trim(toLoadSection))
                                is_section_found = 'True'; 
                            });    
 
                        });
                    });
                    $('#actual_content').hide();
                    if(is_section_found == 'True')
                        setTimeout("loadSection(\""+toLoadSection+"\", "+current_chapter_index+")",100);
                    else
                        setTimeout("callContent()",100);
                    
                } else
                    setTimeout("callContent()",100);
            }
        }
    });
}

page = 1;
max_pages = page;
total_chapters = 1;
onChangeLoadTimer = '';
current_chapter_index = 1;
current_artifact_type = 'Chapter';
to_push_toc = true;

function paginateContent() {
        suggested_max_pages = expected_max_pages;
        if(suggested_max_pages < max_pages)
            suggested_max_pages = max_pages;
        max_height = content_fix_height;
        height_fact = 0;
        is_page_created = false;
        $('#content_frame').text('');
        $('#actual_content').show();
        $('#paginated_div').show();
        current_page = page;
        if(($.trim($('#actual_content').text()) != "") && ($('#actual_content').children().length == 0)) {
            $('#actual_content').text('');
            $('#actual_content').hide();
            $('#paginated_div').hide();
            fixButtons();
            return;
        }
        fix_contents = [
                       '#actual_content > .x-ck12-data', 
                       '#actual_content > .x-ck12-data-objectives',
                       '#actual_content > .x-ck12-data-knowledge-tree', 
                       '#actual_content > .x-ck12-data-problem-set', 
                       ];
        $.each(fix_contents, function(index, value){
            $.each($(value), function(){
                $(this).contents().insertAfter($(this));
                $(this).remove();
            });
        });
        if($('#actual_content').children().length > 0) {
            kid = $('#actual_content').children(':nth-child(1)');
            $('#paginated_div').append('<div id="page'+current_page+'"></div>');
            is_page_created = true;
            $('#artifact_reader_title').appendTo($('#content_frame'));
            if($.browser.webkit) {
            $('#artifact_reader_title').css('width','100%');
            } 
            start_height_fact = height_fact = $('#artifact_reader_title').innerHeight();
            max_pages = current_page;
            $('#total_pages').text(suggested_max_pages);
            $('#total_pages1').text(suggested_max_pages);
            while(true){
                kid.clone().appendTo('#content_frame');
                kid1 = $('#content_frame').children(':last-child');
                kidInnerHeight = kid1.innerHeight();
                $('#content_frame').children(':last-child').remove();
                fix_height = max_height;
                need_split = true;
                if((height_fact > start_height_fact) && (height_fact < max_height/2)) {
                    fix_height = (max_height - height_fact - 20);
                }
                if(kidInnerHeight > fix_height ) {
                    if(fixImageNode(kid, Math.round(fix_height)) == true) {
                        totalEleHeight = Math.round(fix_height);
                        if(kid[0].nodeName == "DIV")
                            need_split = false;
                    }
                    /*if(fixVideoNode(kid, Math.round(fix_height)) == true) {
                        totalEleHeight = Math.round(fix_height);
                        need_split = false;
                    }*/
                }
                totalEleHeight = kidInnerHeight;
                if((max_height - height_fact < max_height-50) && (totalEleHeight +height_fact-5  > max_height)){
                    break;
                }
                if((totalEleHeight + height_fact > max_height) && (need_split == true)){
                    splitAggressively(kid, (max_height - height_fact), max_height);
                    if(kidInnerHeight > max_height){
                        splitAggressively(kid, max_height/2, max_height);
                    }
                    kid.clone().appendTo('#content_frame');
                    kid.appendTo('#page'+current_page);
                    height_fact += kidInnerHeight;
                } else {
                    height_fact = height_fact + totalEleHeight;
                    kid.clone().appendTo('#content_frame');
                    kid.appendTo('#page'+current_page);
                }

                if (height_fact >= max_height)
                    break;
                else
                    kid = $('#actual_content').children(':nth-child(1)');
                if(kid[0] == undefined)
                    break
            }
            kid = $('#content_frame').children(':last-child');
            if(($('#content_frame').children().length == 2) && ((kid[0].nodeName == 'H4')|| (kid[0].nodeName == 'H3')|| (kid[0].nodeName == 'H2'))){
                kid = $('#actual_content').children(':nth-child(1)');
                kid.appendTo('#content_frame');
            }
            $('#content_frame').find('img').each(function(){
                if(($(this).attr('class') == undefined) && ($(this).attr('style') == undefined)) {
                    $(this).attr('style','float:left;padding-right:2%;'); 
                }
            });
                
            if(page > 1) {
                    $('#previous_button').show();
                } else { 
                    $('#previous_button').hide();
                }
            /*button_content = '<input type="button" id="page'+page+'_button" onClick=goToPage('+page+') value="'+page+'"></input>'
            prev_page = page - 1;
            if(page == "1") {
                $(button_content).insertAfter($("#previous_button"));
            } else {
                $(button_content).insertAfter($("#page"+prev_page+"_button"));
            } */
        } else {
            $('#page'+page).contents().clone().appendTo('#content_frame');
            fixSlider(page);
        }
        /*
        if($('#content_frame').text() == "") {
            page = page % max_pages;
            if(page == 0)
                page = max_pages;
            $('#page'+page).contents().clone().appendTo('#content_frame');
        }*/


        preProcessTables();
        $('#actual_content').hide();
        $('#split_lists').hide();
        $('#split_tables').hide();
        $('#paginated_div').hide();
        page = page+1;
        fixButtons();
        $('#current_content_covered_info').hide();
}

function prePaginateContent() {
        max_height = content_fix_height;
        height_fact = 0;
        is_page_created = false;
        $('#content_frame').text('');
        $('#actual_content_first').show();
        $('#paginated_div').show();
        current_page = page;
        if(($.trim($('#actual_content_first').text()) != "") && ($('#actual_content_first').children().length == 0)) {
            $('#actual_content_first').text('');
            $('#actual_content_first').hide();
            $('#paginated_div').hide();
            fixButtons();
            return;
        }
        fix_contents = [
                       '#actual_content_first > .x-ck12-data', 
                       '#actual_content_first > .x-ck12-data-objectives',
                       '#actual_content_first > .x-ck12-data-knowledge-tree', 
                       '#actual_content_first > .x-ck12-data-problem-set', 
                       ];
        $.each(fix_contents, function(index, value){
            $.each($(value), function(){
                $(this).contents().insertAfter($(this));
                $(this).remove();
            });
        });
        if($('#actual_content_first').children().length > 0) {
            kid = $('#actual_content_first').children(':last-child');
            $('#paginated_div').append('<div id="page'+current_page+'"></div>');
            is_page_created = true;
            start_height_fact = height_fact = $('#artifact_reader_title').innerHeight();
            max_pages = current_page;
            $('#total_pages').text(suggested_max_pages);
            $('#total_pages1').text(suggested_max_pages);
            while(true){
                if($('#content_frame').children().length == 0)
                    kid.clone().appendTo('#content_frame');
                else
                    kid.clone().insertBefore($('#content_frame').children(':first-child'));
                kid1 = $('#content_frame').children(':first-child');
                kidInnerHeight = kid1.innerHeight();
                $('#content_frame').children(':first-child').remove();
                fix_height = max_height;
                need_split = true;
                if((height_fact > start_height_fact) && (height_fact < max_height/2)) {
                    fix_height = (max_height - height_fact - 20);
                }
                if(kidInnerHeight > fix_height ) {
                    if(fixImageNode(kid, Math.round(fix_height)) == true) {
                        totalEleHeight = Math.round(fix_height);
                        if(kid[0].nodeName == "DIV")
                            need_split = false;
                    }
                    /*if(fixVideoNode(kid, Math.round(fix_height)) == true) {
                        totalEleHeight = Math.round(fix_height);
                        need_split = false;
                    }*/
                }
                totalEleHeight = kidInnerHeight;
                if((max_height - height_fact < max_height-50) && (totalEleHeight +height_fact-5  > max_height)){
                    break;
                }
                if((totalEleHeight + height_fact > max_height) && (need_split == true)){
                    splitAggressivelyInReverse(kid, (max_height - height_fact), max_height);
                    kid = $('#actual_content_first').children(':last-child');
                    if(kidInnerHeight > max_height){
                        splitAggressivelyInReverse(kid, max_height/2, max_height);
                        kid = $('#actual_content_first').children(':last-child');
                    }
                    if($('#content_frame').children().length == 0)
                        kid.clone().appendTo('#content_frame');
                    else
                        kid.clone().insertBefore($('#content_frame').children(':first-child'));
                    if($('#page'+current_page).children().length == 0)
                        kid.appendTo('#page'+current_page);
                    else
                        kid.insertBefore($('#page'+current_page).children(':first-child'));
                    height_fact += kidInnerHeight;
                } else {
                    height_fact = height_fact + totalEleHeight;
                    if($('#content_frame').children().length == 0)
                        kid.clone().appendTo('#content_frame');
                    else
                        kid.clone().insertBefore($('#content_frame').children(':first-child'));
                    if($('#page'+current_page).children().length == 0)
                        kid.appendTo('#page'+current_page);
                    else
                        kid.insertBefore($('#page'+current_page).children(':first-child'));
                }
                if (height_fact >= max_height)
                    break;
                else
                    kid = $('#actual_content_first').children(':last-child');
                if(kid[0] == undefined)
                    break
            }
            kid = $('#actual_content_first').children(':last-child');
            if((kid[0] != undefined) && ((kid[0].nodeName == 'H4')|| (kid[0].nodeName == 'H3')|| (kid[0].nodeName == 'H2'))){
                kid.insertBefore($('#content_frame').children(':first-child'));
            }
            $('#artifact_reader_title').insertBefore($('#content_frame').children(':first-child'));
            if($.browser.webkit) {
            $('#artifact_reader_title').css('width','100%');
            } 
            $('#content_frame').find('img').each(function(){
                if(($(this).attr('class') == undefined) && (($(this).attr('style') == undefined) || ($.trim($(this).attr('style')) == ''))) {
                    $(this).attr('style','float:left;padding-right:2%;'); 
                }
            });
            if(page > 1) {
                    $('#previous_button').show();
                } else { 
                    $('#previous_button').hide();
                }
            /*button_content = '<input type="button" id="page'+page+'_button" onClick=goToPage('+page+') value="'+page+'"></input>'
            prev_page = page - 1;
            if(page == "1") {
                $(button_content).insertAfter($("#previous_button"));
            } else {
                $(button_content).insertAfter($("#page"+prev_page+"_button"));
            } */
        } else {
            $('#page'+page).contents().clone().appendTo('#content_frame');
            fixSlider(page);
        }
        /*
        if($('#content_frame').text() == "") {
            page = page % max_pages;
            if(page == 0)
                page = max_pages;
            $('#page'+page).contents().clone().appendTo('#content_frame');
        }*/


        preProcessTables();
        $('#actual_content_first').hide();
        $('#split_lists').hide();
        $('#split_tables').hide();
        $('#paginated_div').hide();
        page = page+1;
        fixButtons();
        $('#current_content_covered_info').hide();
}

function goToNextPage(is_fix_slider) {
    if($('#actual_content').children().length == 0) {
        if (current_chapter_index < total_chapters) {
            //$('#toc_pull_button').trigger('click');
            nextChild = $('#table_of_contents').find('.toc_button')[current_chapter_index];
            nextChildType = $.trim($(nextChild).attr('data-artifactType'));
            loadChapter(nextChild, false, nextChildType);
        } else
            return;
         
    }
    $('#content_frame').find('img').each(function(){
        if(($(this).attr('class') == undefined) && ($(this).attr('style') != undefined)) {
            eleStyle = $(this).attr('style');
            eleStyle = eleStyle.replace('float:left;','');
            eleStyle = eleStyle.replace('padding-right:2%;','');
            $(this).attr('style',eleStyle); 
        }
    });
    $('#actual_content_first').show();
    //$('#content_frame > #artifact_reader_title').remove();
    $('#content_frame').contents().appendTo('#actual_content_first');
            if($.browser.webkit) {
            $('#artifact_reader_title').css('width','100%');
            } 
    $('#actual_content_first').hide();
    $('#content_frame').text('');
    full_content_size = $('#actual_content').innerHeight();
    full_content_size += $('#actual_content_first').innerHeight();
    paginateContent();
    if(($('#actual_content').children().length > 0) && ($('#content_frame').children().length == 1))
        paginateContent();
    if(($('#actual_content').children().length == 0) && (current_chapter_index == total_chapters))
        $('#next_button').hide();
    if($('#actual_content_first').children().length > 0)
        $('#previous_button').show();
    if(is_fix_slider == true){
        fixSlider();    
        updatePercent();
    }

}

function fixImageNode( element, fix_height ) {
    found = false;
    while(true) {
        if(element[0] == undefined)
            break;
        if(element[0].nodeName == "IMG" && $(element).attr('class') != 'x-ck12-math' && $(element).attr('class') != 'x-ck12-block-math'){
            $(element).css('height', fix_height+'px');
            $(element).attr('height', fix_height+'px');
            $(element).css('width', '');
            $(element).attr('width', '');
            found = true;
            break;
        }
        if(element.children().length == 0)
            break;
        element = element.children(':first-child');
    }
    
    return found;
} 

function fixVideoNode( element, fix_height ) {
    found = false;
    cur_element = element;
    child_index = 1;
    while(true) {
        if(element[0].nodeName == "IFRAME"){
            $(element).attr('height', (fix_height)+'px');
            found = true;
            break;
        }
        if(cur_element.children().length == 0)
            break;
        element = cur_element.children(':nth-child('+child_index+')');
        child_index++;
        if(child_index == cur_element.children().length+2)
            break;
    }
    
    return found;
} 

function fixSlider() {
    $('#actual_content').show();
    $('#actual_content_first').show();
    left_content_height = $('#actual_content_first').innerHeight(); 
    right_content_height = $('#actual_content').innerHeight(); 
    percent_covered = Math.round((left_content_height/(left_content_height+right_content_height))*100);
    if($.browser.webkit){
        $('#reader_page_slider').attr('value', percent_covered);
        $('#current_content_covered_info').show();
        $('#current_content_covered_info').text(current_artifact_type+' ' + current_chapter_index + ' : '+ $('#reader_page_slider').attr('value') + '%');
        $('#current_content_covered_info').hide();
        current_info_pos = -5 + ($('#reader_page_slider').attr('value')/100) * 94 + '%';
        $('#current_content_covered_info').css('left', current_info_pos);
    } else {
        $('#reader_page_slider').slider('option', 'value', percent_covered);
        page_slider_value = $('#reader_page_slider').slider('option', 'value');
        if(page_slider_value == 0)
            page_slider_value = 1;
        $('#current_content_covered_info').text(current_artifact_type+' ' + current_chapter_index + ' : '+ page_slider_value + '%');
        current_info_pos = 7 + (parseInt($('#reader_page_slider').slider('option','value'))/100) * 76 + '%';
        $('#current_content_covered_info').css('left', current_info_pos);
    }
    $('#actual_content').hide();
    $('#actual_content_first').hide();

}

function goToPrevious(is_fix_slider) {
    if($('#actual_content_first').children().length == 0) {
        if (current_chapter_index > 1) {
            //$('#toc_pull_button').trigger('click');
            prevChild = $('#table_of_contents').find('.toc_button')[current_chapter_index - 2];
            prevChildType = $.trim($(prevChild).attr('data-artifactType'));
            loadChapter(prevChild, true, prevChildType);
        } else {
            if($('#content_frame').children().length == 0)
                goToNextPage(true);
            return;
        }
    }
    $('#content_frame').find('img').each(function(){
        if(($(this).attr('class') == undefined) && ($(this).attr('style') != undefined)) {
            eleStyle = $(this).attr('style');
            eleStyle = eleStyle.replace('float:left;','');
            eleStyle = eleStyle.replace('padding-right:2%;','');
            $(this).attr('style',eleStyle); 
        }
    });
    $('#actual_content').show();
    //$('#content_frame > #artifact_reader_title').remove();
    if($('#actual_content').children().length == 0)
        $('#content_frame').contents().appendTo($('#actual_content'));
    else
        $('#content_frame').contents().insertBefore($('#actual_content').children(':first-child'));
    $('#actual_content').hide();
    $('#content_frame').text('');
    full_content_size = $('#actual_content').innerHeight();
    full_content_size += $('#actual_content_first').innerHeight();
    prePaginateContent();
    if(($('#actual_content_first').children().length == 0) && (current_chapter_index == 1))
        $('#previous_button').hide();
    if($('#actual_content').children().length > 0)
        $('#next_button').show();
    if(is_fix_slider == true) {
        fixSlider();
        updatePercent();
    }
}

function increase_font_size() {
    $('#actual_content').show();
    $('#actual_content_first').show();
    current_size = $('#content_frame').css('font-size');
    current_line_height = $('#content_frame').css('line-height');
    current_size = current_size.replace('px','');
    current_line_height = current_line_height.replace('px','');
    current_size++;
    current_line_height++;
    if(current_size > 20){
        $('#font_big_button').attr('disabled','disabled');
    }
    if(current_size >= 9) {
        $('#font_small_button').removeAttr('disabled');
    }
    current_size = current_size + "px";
    current_line_height = current_line_height + "px";
    $('#content_frame').css('font-size', current_size);
    $('#content_frame').css('line-height', current_line_height);
    $('#toc_container').css('font-size', current_size);
    $('#toc_container').css('line-height', current_line_height);
    $('#actual_content').css('font-size', current_size);
    $('#actual_content_first').css('font-size', current_size);
    $('#actual_content').css('line-height', current_line_height);
    $('#actual_content_first').css('line-height', current_line_height);
    if($('#actual_content').children().length == 0)
        $('#content_frame').contents().appendTo($('#actual_content'));
    else
        $('#content_frame').contents().insertBefore($('#actual_content').children(':first-child'));
    $('#actual_content').hide();
    $('#actual_content_first').hide();
    goToNextPage(true);
}

function decrease_font_size() {
    $('#actual_content').show();
    $('#actual_content_first').show();
    current_size = $('#content_frame').css('font-size');
    current_line_height = $('#content_frame').css('line-height');
    current_size = current_size.replace('px','');
    current_line_height = current_line_height.replace('px','');
    current_size--;
    if(current_line_height > 21)
        current_line_height--;
    if(current_size < 9){
        $('#font_small_button').attr('disabled','disabled');
    }
    if(current_size <= 20) {
        $('#font_big_button').removeAttr('disabled');
    }
    current_size = current_size + "px";
    current_line_height = current_line_height + "px";
    $('#content_frame').css('font-size', current_size);
    $('#content_frame').css('line-height', current_line_height);
    $('#toc_container').css('font-size', current_size);
    $('#toc_container').css('line-height', current_line_height);
    $('#actual_content').css('font-size', current_size);
    $('#actual_content_first').css('font-size', current_size);
    $('#actual_content').css('line-height', current_line_height);
    $('#actual_content_first').css('line-height', current_line_height);
    if($('#actual_content').children().length == 0)
        $('#content_frame').contents().appendTo($('#actual_content'));
    else
        $('#content_frame').contents().insertBefore($('#actual_content').children(':first-child'));
    $('#actual_content').hide();
    $('#actual_content_first').hide();
    goToNextPage(true);
}

function goToPageFromBox(page_num) {

}

function navigateToPage() {
    setTimeout("load_mask('#content_frame', 'Loading')", 100);
    setTimeout("goToPage($('#reader_page_slider').attr('value'))", 500);

}

function updatePercent() {
        $('#actual_content').show();
        $('#actual_content_first').show();
        full_content_size = $('#actual_content').innerHeight();
        full_content_size += $('#actual_content_first').innerHeight();
        full_content_size += $('#content_frame').innerHeight();
        loaded_content_size = full_content_size - $('#actual_content').innerHeight();
        loaded_content_size -= $('#actual_content > #artifact_reader_title').innerHeight();
        if(current_chapter_index > 1) {
            loaded_content_size = loaded_content_size + (full_content_size * (current_chapter_index - 1));
        }
        full_content_size = full_content_size * total_chapters;
        percent_covered = Math.round((loaded_content_size/full_content_size)*100);
        if(percent_covered == 0)
            percent_covered = 1;
        if(($('#actual_content').children().length > 0) && (percent_covered == 100))
            percent_covered = 99;
        $('#actual_content').hide();
        $('#actual_content_first').hide();
        if($('#current_content_covered_info').attr('data-artifactType') == "book") {
            $('#percent_covered_info').text(': ' + percent_covered + '%    ('+current_artifact_type+' '+ current_chapter_index + ' of ' + total_chapters + ')');
        } else {
            if($.browser.webkit) {
                percent_covered = $('#reader_page_slider').attr('value');
            } else {
                percent_covered = $('#reader_page_slider').slider('option','value');
                if(percent_covered == 0)
                    percent_covered = 1;
            }
            $('#percent_covered_info').text(' ' + current_artifact_type.toLowerCase()+' '+ percent_covered + '%');
        }
}

function goToPage(slider_percent) {
        $('#actual_content').show();
        $('#actual_content_first').show();
        content_fix_height = Math.round(($(window).height()*44.843)/100);
        full_content_size = $('#actual_content').innerHeight();
        full_content_size += $('#actual_content_first').innerHeight();
        full_content_size += $('#content_frame').innerHeight();
        cut_through_size = Math.round((slider_percent/100) * full_content_size); 
        if(cut_through_size <= $('#actual_content_first').innerHeight()) {
            if($('#actual_content').children().length == 0)
                $('#content_frame').contents().appendTo($('#actual_content'));
            else
                $('#content_frame').contents().insertBefore($('#actual_content').children(':first-child'));
            paginate_size = cut_through_size;
            start_size = $('#actual_content_first').innerHeight();
            while(start_size >= paginate_size) {
                $('#actual_content_first').children(':last-child').insertBefore($('#actual_content').children(':first-child'));
                start_size = $('#actual_content_first').innerHeight();
                if($('#actual_content_first').innerHeight() <= content_fix_height)
                    break;
            }
            $('#actual_content > .loadmask').remove();
            $('#actual_content > .loadmask-msg').remove();
            $('#actual_content_first > .loadmask').remove();
            $('#actual_content_first > .loadmask-msg').remove();
            goToPrevious(false);
            if($('#actual_content_first').children().length == 0){
                fixSlider();
                $('#previous_button').hide()
            }
             
        } else {
                if ((cut_through_size > $('#actual_content_first').innerHeight()) && (cut_through_size <= ($('#actual_content_first').innerHeight() +$('#content_frame').innerHeight() ))) {
                    $('#actual_content > .loadmask').remove();
                    $('#actual_content > .loadmask-msg').remove();
                    $('#actual_content_first > .loadmask').remove();
                    $('#actual_content_first > .loadmask-msg').remove();
                    $('#content_frame > .loadmask').remove();
                    $('#content_frame > .loadmask-msg').remove();

                } else {
            $('#content_frame').contents().appendTo('#actual_content_first');
            paginate_size = cut_through_size;
            start_size = $('#actual_content_first').innerHeight();
            while(start_size < cut_through_size) {
                $('#actual_content').children(':first-child').appendTo($('#actual_content_first'));
                start_size = $('#actual_content_first').innerHeight();
                if($('#actual_content').innerHeight() <= content_fix_height)
                    break;
            }
            $('#actual_content > .loadmask').remove();
            $('#actual_content > .loadmask-msg').remove();
            $('#actual_content_first > .loadmask').remove();
            $('#actual_content_first > .loadmask-msg').remove();
            goToNextPage(false);
            if($('#actual_content').children().length == 0){
                fixSlider();
                $('#next_button').hide()
            }
        
        }
        }
        $('#actual_content').hide();
        $('#actual_content_first').hide();
        $('#content_frame').unmask;
        updatePercent();
        if(slider_percent == 100)
                if($.browser.webkit) {
                $('#reader_page_slider').attr('value', 100);
                } else {
                $('#reader_page_slider').slider('option', 'value', 100);
                }
        $('#current_content_covered_info').hide();

}

function splitTable(element, max_height) {
    $('#split_tables').show();
    if($(element).innerHeight() <= max_height)
        return;
    $('#split_tables').text(''); 
    $(element).clone().appendTo('#split_tables');
    firstTable = element;
    secondTable = $('#split_tables').children()[$('#split_tables').children().length-1];
    total_height = 0;
    threshold = 0;
    for (i=0; i<firstTable.rows.length;i++){
        row1 = firstTable.rows[i];
        total_height = total_height + $(row1).innerHeight();
        if(total_height >= max_height) {
                
            total_height = total_height - $(row1).innerHeight();
            threshold = i;
            break;

        }
    }

    if(threshold != 0){
        total_rows = firstTable.rows.length; 
        for(i=threshold;i<total_rows;i++){
            row1 = firstTable.rows[threshold];
            $(row1).remove();
        }
        
        if($(firstTable).innerHeight() >= max_height) {
            row1 = firstTable.rows[threshold-1];
            $(row1).remove();
            threshold = threshold - 1;
        }
 
        for(i=0;i<threshold;i++){
            row2 = secondTable.rows[0];
            $(row2).remove();
        }
    } else {
        $(secondTable).remove();
    } 
    if($(secondTable).innerHeight() > max_height)
        splitTable(secondTable, max_height);
}

function fixButtons() {
        /*
        tmp_page = 1;
        while(tmp_page < max_pages+1) {
            if(tmp_page == page-1) {
                $('#page'+tmp_page+'_button').attr('disabled','disabled');
                $('#cur_page_num').val(tmp_page);
                $('#cur_page_num1').val(tmp_page);
            } else {
                $('#page'+tmp_page+'_button').removeAttr('disabled');

            }
            tmp_page++; 
        }
        */
}

function callContent(not_lazy_load) {
        $('#actual_content').show();
        //preProcessTables();
       // preProcessLists();
        paginateContent();
        if(not_lazy_load != true) {
            $('#content_frame').find('img').each(function() {
              $(this).load(function(){
                if($('#actual_content').children().length > 0){
                    goToNextPage();
                    goToPrevious();
                    for(k=0; k < 5; k++)
                        if($('#actual_content_first').children().length > 0)
                            goToPrevious();
                }
              });
            });
        }
        $('#actual_content').hide();
        $('#backup_content').hide();
        $('#previous_button').hide();
        updatePercent();
        $('#content_frame').unmask();
        $('#actual_content > .loadmask').remove();
        $('#actual_content > .loadmask-msg').remove();
        $('#actual_content_first > .loadmask').remove();
        $('#actual_content_first > .loadmask-msg').remove();
}

function preProcessContent() {
    max_height = content_fix_height;
    height_fact = 50;

    $('#actual_content > .x-ck12-data-problem-set').contents().insertAfter($('#actual_content > .x-ck12-data-problem-set'));   
    if($.trim($('#actual_content').text()) != "") {
        kid = $('#actual_content').children(':nth-child(1)');
        while(true){
            totalEleHeight = kid.innerHeight();
            if(totalEleHeight + height_fact > max_height){
                splitAggressively(kid, (max_height - totalEleHeight), max_height);
                if(kid.innerHeight() > max_height){
                    splitAggressively(kid, max_height/2, max_height);
                }
                $(kid).appendTo($('#preprocessed_content'));
                height_fact = 50;
            } else {
                height_fact = height_fact + totalEleHeight;
                $(kid).appendTo($('#preprocessed_content'));
            }
            if($('#actual_content').children().length == 0)
                break;
            else
                kid = $('#actual_content').children(':nth-child(1)');
        }
    }    
}

function splitAggressivelyInReverse(element, cut_off_height, max_height) {
    cur_element = element;
    if(element.children().length == 0)
        return;
    child_num = element.children().length;
    found = false;
    while(!found && child_num!=0){
        if($(element.children(':nth-child('+child_num+')')).innerHeight() > cut_off_height) {
            found = true;     
        } else {
            child_num--;
        }
    }
    if(child_num == 0)
        return;
    if($(element.children(':nth-child('+child_num+')')).innerHeight() > cut_off_height) {
        fixImageNode(element, cut_off_height);
    }

    if($(element.children(':nth-child('+child_num+')')).innerHeight() > cut_off_height) {
        element = element.children(':nth-child('+child_num+')')
        child_num--;
        splitAggressivelyInReverse(element, cut_off_height, max_height);
        element = element.parent();
        cur_height = element.innerHeight();
        splitElementInReverse(element, cut_off_height, max_height);
        if(element.innerHeight() == cur_height) {
            $('#split_lists').contents().remove();
            $('#split_lists').hide();
            return;
        }
        content = $('#split_lists').contents();
        $(content).insertAfter(element);           
        $('#split_lists').contents().remove();
        $('#split_lists').hide();
        
        /*if ((element.next().length > 0) && (element.next().innerHeight() > max_height)){
            splitAggressively(element.next(), max_height, max_height);
        }  
        if ((element.next().length > 0) && (element != element.next())){
            
        }*/
         
    } else {
        splitElementInReverse(element, cut_off_height, max_height);
        content = $('#split_lists').contents();
        $(content).insertAfter(element);           
        $('#split_lists').contents().remove();
        $('#split_lists').hide();
    }
  
}
function splitAggressively(element, cut_off_height, max_height) {
    cur_element = element;
    if(element.children().length == 0)
        return;
    child_num = 1;
    found = false;
    while(!found && element.children().length != child_num){
        if($(element.children(':nth-child('+child_num+')')).innerHeight() > cut_off_height) {
            found = true;     
        } else {
            child_num++;
        }
    }

    if($(element.children(':nth-child('+child_num+')')).innerHeight() > cut_off_height) {
        fixImageNode(element, cut_off_height);
    }

    if($(element.children(':nth-child('+child_num+')')).innerHeight() > cut_off_height) {
        element = element.children(':nth-child('+child_num+')')
        child_num++;
        splitAggressively(element, cut_off_height, max_height);
        element = element.parent();
        splitElement(element, cut_off_height, max_height);
        content = $('#split_lists').contents();
        $(content).insertAfter(element);           
        $('#split_lists').contents().remove();
        $('#split_lists').hide();
        
        /*if ((element.next().length > 0) && (element.next().innerHeight() > max_height)){
            splitAggressively(element.next(), max_height, max_height);
        }  
        if ((element.next().length > 0) && (element != element.next())){
            
        }*/
         
    } else {
        splitElement(element, cut_off_height, max_height);
        content = $('#split_lists').contents();
        $(content).insertAfter(element);           
        $('#split_lists').contents().remove();
        $('#split_lists').hide();
    }
  
}

function splitElementInReverse(element, max_height, max_page_height) {
    $('#split_lists').show();
    $(element).clone().appendTo('#split_lists');
    firstlist = element;
    secondlist = $('#split_lists').children();//[$('#split_lists').children().length-1];
    total_height = 0;
    threshold = -1;
    /*$.each($(firstlist).children(), function(index, value){
        total_height = total_height + $(value).innerHeight();
        if(total_height > max_height) {
            if(threshold == 0)
                threshold = index;
        }
    });*/
 
    child_num = $(firstlist).children().length;
    while(child_num != 0) {
        total_height = total_height + $(firstlist).children(':nth-child('+child_num+')').innerHeight();
        if(total_height > max_height) {
            threshold = child_num;
            break;
        }
        child_num--;
    }
 
    if(threshold >= 0) {
        $.each($(firstlist).children(), function(index, value){
            if(index > threshold) {
               li_ele = value;
               $(li_ele).remove();
            }
        });
 
        $.each($(secondlist).children(), function(index, value){
            if(index <= threshold) {
                li_ele = value;
                $(li_ele).remove();
            }
        });

        if($(secondlist).children().length == 0)
            $(secondlist).remove();

        if(element[0].nodeName == "OL") {
            if((element.attr('class') == "x-ck12-decimal") || (element.attr('class') == undefined)){
                start = $(firstlist).attr('start');
                end = threshold+2;
                if(start != undefined) {
                    end = parseInt(start) + threshold + 1;
                } else {
                    start = 1;
                }
                $(firstlist).attr('start', start);
                $(secondlist).attr('start', end);
            }
        }
    } else {
        $(secondlist).remove();
    }
    
}
function splitElement(element, max_height, max_page_height) {
    $('#split_lists').show();
    $(element).clone().appendTo('#split_lists');
    firstlist = element;
    secondlist = $('#split_lists').children();//[$('#split_lists').children().length-1];
    total_height = 0;
    threshold = -1;
    $.each($(firstlist).children(), function(index, value){
        total_height = total_height + $(value).innerHeight();
        if(total_height > max_height) {
            if(threshold == -1)
                threshold = index;
        }
    });
    if(threshold >= 0) {
        $.each($(firstlist).children(), function(index, value){
            if(index > threshold) {
               li_ele = value;
               $(li_ele).remove();
            }
        });
 
        $.each($(secondlist).children(), function(index, value){
            if(index <= threshold) {
                li_ele = value;
                $(li_ele).remove();
            }
        });
        if($(secondlist).children().length == 0)
            $(secondlist).remove();
        if(element[0].nodeName == "OL") {
            if((element.attr('class') == "x-ck12-decimal") || (element.attr('class') == undefined)){
                start = $(firstlist).attr('start');
                end = threshold+2;
                if(start != undefined) {
                    end = parseInt(start) + threshold + 1;
                } else {
                    start = 1;
                }
                $(firstlist).attr('start', start);
                $(secondlist).attr('start', end);
            }
        }
    } else {
        $(secondlist).remove();
    }
    
}

function preProcessTables() {
    max_height = content_fix_height;
    do {
        total_children = $('#actual_content').children().length;
        $('#actual_content').children().each(function(){
            if(this.nodeName == 'TABLE'){
                splitTable(this, max_height);
                content = $('#split_tables').contents();
                $(content).insertAfter($(this));
                $('#split_tables').contents().remove();
                $('#split_tables').hide();
            }
        });
       
    }while($('#actual_content').children().length != total_children);
}

function splitList(element, max_height) {
    $('#split_lists').show();
    if($(element).children().length*18 <= max_height)
        return;
    $('#split_lists').text(''); 
    $(element).clone().appendTo('#split_lists');
    firstlist = element;
    secondlist = $('#split_lists').children()[$('#split_lists').children().length-1];
    total_height = 0;
    threshold = 0;
    $.each($(firstlist).children(), function(index, value){
        total_height = total_height + $(value).innerHeight();
        if(total_height > max_height/2) {
            if(threshold == 0)
                threshold = index;
        }
    });
    if(threshold != 0) {
        $.each($(firstlist).children(), function(index, value){
            if(index > threshold) {
               li_ele = value;
               $(li_ele).remove();
            }
        });
 
        $.each($(secondlist).children(), function(index, value){
            if(index <= threshold) {
                li_ele = value;
                $(li_ele).remove();
            }
        });
    } else {
        $(secondlist).remove();
    }
        
    if($(secondlist).children().length*18 > max_height)
        splitList(secondlist, max_height);
}

function preProcessLists() {
    max_height = content_fix_height;
    do {
        total_children = $('#actual_content').children().length;
        $('#actual_content').children().each(function(){
            if((this.nodeName == 'OL') || (this.nodeName == 'UL')){
                splitList(this, max_height);
                content = $('#split_lists').contents();
                $(content).insertAfter($(this));
                $('#split_lists').contents().remove();
                $('#split_lists').hide();
            }
        });
       
    }while($('#actual_content').children().length != total_children);
}

function load_mask(ele_id, label) {
    $(ele_id).mask(label);
    $('.loadmask-msg').css('top','40%');
    $('.loadmask-msg').css('left','45%');
}
