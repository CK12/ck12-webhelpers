/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */
/*eslint consistent-this:0 */

tinymce.PluginManager.add('ck12color', function(editor) {
	'use strict';
	var colorsConfig, cols, rows;

	colorsConfig = mapColors();
	rows         = editor.settings.textcolor_rows || 5;
	cols         = editor.settings.textcolor_cols || 8;

    editor.on('init', function() {
        editor.formatter.register('ck12textcolor', {
            inline : 'span',
            classes : 'x-ck12-textcolor-%value'
        });
        editor.formatter.register('ck12highlight', {
            inline : 'span',
            classes : 'x-ck12-textbgcolor-%value'
        });
    });

    editor.addCommand('mceCK12CleanupRosettaColors', function() {
        var dom = editor.dom;
        var spans = dom.select('span');
        if (spans && spans.length) {
            var span, _cn, _c, _fc, _bc, final_cn;
            for (var i = 0; i < spans.length; i++) {
                span = spans[i];
                _bc = '';
                if (span.className && (span.className.indexOf('x-ck12-textcolor') !== -1 || span.className.indexOf('x-ck12-textbgcolor') !== -1)) {
                    _cn = span.className.split(' ');
                    final_cn = [];
                    for (var j = 0; j < _cn.length; j++) {
                        _c = _cn[j];
                        if (_c.indexOf('x-ck12-textcolor') === 0) {
                            _fc = _c;
                        } else if (_c.indexOf('x-ck12-textbgcolor') === 0) {
                            _bc = _c;
                        } else if (_c) {
                            final_cn.push(_c);
                        }
                    }
                    final_cn.push(_fc);
                    final_cn.push(_bc);
                    final_cn = final_cn.join(' ');
                    span.className = final_cn;
                }
            }
        }
    });

    function getColorName(hex) {
    	return colorsConfig.colorsObj[hex] ? colorsConfig.colorsObj[hex] : null;
    }

	function getCurrentColor(format) {
		var color;

		editor.dom.getParents(editor.selection.getStart(), function(elm) {
			var value;

			if ((value = elm.style[format === 'forecolor' ? 'color' : 'background-color'])) {
				color = value;
			}
		});

		return color;
	}

	function mapColors() {
		var globalColors,
			i,
			colors = [],
			colorsObj = {},
			colorMap;

		colorMap = editor.settings.textcolor_map || [
			'000000', 'Black',
			'993300', 'Burnt orange',
			'333300', 'Dark olive',
			'003300', 'Dark green',
			'003366', 'Dark azure',
			'000080', 'Navy Blue',
			'333399', 'Indigo',
			'333333', 'Very dark gray',
			'800000', 'Maroon',
			'FF6600', 'Orange',
			'808000', 'Olive',
			'008000', 'Green',
			'008080', 'Teal',
			'0000FF', 'Blue',
			'666699', 'Grayish blue',
			'808080', 'Gray',
			'FF0000', 'Red',
			'FF9900', 'Amber',
			'99CC00', 'Yellow green',
			'339966', 'Sea green',
			'33CCCC', 'Turquoise',
			'3366FF', 'Royal blue',
			'800080', 'Purple',
			'999999', 'Medium gray',
			'FF00FF', 'Magenta',
			'FFCC00', 'Gold',
			'FFFF00', 'Yellow',
			'00FF00', 'Lime',
			'00FFFF', 'Aqua',
			'00CCFF', 'Sky blue',
			'993366', 'Red violet',
			'FFFFFF', 'White',
			'FF99CC', 'Pink',
			'FFCC99', 'Peach',
			'FFFF99', 'Light yellow',
			'CCFFCC', 'Pale green',
			'CCFFFF', 'Pale cyan',
			'99CCFF', 'Light sky blue',
			'CC99FF', 'Plum'
		];

		for (i = 0; i < colorMap.length; i += 2) {
			colors.push({
				text: colorMap[i + 1],
				color: '#' + colorMap[i]
			});
		}

		for (i = 0; i < colorMap.length; i += 2) {
			colorsObj['#' + colorMap[i]] = colorMap[i + 1];
		}

		globalColors = {
			colorsArray : colors,
			colorsObj   : colorsObj
		};

		return globalColors;
	}

	function renderColorPicker() {
		var ctrl = this, colors, color, html, last, x, y, i, id = ctrl._id, count = 0;

		function getColorCellHtml(color, title) {
			var isNoColor = color == 'transparent';

			return (
				'<td class="mce-grid-cell' + (isNoColor ? ' mce-colorbtn-trans' : '') + '">' +
					'<div id="' + id + '-' + (count++) + '"' +
						' data-mce-color="' + (color ? color : '') + '"' +
						' role="option"' +
						' tabIndex="-1"' +
						' style="' + (color ? 'background-color: ' + color : '') + '"' +
						' title="' + tinymce.translate(title) + '">' +
						(isNoColor ? '&#215;' : '') +
					'</div>' +
				'</td>'
			);
		}

		colors = colorsConfig.colorsArray;

		if( colors[colors.length - 1].color !== 'transparent' ){
			colors.push({
				text: tinymce.translate('No color'),
				color: 'transparent'
			});
		}

		html = '<table class="mce-grid mce-grid-border mce-colorbutton-grid" role="list" cellspacing="0"><tbody>';
		last = colors.length - 1;

		for (y = 0; y < rows; y++) {
			html += '<tr>';

			for (x = 0; x < cols; x++) {
				i = y * cols + x;

				if (i > last) {
					html += '<td></td>';
				} else {
					color = colors[i];
					html += getColorCellHtml(color.color, color.text);
				}
			}

			html += '</tr>';
		}

		if (editor.settings.color_picker_callback) {
			html += (
				'<tr>' +
					'<td colspan="' + cols + '" class="mce-custom-color-btn">' +
						'<div id="' + id + '-c" class="mce-widget mce-btn mce-btn-small mce-btn-flat" ' +
							'role="button" tabindex="-1" aria-labelledby="' + id + '-c" style="width: 100%">' +
							'<button type="button" role="presentation" tabindex="-1">' + tinymce.translate('Custom...') + '</button>' +
						'</div>' +
					'</td>' +
				'</tr>'
			);

			html += '<tr>';

			for (x = 0; x < cols; x++) {
				html += getColorCellHtml('', 'Custom color');
			}

			html += '</tr>';
		}

		html += '</tbody></table>';

		return html;
	}

    function isColoredText(node){
        return /(x-ck12-textcolor|x-ck12-textbgcolor)/g.test(node.className);
    }

	function applyFormat(format, value) {
		var colorName = getColorName(value);
		if (colorName) {
			editor.undoManager.transact(function() {
				editor.focus();
				editor.formatter.apply(format, {value: colorName});
				editor.nodeChanged();
			});
		}
		editor.execCommand('mceCK12CleanupRosettaColors', false);
	}

	function removeFormat(format) {
		var node   = editor.selection.getNode(),
            target = null,
			result;

        if(!isColoredText(node)){
            target = Array.prototype.filter.call(node.children, isColoredText);
            target = target.length ? target[0] : null;
            if(target){ node = target; }
        }

		// We need the previous 'color' in order to actually remove the class and span
		if(format === 'ck12textcolor'){
			result = node.className.trim().split('x-ck12-textcolor-')[1];
		} else if (format === 'ck12highlight'){
			result = node.className.trim().split('x-ck12-textbgcolor-')[1];
			if(!result && (node.nodeName == 'STRONG' || node.nodeName == 'EM')){
				result = node.parentNode.className.trim().split('x-ck12-textbgcolor-')[1];
			}
		}

		editor.undoManager.transact(function() {
			editor.focus();
			editor.formatter.remove(format, {value: result}, target, true);
			editor.nodeChanged();
		});
	}

	function onPanelClick(e) {
		var buttonCtrl = this.parent(), value;

		function selectColor(value) {
			buttonCtrl.hidePanel();
			buttonCtrl.color(value);
			applyFormat(buttonCtrl.settings.format, value);
		}

		function resetColor() {
			buttonCtrl.hidePanel();
			buttonCtrl.resetColor();
			removeFormat(buttonCtrl.settings.format);
		}

		function setDivColor(div, value) {
			div.style.background = value;
			div.setAttribute('data-mce-color', value);
		}

		if (tinymce.DOM.getParent(e.target, '.mce-custom-color-btn')) {
			buttonCtrl.hidePanel();

			editor.settings.color_picker_callback.call(editor, function(value) {
				var tableElm = buttonCtrl.panel.getEl().getElementsByTagName('table')[0];
				var customColorCells, div, i;

				customColorCells = tinymce.map(tableElm.rows[tableElm.rows.length - 1].childNodes, function(elm) {
					return elm.firstChild;
				});

				for (i = 0; i < customColorCells.length; i++) {
					div = customColorCells[i];
					if (!div.getAttribute('data-mce-color')) {
						break;
					}
				}

				// Shift colors to the right
				// TODO: Might need to be the left on RTL
				if (i === cols) {
					for (i = 0; i < cols - 1; i++) {
						setDivColor(customColorCells[i], customColorCells[i + 1].getAttribute('data-mce-color'));
					}
				}

				setDivColor(div, value);
				selectColor(value);
			}, getCurrentColor(buttonCtrl.settings.format));
		}

		value = e.target.getAttribute('data-mce-color');
		if (value) {
			if (this.lastId) {
				document.getElementById(this.lastId).setAttribute('aria-selected', false);
			}

			e.target.setAttribute('aria-selected', true);
			this.lastId = e.target.id;

			if (value === 'transparent') {
				resetColor();
			} else {
				selectColor(value);
			}
		} else if (value !== null) {
			buttonCtrl.hidePanel();
		}
	}

	function onButtonClick() {
		var self = this;

		if (self._color) {
			applyFormat(self.settings.format, self._color);
		} else {
			removeFormat(self.settings.format);
		}
	}

	editor.addButton('ck12textcolor', {
		type: 'colorbutton',
		icon: 'forecolor',
		tooltip: 'Text color',
		format: 'ck12textcolor',
		class : 'mce_forecolor',
		panel: {
			role: 'application',
			ariaRemember: true,
			html: renderColorPicker,
			onclick: onPanelClick
		},
		onclick: onButtonClick
	});

	editor.addButton('ck12highlight', {
		type: 'colorbutton',
		icon: 'backcolor',
		tooltip: 'Highlight color',
		format: 'ck12highlight',
		class : 'mce_backcolor',
		panel: {
			role: 'application',
			ariaRemember: true,
			html: renderColorPicker,
			onclick: onPanelClick
		},
		onclick: onButtonClick
	});
});
