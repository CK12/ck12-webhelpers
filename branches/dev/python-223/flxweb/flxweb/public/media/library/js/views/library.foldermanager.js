define([
    'jquery',
    'library/views/library.filters.folders',
    'library/models/library.label',
    'library/templates/library.templates',
    'common/views/modal.view'
], function($, FoldersFilterView, LibraryLabel, TMPL, ModalView) {
    'use strict';
    var FolderManagerView = FoldersFilterView.extend({
        labelTemplate: TMPL.LABEL_SELECT,
        events: {
            'click #applyLabels': 'applyLabels',
            'click #createLabel': 'createLabel',
            'click #dropdown-label': 'onDropdownClick',
            'change .label-dropdown :checkbox': 'selectLabel'
        },
        render: function() {
            var self;
            self = this;
            this.$el.html(FolderManagerView.template);
            this.onResize();
            $(window).off('resize.library').on('resize.library', function () {
                self.onResize();
            });
            return this;
        },
        onResize: function(){
            if ($(window).width() >= 768) {
                $('#dropdown-label').add('#btn_restore_archived').addClass('button');
            } else {
                $('#dropdown-label').add('#btn_restore_archived').removeClass('button');
            }
        },
        validateLabel: function(label) {
            var reservedLabelsRegex, match, exists;
            if (!label || label === '') {
                ModalView.alert('Label cannot be empty');
                return false;
            }
            // allow labels with letters,spaces and '^[-\w\s]+$'
            if (/[!#$%&'*+\/=?^_`{}\",;.<>].*$/.test(label)) {
                ModalView.alert('Invalid label. A label can contain numbers, letters, spaces and hyphens');
                return false;
            }
            reservedLabelsRegex = /^(archived|all)$/;
            match = reservedLabelsRegex.exec(label.toLowerCase());
            if (match) {
                ModalView.alert('Sorry, you can\'t create a label named "' + match[0] + '". It\'s a reserved system label. Please try another name.');
                return false;
            }

            exists = this.model.find(function(item) {
                return item.get('label').toLowerCase() === label.toLowerCase();
            });
            if (exists !== undefined) {
                ModalView.alert('This label already exists');
                return false;
            }
            return true;
        },
        createLabel: function() {
        	var self, label, options, $labelsList, appliedLabels = [], i;
        	self = this;
            label = $.trim($('#newLabel').val());
            options = {
            	'label' : label,
            	'systemLabel' : 0
            };
            if (this.validateLabel(label)) {
                this.model.createLabel(options).done(function(data) {
                    $.each($('#change_label_container').find(':checkbox:checked'), function() {
                        appliedLabels.push($(this).attr('data-label'));
                    });
                    self.model.add(data.label);
                    for (i = 0; i< appliedLabels.length; i++) {
                        $("input[data-label='" + appliedLabels[i] + "']").trigger('click');
                    }
                    $("input[data-label='" + data.label.label + "']").trigger('click');
                    $("#newLabel").val('');
                    $labelsList = $('#change_label_container').find('.labels-list');
                    $labelsList.scrollTop($labelsList[0].scrollHeight);
                });
            }
        },
        selectLabel: function() {
            $('#applyLabels').removeClass('grey disabled');
        },
        applyLabels: function(e) {
            if (!$(e.currentTarget).hasClass('disabled')) {
            	var systemLabels = [], labels = [], labelObj = {};
            	$.each($('#change_label_container').find(':checkbox:checked'), function() {
            		if ($(this).attr('data-systemLabel') === '1') {
            			systemLabels.push($(this).attr('data-label'));
            		} else {
            			labels.push($(this).attr('data-label'));
            		}
            		labelObj = {
            				'labels' : labels,
            				'systemLabels' : systemLabels
            		};
            	});
            	this.trigger('applyLabels', labelObj);
            }
        },
        onDropdownClick: function() {
        	var i, label, labels = [];
        	$("#newLabel").val('');
        	$('#change_label_container').find(':checkbox').attr('checked', false);
        	if ($('#dropdown-label').hasClass('button-disabled')) {
        		return false;
        	}else {
        		$.each($('#library-items-list').find(':checkbox:checked'), function() {
        			$.each($(this).parents('.js-listitem').find('.js_artifact_labels span'), function() {
        				label = $(this).attr('data-label');
        				if($.inArray(label,labels) === -1) {
        					labels.push(label);
        				}
        			});
        		});
        		if (labels.length) {
        			for (i =0; i< labels.length; i++) {
        				$.each($('#change_label_container').find(':checkbox'), function() {
        					label = $(this).attr('data-label');
        					if (label === labels[i]) {
        						$(this).trigger('click');
        					}
        				});
        			}
        		}
        		$('#applyLabels').addClass('grey disabled');
        	}
        }
    }, {
        template: TMPL.FOLDER_MANAGER
    });
    return FolderManagerView;
});