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
 * This file originally written by Chetan Padhye
 * 
 * $Id:
 */

(function($) {
	function onClose() {
		parent.$.colorbox.close();
		return false;
	}

	function onSwitch() {
		var selectedUser = $("#sw_selected_id").val();
		if (!selectedUser || $.trim(selectedUser) == '') {

			return false;
		}

		window.top.location.href = $('#sw_auth_url').val() + selectedUser
				+ "?returnTo=" + $('#sw_returnto').val();
		return false;
	}

	function domReady() {
		Defaults.UIAlreadyBlocked = true;

		$('.js_switchuser').bind('click', onSwitch);
		$('.js_closeswitchuser').bind('click', onClose);
		$("#sw_search_text").autocomplete(
				{
					source : function(request, response) {
						$.getJSON($("#sw_listuser").val(), {
							term : request.term
						}, function(data) {
							response(data.users);
						});
					},
					minLength : 3,
					delay : 500,
					focus : function(event, ui) {
						$("#sw_search_text").val(
								ui.item.firstName + " " + ui.item.lastName
										+ " (" + ui.item.email + ")");
						return false;
					},
					select : function(event, ui) {
						$("#sw_search_text").val(
								ui.item.firstName + " " + ui.item.lastName
										+ " (" + ui.item.email + ")");
						$("#sw_selected_id").val(ui.item.id);
						return false;
					}
				}).data("autocomplete")._renderItem = function(ul, item) {
			return $("<li></li>").data("item.autocomplete", item).append(
					"<a> <img height=25 width=25  src = '/auth/member/image/" + item.id + "/small' />" + item.firstName + " " + item.lastName + "<br>"
							+ "<span style='font-size:10px'><b>Email:</b> "
							+ item.email + " | " + "<b>Username:</b> "
							+ item.login + "</span>" + "</a>").appendTo(ul);
		};

	}

	$(document).ready(domReady);
})(jQuery);