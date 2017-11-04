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
 *  This file was originally written by Sathish
 */

define('flxweb.taxonomy', ['jquery', 'flxweb.global', 'flxweb.utils.hash'], function ($) {
    "use strict";
	var flxweb_host = window.location.hostname, taxonomyPrefix = '/taxonomy', flxPrefix = '/flx', conceptHash = new Hash(), artifactTextHash = new Hash(), artifactVideoHash = new Hash(), artifactAttachmentHash = new Hash(), artifactExerciseHash = new Hash(), conceptDialog = null, currentQuery = '', previousQuery = '';
	//total number of results per page and total pagination numbers to be shown on the bottom (only for search results)
	var pageSize = 10, totalNumDisplay = 9;
	// temporarily added this array to throw alert message for the branch which has no concept map
	var branchWithoutConceptMap = ['MEA', 'LSC', 'CHE', 'TRG', 'CAL', 'HIS'];

	// Main function called from document ready
	function main() {
		$.ajax({
			url : taxonomyPrefix + '/get/info/subjects',
			type : 'GET',
			dataType : 'json',
			success : function (data) {
				if (data.responseHeader.status !== 0) {
					$.flxweb.showDialog($.flxweb.gettext("Error get subjects info: " + data.response.message));
				}
				var selectHtml = '<select id="subjectSel">';
				selectHtml += '<option value="">-- Select One --</option>';
				for (var i = 0; i < data.response.subjects.length; i++) {
					selectHtml += '<option value="' + data.response.subjects[i].shortname + '">' + data.response.subjects[i].name + '</option>';
				}
				selectHtml += '</select>';
				$('#subject').html(selectHtml);
			}
		});

		conceptDialog = $.flxweb.createDialog($('#taxonomyConceptDetailContainer'), {
			width : 500
		});

		// Event handlers
		$('.taxonomyContainer #subjectSel').live("change", getBranches);

		$('.taxonomyContainer .expandImage').live("click", getDescendants);

		$('.taxonomyContainer .collapseImage').live("click", deleteRowOnCollpase);

		$('.taxonomyContainer .conceptNameLink').live("click", showConceptDetail);

		$('#taxonomyConceptDetailContainer #branchLink').live("click", getTopLevelConcepts);

		$('#taxonomyConceptDetailContainer #nextLink').live("click", getNextConcept);

		$('#taxonomyConceptDetailContainer #previousLink').live("click", getPreviousConcept);

		$('.taxonomyContainer #btnTopConcepts').click(getTopLevelConcepts);

		$('.taxonomyContainer #formSearchConcepts').submit(searchConceptRoute);

		$('.taxonomyContainer .paginationClass').live("click", searchConceptRoute);

		$('.taxonomyContainer #btnViewConcept').click(viewConceptMap);
	}

	/*
	 * This function gets all the branches for the selected subjects
	 */
	function getBranches(branchValue) {
		var subject = $('#subjectSel').val();
		$.ajax({
			url : taxonomyPrefix + '/get/info/branches/' + subject,
			type : 'GET',
			dataType : 'json',
			success : function(data) {
				if (data.responseHeader.status != 0) {
					$.flxweb.showDialog($.flxweb.gettext("Error get branches info: " + data.response.message));
				}
				var branches = data.response.branches;
				var selectHtml = '<select id="branchSel">';
				selectHtml += '<option value="">-- Select One --</option>';
				for (var i = 0; i < branches.length; i++) {
					selectHtml += '<option value="' + branches[i].shortname + '">' + branches[i].name + '</option>';
				}
				selectHtml += '</select>';
				$('#branch').html(selectHtml);
				if (branchValue != undefined) {
					$('#branchSel').val(branchValue);
				}
			}
		});
        // Enable View Concept Map button only for Mathematics & Science branches. 
        if (subject == "MAT" || subject == "SCI") {
            $('#btnViewConcept').removeAttr("disabled")
        } else {
            $('#btnViewConcept').attr("disabled", true)
        }
    
	}

	/*
	 * This function gets the top level concepts for the given subject and its branch
	 */
	function getTopLevelConcepts() {
		var subject = '';
		var branch = '';
		var encodedID = $(this).attr('data-encodedID');
		if (encodedID != undefined) {
			var concept = conceptHash.get(encodedID);
			subject = concept.subject.shortname;
			branch = concept.branch.shortname;
			$('#subjectSel').val(subject);
			getBranches(branch);
			conceptDialog.close();
		} else {
			subject = $('#subjectSel').val();
			branch = $('#branchSel').val();
			if (subject == "" && branch == "") {
				$.flxweb.showDialog($.flxweb.gettext("Please select a subject and branch."));
				return;
			} else if (subject == "") {
				$.flxweb.showDialog($.flxweb.gettext("Please select a subject."));
				return;
			} else if (branch == "") {
				$.flxweb.showDialog($.flxweb.gettext("Please select a branch."));
				return;
			}
		}
		$.ajax({
			url : taxonomyPrefix + '/get/info/concepts/' + subject + '/' + branch + '/top?pageSize=20',
			type : 'GET',
			dataType : 'json',
			success : function(data) {
				if (data.response.limit == 0) {
					$.flxweb.showDialog($.flxweb.gettext("No results found."));
					return;
				}
				insertConceptTable();
				var conceptNodes = data.response.conceptNodes;
				for (var i = 0; i < conceptNodes.length; i++) {
					conceptHash.set(conceptNodes[i].encodedID, conceptNodes[i]);
					addConceptRow(conceptNodes[i]);
				}
			}
		});
	}

	/*
	 * Search routing happens based on the origination of the request
	 */
	function searchConceptRoute(e) {
		var requestFrom = $(this).attr('data-from');
		if (requestFrom == 'pagination') {
			var currentPage = $(this).attr('data-value');
			searchConcepts(currentPage);
		} else {
			previousQuery = currentQuery;
			currentQuery = $('#searchConcepts').val();
			searchConcepts(1);
		}
		e.preventDefault();
		return false;
	}

	/*
	 * This method brings the concepts for the search term
	 */
	function searchConcepts(currentPage) {
		if (currentQuery == '') {
			$.flxweb.showDialog($.flxweb.gettext("Please enter a search term."));
			currentQuery = previousQuery;
			return;
		}
		$.ajax({
			url : taxonomyPrefix + '/search/concept/' + currentQuery + '?pageNum=' + currentPage + '&pageSize=' + pageSize,
			type : 'GET',
			dataType : 'json',
			success : function(data) {
				if (data.response.limit == 0) {
					$.flxweb.showDialog($.flxweb.gettext("No results found."));
					currentQuery = previousQuery;
					return;
				}
				var conceptNodes = data.response.conceptNodes;
				insertConceptTableSearch();
				computePagination(data.response.offset, data.response.total, conceptNodes.length);
				for (var i = 0; i < conceptNodes.length; i++) {
					conceptHash.set(data.response.conceptNodes[i].encodedID, data.response.conceptNodes[i]);
					addConceptRowSearch(conceptNodes[i]);
				}
			}
		});
		return false;
	}

	/*
	 * This method performs pagination logic and displays the results at the bottom
	 */
	function computePagination(offset, total, currentTotal) {
		var leftRightDisplay = Math.round(totalNumDisplay / 2) - 1;
		var modValue = (total % pageSize);
		var totalPageNum = ((total - modValue) / pageSize);
		var currentPageNum = ((pageSize + offset ) / pageSize);
		var startFrom = currentPageNum;
		var counter = 0;
		var pageDiv = '';

		if (modValue != 0) {
			totalPageNum++;
		}
		startFrom = currentPageNum - leftRightDisplay;
		var diff = totalPageNum - currentPageNum;
		if (diff < leftRightDisplay) {
			for ( i = diff; diff < leftRightDisplay; diff++) {
				startFrom--;
			}
		}
		if (startFrom <= 0) {
			counter = 1;
			startFrom = 1;
		} else {
			counter = startFrom;
		}
		// adding previous link if the number is greater than 1
		if (currentPageNum > 1) {
			pageDiv = pageDiv + '<span><a class="paginationClass" data-from="pagination" data-value="' + 1 + '" href="javascript:void(0);">First</a>&nbsp;&nbsp;</span>';
			pageDiv = pageDiv + '<span><a class="paginationClass" data-from="pagination" data-value="' + (currentPageNum - 1) + '" href="javascript:void(0);">Previous</a>&nbsp;&nbsp;&nbsp;</span>';
		}
		for (var i = counter; i < (counter + totalNumDisplay); i++) {
			if (startFrom <= totalPageNum) {
				if (startFrom == currentPageNum) {
					pageDiv = pageDiv + '<span><strong>' + startFrom + '</strong>&nbsp;</span>';

				} else {
					pageDiv = pageDiv + '<span><a class="paginationClass" data-value="' + startFrom + '" data-from="pagination" href="javascript:void(0);">' + startFrom + '</a>&nbsp;</span>';
				}
			}
			startFrom++;
		}
		// adding Next and Last links if the number is greater than 1
		if (currentPageNum < totalPageNum) {
			pageDiv = pageDiv + '<span>&nbsp;&nbsp;<a class="paginationClass" data-from="pagination" data-value="' + (currentPageNum + 1) + '" href="javascript:void(0);">Next</a></span>';
			pageDiv = pageDiv + '<span>&nbsp;&nbsp;<a class="paginationClass" data-from="pagination" data-value="' + totalPageNum + '" href="javascript:void(0);">Last</a></span>';
		}
		pageDiv = pageDiv + '&nbsp;&nbsp;<span>(showing&nbsp;' + (((currentPageNum - 1) * pageSize) + 1) + '&nbsp;to&nbsp;' + (((currentPageNum - 1) * pageSize) + currentTotal) + '&nbsp;of&nbsp;' + total + '&nbsp;results)<span>';
		$('#pagination').html('</br>' + pageDiv);
	}

	/*
	 * This method gets the child of the corresponding parent. It makes use of the encoded Id.
	 */
	function getDescendants() {
		var conceptId = $(this).attr('data-encodeId');
		$(this).removeClass('expandImage');
		$(this).addClass('loadingImage');
		$.ajax({
			url : taxonomyPrefix + '/get/info/descendants/concepts/' + conceptId,
			type : 'GET',
			dataType : 'json',
			success : function(data) {
				if (data.responseHeader.status != 0) {
					$.flxweb.showDialog("Error get concept children info: " + data.response.message);
				}
				var conceptNode = data.response.conceptNode;
				var prevRowEncodedId = conceptNode.encodedID;
				for (var i = 0; i < conceptNode.children.length; i++) {
					conceptHash.set(conceptNode.children[i].encodedID, conceptNode.children[i]);
					addConceptRowChild(conceptNode.children[i], prevRowEncodedId.replace(/\./g, ''));
					prevRowEncodedId = conceptNode.children[i].encodedID;
				}
				$('div#' + conceptId.replace(/\./g, '')).removeClass('loadingImage');
				$('div#' + conceptId.replace(/\./g, '')).addClass('collapseImage');
			}
		});
	}

	/*
	 * This method deletes the row on collpase. It makes use of the padding value.
	 */
	function deleteRowOnCollpase() {
		var conceptId = $(this).attr('data-encodeId').replace(/\./g, '');
		$(this).removeClass('collapseImage');
		$(this).addClass('expandImage');
		var currentRow = $('div#conceptResult > table > tbody > tr#' + conceptId);
		var currentRowPaddingValue = currentRow.find('td:first').css("padding-left");
		currentRowPaddingValue = currentRowPaddingValue.substr(0, (currentRowPaddingValue.length - 2));
		while (true) {
			var paddingValue = currentRow.next().find('td:first').css("padding-left");
			paddingValue = paddingValue.substr(0, (paddingValue.length - 2))
			// adding 20 to differentiate the parent and child.
			if (Number(paddingValue) > (Number(currentRowPaddingValue) + 20)) {
				currentRow.next().remove();
			} else {
				break;
			}
			if (paddingValue == undefined) {
				break;
			}
		}
	}

	/*
	 * Creates concept table with header
	 */
	function insertConceptTable() {
		var thtml = '<table id="conceptTable" border="1">';
		thtml += '<tr style="background-color:#CCCCCC;"><td><strong>NAME</strong></td><td><strong>ENCODED ID</strong></td><tbody></tbody></table>';
		$('#conceptResult').html(thtml);
		$('#pagination').html('');
	}

	/*
	 * Inserts concept table for search
	 */
	function insertConceptTableSearch() {
		var thtml = '<table id="conceptTable" border="1">';
		thtml += '<tr style="background-color:#CCCCCC;"><td><strong>NAME</strong></td><td><strong>ENCODED ID</strong></td><td><strong>SUBJECT</strong></td><td><strong>BRANCH</strong></td></tr><tbody></tbody></table>';
		$('#conceptResult').html(thtml);
	}

	/*
	 *  This method adds concept row (only for parents)
	 */
	function addConceptRow(concept) {
		var row = '';
		if (concept.childCount > 0) {
			row = '<tr style="background-color:#EEEEEE;" id= \'' + concept.encodedID.replace(/\./g, '') + '\'><td><div class="spriteIcons expandImage" id= ' + concept.encodedID.replace(/\./g, '') + ' data-encodeId=\'' + concept.encodedID + '\'></div>&nbsp;&nbsp;<a href="javascript:void(0);" class="conceptNameLink" data-encodeId=\'' + concept.encodedID + '\'>' + concept.name + '</a></td><td>' + concept.encodedID + '</td></tr>';
		} else {
			row = '<tr style="background-color:#EEEEEE;" id= \'' + concept.encodedID.replace(/\./g, '') + '\'><td><div class="spriteIcons expandImage" style="visibility:hidden;"></div>&nbsp;&nbsp;<a href="javascript:void(0);" class="conceptNameLink" data-encodeId=\'' + concept.encodedID + '\'>' + concept.name + '</a>' + '</td><td>' + concept.encodedID + '</td></tr>';
		}
		$('#conceptResult > table > tbody:last').append(row);
	}

	/*
	 *  This method adds concept row (for childs)
	 */
	function addConceptRowChild(concept, prevRowId) {
		var paddingValue = 0;
		for (var i = 0; i < concept.level; i++) {
			paddingValue = paddingValue + 50;
		}
		if (concept.childCount > 0) {
			var row = '<tr id= \'' + concept.encodedID.replace(/\./g, '') + '\'><td style =\'padding-left: ' + paddingValue + 'px\'><div class="spriteIcons expandImage" id=' + concept.encodedID.replace(/\./g, '') + ' data-encodeId=\'' + concept.encodedID + '\'></div>&nbsp;&nbsp;<a href="javascript:void(0);" class="conceptNameLink" data-encodeId=\'' + concept.encodedID + '\'>' + concept.name + '</a></td><td>' + concept.encodedID + '</td></tr>';
		} else {
			paddingValue = paddingValue + 20;
			var row = '<tr id= \'' + concept.encodedID.replace(/\./g, '') + '\'><td style =\'padding-left: ' + paddingValue + 'px\'>&nbsp;<a href="javascript:void(0);" class="conceptNameLink" data-encodeId=\'' + concept.encodedID + '\'>' + concept.name + '</a></td><td>' + concept.encodedID + '</td></tr>';
		}
		$('#conceptResult > table > tbody > tr#' + prevRowId).after(row);
	}

	/*
	 *  This method adds concept row (for search)
	 */

	function addConceptRowSearch(concept) {
		var row = '<tr style="background-color:#EEEEEE;"><td><a href="javascript:void(0);" class="conceptNameLink" data-encodeId=\'' + concept.encodedID + '\'>' + concept.name + '</a>' + '</td><td>' + concept.encodedID + '</td><td>' + concept.subject.name + '</td><td>' + concept.branch.name + '</td></tr>';
		$('#conceptResult > table > tbody:last').append(row);
	}

	/*
	 * This method populates the concept details into a dialog box
	 */
	function showConceptDetail(conceptId) {
		var concept = null;
		var encodedID = $(this).attr('data-encodeId');
		if (encodedID == undefined) {
			encodedID = conceptId;
		}
		if (conceptHash.hasKey(encodedID)) {
			concept = conceptHash.get(encodedID);
		} else {
			$.flxweb.showDialog($.flxweb.gettext('No data for concept detail: ' + encodedID));
			return;
		}
		var parent = null;
		if ('parent' in concept && concept.parent != null) {
			parent = concept.parent;
			if ( typeof concept.parent == 'object' && 'encodedID' in concept.parent) {
				parent = concept.parent.encodedID;
			}
		}

		var groupList = []; 
		var modalityList = []; 
		var counts = []; 

		var createModalityMap = function (JSNobject) {
			var count = 0; 
			for(var i in JSNobject.response.domain.ck12ModalityCount) {
				if(JSNobject.response.domain.ck12ModalityCount.hasOwnProperty(i)) {
					var tempVarModality = JSNobject.response.domain.ck12ModalityCount[i];
					for(var p in tempVarModality) {
						if(tempVarModality.hasOwnProperty(p)) {
							count += JSNobject.response.domain.ck12ModalityCount[i][p]; 
						}
					}
					modalityList.push({'type': i, 'count': count});  
				}

				else {
					alert("No Modalities in this Concept"); 
				}
				count = 0; 
			}
		}

		var modalityIcon = {
                
                'read': 'icon-read',
                'video': 'icon-video',
                'activities': 'icon-activity',
                'study aids': 'icon-studyaid',
                'lesson plans': 'icon-lessonplans',
                'images': 'icon-images',
                'assessments': 'icon-exercise',
                'simulations': 'icon-simulations',
                'web links': 'icon-links',
                'real world': 'icon-rwa',
                'concept map': 'icon-mindmap',
                'flexbook&#174 textbook': 'icon-book'
        };

		var createGroupList = function (JSNobject) {
			for (var p in JSNobject.modality_groups) {
				groupList.push({'name_modality_group': JSNobject.modality_groups[p].display_text, 'list_of_artifact_type_applicable': JSNobject.modality_groups[p].artifact_types, 'icon_class_name': modalityIcon[JSNobject.modality_groups[p].group_name.toLowerCase()], 'class_name' : JSNobject.modality_groups[p].group_classname});
			}
		}

		function getGroupingData() {
					
					$.ajax({

						url : "/ajax_modality_config",
						type : 'GET',
						dataType : 'json',
						async: false,
						cache: false, 
			        	timeout: 30000,
						success : function(data) { 
							createGroupList(data); 					
						}
					});
		}

		function getPageModalityData(conceptHandle) {
					
					$.ajax({

						url : "/flx/get/minimal/modalities/" + conceptHandle + "?pageSize=1&pageNum=0&ownedBy=ck12&modalities=&level=",
						type : 'GET',
						dataType : 'json',
						async: false,
						cache: false, 
			        	timeout: 30000,
						success : function(data) { 
							createModalityMap(data); 				
						}
					});
		}

		var getGroupType = function (modalityType) {
			for (var i = 0; i < groupList.length; i++) {
				for(var a = 0; a < groupList[i]['list_of_artifact_type_applicable'].length; a++) {
					if(modalityType == groupList[i]['list_of_artifact_type_applicable'][a]) {
						return (groupList[i]); 
					}
				}
			}
            return (groupList[groupList.length-1]);
		}

		var addUpModalities = function () {
			for (var i = 0; i < modalityList.length; i++) {
				var count = 0; 
				var group = getGroupType(modalityList[i]['type']); 
				if (counts[group.class_name]) {
					count = counts[group.class_name].count; 
				}
				counts[group.class_name] = {'count' : count + modalityList[i]['count'], 'group' : group}; 

			}
		} 

		var displayData = function () {


			/*	html += '<table id ="conceptDetailTable" border="1"><tr><td width="30%"><strong>Encoded&nbsp;ID</strong></td><td>' + concept.encodedID + '</td></tr>';
		html += '<tr><td width="30%"><strong>Name</strong></td><td>' + concept.name + '</td></tr>';
		html += '<tr><td width="30%"><strong>Subject</strong></td><td><span id="subjectSpan">' + concept.subject.name + '</span></td></tr>';
		html += '<tr><td width="30%"><strong>Branch</strong></td><td>' + '<a href="javascript:void(0);" id="branchLink" data-encodedID=' + concept.encodedID + '>' + concept.branch.name + '</a></td></tr>';
		html += (parent != null ? '<tr><td width="30%"><strong>Parent</strong></td><td>' + parent + '</a>' : '') + '</td></tr>';
		html += '<tr><td width="30%"><strong>Children</strong></td>';
		html += '<td>' + concept.childCount + '</td></tr>';
		html += '</table>';
		html += '<table id="iconTable" style="display:none"><tr><td><a id="textLink" class="spriteIcons contenttextDisabled"></a></td>';
		html += '<td><a id="videoLink" class="spriteIcons videoDisabled"></a></td>';
		html += '<td><a id="attachmentLink" class="spriteIcons attachmentDisabled"></a></td>';
		html += '<td><a id="interactiveLink" class="spriteIcons interactiveDisabled"></a></td></tr></table>';
		html += '<div style="float:left;"><a id="previousLink" href="javascript:void(0);" data-encodedId=' + concept.encodedID + '>&#60;&#60; Previous</a></div>';
		html += '<div style="float:right;"><a id="nextLink"  href="javascript:void(0);" data-encodedId=' + concept.encodedID + '>&#62;&#62; Next</a></div>';
	*/



			$('#modality_filters_list').empty(); 

			var x = $('#modality_filters_list_tmpl').html(); 
			//	$('#modality_filters_list').append('<table id ="conceptDetailTable" border="1"><tr><td width="30%"><strong>Encoded&nbsp;ID</strong></td><td>@@conceptID@@</td></tr><tr><td width="30%"><strong>Name</strong></td><td>@@conceptName@@</td></tr><tr><td width="30%"><strong>Subject</strong></td><td><span id="subjectSpan">@@conceptSubject@@</span></td></tr><tr><td width="30%"><strong>Branch</strong></td><td><a href="javascript:void(0);" id="branchLink" data-encodedID=@@concept.encodedID@@>@@concept.branch.name@@</a></td></tr><tr><td width="30%"><strong>Children</strong></td><td>@@concept.childCount@@</td></tr></table>');  
            if (concept.branch.handle) {
                var branch_handle = concept.branch.handle;
            } else {
                var branch_handle = concept.branch.name.split(' ').join('-');
            }
			x = x.replace('@@conceptID@@', concept.encodedID).replace('@@conceptName@@', concept.name).replace('@@conceptSubject@@', concept.subject.name).replace('@@concept.encodedID@@', concept.encodedID).replace('@@concept.branch.name@@', concept.branch.name).replace('@@concept.childCount@@', concept.childCount).replace('@@branch@@', branch_handle).replace('@@concept@@', concept.handle);

			$('#modality_filters_list').append(x); 
			
			addUpModalities(); 
			var ticker = 0; 
			for (var i = 0; i < groupList.length; i++) {
				if(counts[groupList[i]['class_name']]) {
					if(ticker == 0) {
						var total_count = 0; 
						$('#modality_filters_list').append('<li style = "margin-bottom: 20px" class="modality_group"><a data-groupname="text" class="lnk_modality_filter group_text" href = "/@@branch@@/@@conceptName@@/?by=ck12#all" target = "_blank"><i class="@@classname@@"></i><span class="group_label"><span>@@group@@</span><br class="show-small"><span>(@@number@@)</span></span></a></li>');
						$('#modality_filters_list').html(function(index, text) {	
							 return text.replace('@@branch@@', concept.branch.name).replace('@@conceptName@@', concept.handle); 
		        		});
						$('#modality_filters_list').html(function(index, text) {	
							for (var a = 0; a < groupList.length; a++) {
								if(counts[groupList[a]['class_name']]) {
									total_count += counts[groupList[a]['class_name']]['count']; 
								}
							}
							ticker++; 																										
		        			return text.replace('@@number@@', total_count).replace('@@group@@', "All").replace('@@classname@@', "icon-lightbulb");
		        		});
					}
					$('#modality_filters_list').append('<li style = "margin-bottom: 20px" class="modality_group"><a data-groupname="text" class="lnk_modality_filter group_text" href = "/@@branch@@/@@conceptName@@/?by=ck12#@@type@@" target = "_blank"><i class="@@classname@@"></i><span class="group_label"><span>@@group@@</span><br class="show-small"><span>(@@number@@)</span></span></a></li>');

					$('#modality_filters_list').html(function(index, text) {	
						console.log(groupList[i]['class_name']); 
						return text.replace('@@branch@@', concept.branch.name).replace('@@conceptName@@', concept.handle).replace('@@type@@', groupList[i]['class_name']); 
		        	});

					//replace values with actual text
					$('#modality_filters_list').html(function(index, text) {	
						var groupInfo = counts[groupList[i]['class_name']]; 																												
		        		return text.replace('@@number@@', groupInfo['count']).replace('@@group@@', groupInfo['group']['name_modality_group']).replace('@@classname@@', groupList[i]['icon_class_name']);
		        	});
				}
			}
			counts = []; 
			total_count = 0; 
			ticker = 0; 

		}

		

		getGroupingData(); 
		getPageModalityData(concept.handle); 
		displayData(); 

		$('#modality_filters_list').css("margin-left", "20px"); 
		$('#modality_filters_list').css("margin-bottom", "20px"); 
		$('#modality_filters_list').removeClass("hide");	
	    $('#modality_filters_list').dialog();
	    $('#modality_filters_list').dialog({ minWidth: 300 });
	    $("#modality_filters_list").dialog({ minHeight: 300 });
	    $('#modality_filters_list').dialog('option', 'position', 'center');
		$('#modality_filters_list').removeClass("hide");
	

		//end of authoring
	}

	/*
	 *  This method re-directs the flow to the concept page
	 */
	function viewConceptMap() {
		var branchValue = $("#branchSel option:selected").val();
		var branch = $("#branchSel option:selected").text();
		if (branchValue == '') {
			$.flxweb.showDialog($.flxweb.gettext("Please select a branch."));
			return;
		}
		for (var i = 0; i < branchWithoutConceptMap.length; i++) {
			if (branchValue == branchWithoutConceptMap[i]) {
				$.flxweb.showDialog($.flxweb.gettext('Concept Map not available for this branch.'));
				return;
			}
		}
        //
        var val = branch.toLowerCase();
        val = val.replace(' ', '-')
		var url = '/browse/' + val + '/#view_map';
		window.open(url);
	}

	/*
	 * This function brings the next concept
	 */
	function getNextConcept() {
		var encodedId = $(this).attr('data-encodedId');
		getAdjacentConcept(encodedId, 'next');
	}

	/*
	 * This function brings the previous concept
	 */
	function getPreviousConcept() {
		var encodedId = $(this).attr('data-encodedId');
		getAdjacentConcept(encodedId, 'previous');
	}

	/*
	 * This function brings the adjacent concept details based on the parameter dir (next or previous)
	 */
	function getAdjacentConcept(conceptId, dir) {
		$.ajax({
			url : taxonomyPrefix + '/get/info/' + dir + '/concepts/' + conceptId + '?pageSize=1',
			type : 'GET',
			dataType : 'json',
			success : function(data) {
				if (data.response.conceptNodes.length == 0) {
					$.flxweb.showDialog($.flxweb.gettext('No ' + dir + ' concept for this node.'));
					return;
				}
				conceptHash.set(data.response.conceptNodes[0].encodedID, data.response.conceptNodes[0]);
				showConceptDetail(data.response.conceptNodes[0].encodedID);
			}
		});
	}

	/*
	 * This function calls the read concept API and generates the corresponding url.
	 */
	function getArtifactText(conceptId, conceptName) {
		var textLink = '';
		if (artifactTextHash.hasKey(conceptId)) {
			if (artifactTextHash.get(conceptId) != "No Link") {
				textLink = artifactTextHash.get(conceptId);
				generateArtifactReadLink(textLink);
				getArtifactVideo(conceptId);
				getArtifactAttachment(conceptId);
				getArtifactExercise(conceptId);
			}
		} else {
			$.ajax({
				url : flxPrefix + '/browse/concept/' + conceptId + '?pageSize=1&Filters=false',
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					if ( conceptId in data.response && data.response.total > 0) {
						var artifacts = data.response[conceptId];
						var artifact = artifacts[0];
						textLink = artifact.artifactType + '/' + artifact.handle;
						if (artifact.realm != null) {
							textLink += '/' + artifact.realm;
						}
						artifactTextHash.set(conceptId, textLink);
						generateArtifactReadLink(textLink, conceptName);
						getArtifactVideo(conceptId, conceptName);
						getArtifactAttachment(conceptId, conceptName);
						getArtifactExercise(conceptId, conceptName);
					} else {
						artifactTextHash.set(conceptId, "No Link");
					}
				}
			});
		}
	}

	/*
	 * This function calls the artifact video API and generates the corresponding url.
	 */
	function getArtifactVideo(conceptId, conceptName) {
		var videoLink = '';
		if (artifactVideoHash.hasKey(conceptId)) {
			if (artifactVideoHash.get(conceptId) != "No Link") {
				videoLink = artifactVideoHash.get(conceptId);
				generateArtifactVideoLink(videoLink);
			}
		} else {
			$.ajax({
				url : flxPrefix + '/get/info/artifact/resources/' + conceptId + '/video%2Ccover%20video%2Cinteractive',
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					if (data.response.resources && data.response.resources.length > 0) {
						videoLink = artifactTextHash.get(conceptId) + '/#view_videos';
						artifactVideoHash.set(conceptId, videoLink);
						generateArtifactVideoLink(videoLink, conceptName);
					} else {
						artifactVideoHash.set(conceptId, "No Link");
					}
				}
			});
		}
	}

	/*
	 * This function calls the artifact attachment API and generates the corresponding url.
	 */
	function getArtifactAttachment(conceptId, conceptName) {
		var attachmentLink = '';
		if (artifactAttachmentHash.hasKey(conceptId)) {
			if (artifactAttachmentHash.get(conceptId) != "No Link") {
				attachmentLink = artifactAttachmentHash.get(conceptId);
				generateArtifactAttachmentLink(attachmentLink);
			}
		} else {
			$.ajax({
				url : flxPrefix + '/get/info/artifact/resources/' + conceptId + '/resource?attachmentsOnly=true',
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					if (data.response.resources && data.response.resources.length > 0) {
						attachmentLink = artifactTextHash.get(conceptId) + '/#view_attachments';
						artifactAttachmentHash.set(conceptId, attachmentLink);
						generateArtifactAttachmentLink(attachmentLink, conceptName);
					} else {
						artifactAttachmentHash.set(conceptId, "No Link");
					}
				}
			});
		}
	}

	/*
	 * This function calls the artifact exercise API and generates the corresponding url.
	 */
	function getArtifactExercise(conceptId, conceptName) {
		var exerciseLink = '';
		if (artifactExerciseHash.hasKey(conceptId)) {
			if (artifactExerciseHash.get(conceptId) != "No Link") {
				exerciseLink = artifactExerciseHash.get(conceptId);
				generateArtifactExerciseLink(exerciseLink);
			}

		} else {
			$.ajax({
				url : '/hwp/get/info/exercise/encodedid/' + conceptId + '.L.1',
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					if (data.response.exercise && data.response.exercise.questions && data.response.exercise.questions.length > 0) {
						exerciseLink = artifactTextHash.get(conceptId) + '/#view_exercises';
						artifactExerciseHash.set(conceptId, exerciseLink);
						generateArtifactExerciseLink(exerciseLink, conceptName);
					} else {
						artifactExerciseHash.set(conceptId, "No Link");
					}
				}
			});
		}
	}

	/*
	 * These four methods generate Artifact read, video, attachment and exercise link respectively.
	 */
	function generateArtifactReadLink(textLink, conceptName) {
		$('a#textLink').removeClass('contenttextDisabled');
		$('a#textLink').addClass('contenttext');
		$('a#textLink').attr('href', '/' + textLink);
		$('a#textLink').attr('target', '_blank');
		$('a#textLink').attr('title', 'Read Concept for ' + conceptName);
	}

	function generateArtifactVideoLink(videoLink, conceptName) {
		$('a#videoLink').removeClass('videoDisabled');
		$('a#videoLink').addClass('video');
		$('a#videoLink').attr('href', '/' + videoLink);
		$('a#videoLink').attr('target', '_blank');
		$('a#videoLink').attr('title', 'Video for ' + conceptName);
	}

	function generateArtifactAttachmentLink(attachmentLink, conceptName) {
		$('a#attachmentLink').removeClass('attachmentDisabled');
		$('a#attachmentLink').addClass('attachment');
		$('a#attachmentLink').attr('href', '/' + attachmentLink);
		$('a#attachmentLink').attr('target', '_blank');
		$('a#attachmentLink').attr('title', 'More Resources for ' + conceptName);
	}

	function generateArtifactExerciseLink(exerciseLink, conceptName) {
		$('a#interactiveLink').removeClass('interactiveDisabled');
		$('a#interactiveLink').addClass('interactive');
		$('a#interactiveLink').attr('href', '/' + exerciseLink);
		$('a#interactiveLink').attr('target', '_blank');
		$('a#interactiveLink').attr('title', 'Exercises for ' + conceptName);
	}

	// calling the main method on page load.
	$(document).ready(main);

});

