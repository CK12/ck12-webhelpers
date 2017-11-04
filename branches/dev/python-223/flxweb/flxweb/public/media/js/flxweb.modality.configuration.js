
define('flxweb.modality.configuration',
['jquery'],
function($) {
	$(document).ready(function(){
		//$('#navigationtop').width($('.tr').width() + 'px');
		//$('#navigationbottom').width($('.tr').width() + 'px');
		
        $('.group_update').click(function(){
        	ModalityConfiguration.updateGroups(this);
        });
        
        $('.modalities_update').click(function(){
        	ModalityConfiguration.updateModalities(this);
        });
        
        $('.new_modality').click(function(){
        	ModalityConfiguration.newModality();
        });
        
        $('.update_all_modalities').click(function(){
        	ModalityConfiguration.updateAllModalities();
        });
                
        $('#update_all_groups').click(function(){
        	ModalityConfiguration.updateAllGroups();
        });
        
        $('.remove_modality_row').click(function(){
        	ModalityConfiguration.removeNewModalityRow(this);
        });
        
        $('.add_modality').click(function(){
        	ModalityConfiguration.addNewModality(this);
        });
	});
	
	var ModalityConfiguration = { 
	
	getModalitiesData : function(updatelink){
		var currentRow = updatelink,
			artifact_name = $.trim($($(currentRow).find('.td')[0]).find('span').html()),
			artifact_type = $.trim($($(currentRow).find('.td')[0]).find('input').val()),
			display_label = $.trim($($(currentRow).find('.td')[1]).find('input').val()),
			weight_teacher = $($(currentRow).find('.td')[2]).find('.type_filter').find('option:selected').text(),
			weight_student = $($(currentRow).find('.td')[3]).find('.type_filter').find('option:selected').text(),
			show_student = 'False';
		if ($($(currentRow).find('.td')[4]).find('#type_filter').is(':checked')){
			show_student = 'True';
		}
		
		if (artifact_type == ''){
			$.flxweb.showDialog("Artifact Type can not be empty.");
			return false;
		}
		if (display_label == ''){
			$.flxweb.showDialog("Display Label can not be empty.");
			return false;
		}
		var data={
			'name':artifact_name,
        	'artifact_type':artifact_type,
      		'display_label':display_label,           
      		'weight_teacher':weight_teacher,
      		'weight_student':weight_student,
      		'student_show':show_student
		};
		return data;
	},
	
	updateModalities : function(updatelink,data){
		var dataString = ''
		if (typeof data === 'undefined'){
			data = ModalityConfiguration.getModalitiesData($(updatelink).parent().parent());
			if (data == false){
				return false;
			}
			dataString = {"data" : '[' + JSON.stringify(data) + ']'}
		}
 		var render_url = '/update_modalities/configuration/';
		ModalityConfiguration.makeAJAXPostRequest('POST',render_url,dataString,false,'json');
	},
	
	updateAllModalities : function(){
		var tr = $('div.tbody form.tr');
		var dataString = '';
		$.each(tr,function(i,val){
			var currentRow = this;
			data =	ModalityConfiguration.getModalitiesData(currentRow);
			if (data == false){
				dataString = '';
				return false;
			}
			if (dataString === '') {
				dataString = '[' + JSON.stringify(data);
			}else {
				dataString += ',' + JSON.stringify(data);
			}
        });
        if (dataString == ''){
        	return false;
        }
        dataString += ']'
        dataString = {"data" : dataString}
        var render_url = '/update_modalities/configuration/';
		ModalityConfiguration.makeAJAXPostRequest('POST',render_url,dataString,false,'json');
	},

	newModalityHTMLStructure : function(){
	},
	
	newModality : function(){
		$('.tbody').append($('#emptyModalityContainer').html());
		$($($('.table .tr').last().find('.td')[0]).find('input')).focus();
		$('.remove_modality_row').click(function(){
        	ModalityConfiguration.removeNewModalityRow(this);
        });
        
        $('.add_modality').click(function(){
        	ModalityConfiguration.addNewModality(this);
        });
	},

	addNewModality : function(addlink){
		var dataString = '';
		data = ModalityConfiguration.getModalitiesData($(addlink).parent().parent());
		if (data == false){
			return false;
		}
		dataString = {"data" : '[' + JSON.stringify(data) + ']'}
		var render_url = '/new_modality/configuration/';
		ModalityConfiguration.makeAJAXPostRequest('POST',render_url,dataString,false,'json');
	},
	
	removeNewModalityRow : function(row){
		$(row).parent().parent().remove();
	},
	
	getGroupsData : function(updatelink){
		var currentRow = updatelink,
			group_name = $.trim($($(currentRow).find('.td')[0]).find('input').val()),
			group_classname = $.trim($($(currentRow).find('.td')[1]).find('input').val()),
			display_text = $.trim($($(currentRow).find('.td')[2]).find('input').val()),
			artifact_types = $.trim($($(currentRow).find('.td')[3]).find('input').val()),
			sequence = $($(currentRow).find('.td')[4]).find('.type_filter').find('option:selected').text(),
			show_text_label = 'False',
			default_thumb = $.trim($($(currentRow).find('.td')[6]).find('input').val());
			
		if ($($(currentRow).find('.td')[5]).find('#type_filter').is(':checked')){
			show_text_label = 'True';
		}
		
		if (group_name == ''){
			$.flxweb.showDialog("Group name can not be empty.");
			return false;
		}
		if (group_classname == ''){
			$.flxweb.showDialog("Group Classname can not be empty.");
			return false;
		}
		if (display_text == ''){
			$.flxweb.showDialog("Display Text can not be empty.");
			return false;
		}
		if (artifact_types == ''){
			$.flxweb.showDialog("Artifact Types can not be empty.");
			return false;
		}
		var	data={
			'group_name':group_name,
			'display_text':display_text,           
			'artifact_types':artifact_types,
			'sequence':sequence,
			'group_classname':group_classname,
			'show_text_label':show_text_label,
			'default_thumb':default_thumb
		};
		return data;
	},
	
	updateGroups : function(updatelink,data){
		var dataString = ''
		if (typeof data === 'undefined'){
			data = ModalityConfiguration.getGroupsData($(updatelink).parent().parent());
			if (data == false){
				return false;
			}
			dataString = {"data" : '[' + JSON.stringify(data) + ']'};
		}
		var render_url = '/update_groups/configuration/';
		ModalityConfiguration.makeAJAXPostRequest('POST',render_url,dataString,false,'json');
	},

	updateAllGroups : function(){
		var tr = $('div.tbody form.tr');
		var dataString = '';
		$.each(tr,function(i,val){
			var currentRow = this;
			data =	ModalityConfiguration.getGroupsData(currentRow);
			if (data == false){
				dataString = '';
				return false;
			}
			if (dataString === '') {
				dataString = '[' + JSON.stringify(data);
			}else {
				dataString += ',' + JSON.stringify(data);
			}
        });
        if (dataString == ''){
        	return false;
        }
        dataString += ']'
        dataString = {"data" : dataString}
        var render_url = '/update_groups/configuration/';
		ModalityConfiguration.makeAJAXPostRequest('POST',render_url,dataString,false,'json');
	},
	
	makeAJAXPostRequest : function(type, url, data, cache, dataType){
		$.ajax({
			type:type,
			url: url,
			data:data,
			cache: cache,
			dataType: dataType,
			success: ModalityConfiguration.statusSuccess,
			error: ModalityConfiguration.statusError
		});
	},
	
	statusSuccess: function (data) {
	    if (data && data.message) {
	        $.flxweb.showDialog(data.message);
	        if (data.status == "success") {
	            var url = document.URL;
	            if (new RegExp('confType=').test(url)) {
	                if (new RegExp('&nocache=true&key=modalityconfig').test(url)) {
	                    window.location = url;
	                } else {
	                    window.location = url + '&nocache=true&key=modalityconfig';
	                }
	            } else {
	                window.location = url + '?confType=modalities&nocache=true&key=modalityconfig';
	            }
	        }
	    }
	},

	statusError : function(data){
		if (data && data.message){
			$.flxweb.showDialog(data.message);
		}
	},
};
});

