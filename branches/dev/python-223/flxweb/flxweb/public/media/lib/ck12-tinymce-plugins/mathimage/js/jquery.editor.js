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
 * This file originally written by Shanmuga Bala
 *
 * $Id$
 */
/**
 * Returns parent object depending on the browser.
 */

function getWin() {
    return window.dialogArguments || opener || parent || top;
}
var tinymce_local = null;
var exercise_mode = false;
var preExpId = 'math_exp_';
var preContainerId = 'math_container_';
var txtAreaId = 'symbol_input_area';
var className = null;
var blockMathClass = 'x-ck12-block-math';
var inlineMathClass = 'x-ck12-math';
var alignatMathClass = 'x-ck12-hwpmath';
var madePreview = false;
/**
 * Math Editor plugin developed using jQuery.
 */

jQuery.noConflict();

(function (jQuery) { // block scope
    jQuery.extend({
        editor: {}
    });

    jQuery.fn.editor = function (settings) {
        settings = jQuery.extend({
            menuType: "tabbed",
            // tabbed or dropdown
            preview: false,
            // preview button on and off
            classFile: 'default.css'
        });

        return this.each(function () {
            loadMenu();
            loadTabBody();
            // load first category by default
            loadSymbols(arr_categories['commons']["name"], "panel_commons");
            jQuery("#group-tabs").bind('tabsselect', function (e, ui) {
                tabid = "#" + jQuery(ui.panel).attr("id");
                node = jQuery(tabid + " .se-accordion .cat.ui-state-active");
                loadSymbols(node.attr("id"), node.next().attr("id"));
            });
            jQuery("#preview").click(function () {
                preview();
            });

            jQuery("#insert").click(function () {
                insertMathImage();
            });

            jQuery("#reset").click(function () {
                reset();
            });
            jQuery("#cancel").click(function () {
                closeEditorPopup();
            });
            jQuery("#" + txtAreaId).change(function () {
                madePreview = false;
            });
            jQuery('input:radio[name=mode]').change(function () {
                madePreview = false;
            });
            jQuery("#fontstyle").change(function () {
                madePreview = false;
            });
        });

        /**
         * create HTML maps using images
         */

        function createMap(catId) {
            offset = getSymbolOffset(catId);
            total_sym_counter = offset;
            cat = arr_categories[catId];
            image_element = jQuery("#img_" + cat['name'])
            map_name = "map_" + cat['name'];
            area_element_width = parseInt(cat['imgWidth']) + 3;
            area_element_height = parseInt(cat['imgHeight']) + 3;
            symbol_counter = 0;
            var area = '';
            var map = jQuery("<MAP name=\"" + map_name + "\" id=\"" + map_name + "\"></MAP>");
            map.appendTo(jQuery("#imageBlock"));
            // create areas under map. compute co-ordinates
            for (height = 0; height <= (image_element.height() - area_element_height); height += (area_element_height)) {
                for (width = 0; width <= (image_element.width() - area_element_width); width += (area_element_width)) {
                    symbol_counter++;
                    if (symbol_counter > cat['symbolCount']) {
                        break;
                    }

                    top_left = width + "," + height;
                    if (height != 0) top_left = (width) + "," + (height);
                    right_bottom = (width + area_element_width) + "," + (height + area_element_height);
                    coords = top_left + "," + right_bottom;
                    area += "<area id=\"" + total_sym_counter + "\" shape=\"rect\" coords=\"" + coords + "\"" + " title=\"" + symbols_model[total_sym_counter]['name'] + "\" " + " alt=\"" + symbols_model[total_sym_counter]['name'] + "\" " + " href=\"#\"></area>";
                    width += 1;
                    total_sym_counter++;
                }
                height += 1;
            }
            document.getElementById(map_name).innerHTML = area;
            // assign click event to each area map
            for (var i = offset; i < total_sym_counter; i++) {
                jQuery('#' + i).click(function () {
                    clickFunction(this.id);
                    return false;
                });
            }
        }
        /**
         * Load group in form of tab
         */

        function loadMenu() {
            str_tabs = '';
            for (var i = 1; i <= num_group_count; i++) {
                group = arr_groups[i];
                str_tabs += "<li><a href=\"#fragment-" + i + "\" ><span>" + group["name"] + "</span></a></li>";
            }
            jQuery("<ul>" + str_tabs + "</ul>").appendTo(jQuery("#group-tabs"));
        }

        /**
         * Here categories are loaded to each group-tab.
         */

        function loadTabBody() {
            for (var i = 1; i <= num_group_count; i++) {
                group = arr_groups[i];
                // Adding Tab body at the run time.
                tabbody = jQuery("<div style='text-align:left' id='fragment-" + i + "' class='lstOpt'></div>");
                tabbody.appendTo(jQuery("#group-tabs"))

                groupOptions = '';
                // Append accordians to current tab body
                var symbolAccordion = jQuery("<div class='se-accordion'></div>").appendTo(tabbody);

                // Loop over categories and add it to accordian
                for (var j = 0; j < group["categories"].length; j++) {
                    cat = group["categories"][j];
                    category = arr_categories[cat];
                    var node = jQuery("<div></div>");
                    jQuery("<div id='" + category['name'] + "' class='cat'>" + category['label'] + "</div>").appendTo(node);
                    jQuery("<div id='panel_" + category['name'] + "' class='cat-content'></div>").appendTo(node);
                    node.appendTo(symbolAccordion);
                }
                // Intialize & load accordian body with symbols in that category
                symbolAccordion.accordion({
                    header: ".cat",
                    fillSpace: true,
                    change: function (e, ui) {
                        loadSymbols(ui.newHeader.attr("id"), ui.newHeader.next().attr("id"))
                    }
                });
            }
        }

        /**
         * Load symbols as per selected category.
         */

        function loadSymbols(category, intoElem) {
            if (intoElem) {
                jQuery("#imageBlock").appendTo("#" + intoElem)
            }
            cat = arr_categories[category];
            filename = category + str_image_extn;
            jQuery("#imageBlock img").remove();
            jQuery("#imageBlock map").remove();

            map_name = "map_" + cat['name'];
            jQuery("<img name=" + category + " id=img_" + category + " src=\"img/symbol_editor/" + filename + "\" style=\"padding:1px 4px; margin-right:5px; border:0px;\"" + " USEMAP=\"#" + map_name + "\"></img>").appendTo("#imageBlock");

            // Make sure that image is loaded before creating map for it.
            jQuery("#img_" + category).load(function () {
                createMap(cat['name']);
            });
        }

        /**
         * From data model we need to get its offset to compute exact id
         * of symbol.
         */

        function getSymbolOffset(selectedId) {
            return arr_categories[selectedId]['offset'];
        }

        /**
         * Posts request to server to create equation image out of this LaTeX.
         * If equation image is created successfully then it is added to preview
         * else error message will be shown.
         */

        function preview() {
            var expression = document.editorform.symbol_input_area.value;
            if (!validateTex(expression)) return;

            // remove inner elements from div
            resetPreviewPane();
            showHideIndicator(true);

            if(exercise_mode) {
                //expression = expression.replace(/\$/g, '\\$')
                expression = expression.replace(/(\\)?\$/g, function($0,$1){ return $1?$0:'\\$';});
            }

            if (getClassName() == blockMathClass) {
		params = {
                "type": "block",
                "expression": expression
            	};
            } else if (getClassName() == alignatMathClass) {
                params = {
                    "type": "alignat",
                    "expression": expression
                };
            } else {
                params = {
                    "type": "inline",
                    "expression": expression
                };
            } 

            //Try getting image
            jQuery.ajax({
                type: 'POST',
                url: getWin().$.flxweb.settings.math_preview_endpoint,
                data: params,
                success: function (data) {
                    if (data != null && data['status'] == 0) {
                        expression = encodeURIComponent(expression).replace('+', '%2B').replace(/\'/g, '%27');
                        renderPreviewImage(getMathUrl(expression));
                    } else if (data['error'] != null) {
                        var _err = parseMessage(data['error'])
                        reportError("Entered LaTeX Math Equation is invalid.<br/>" + _err + " <br/>Please correct it and try again.");
                    }
                    showHideIndicator(false);
                },
                error: function (xhr, textStatus) {
                    reportError("It's taking too long to process the request<br />The service may be busy. Please try again later.");
                },
                dataType: 'json'
            });
        }

        /**
         * This parses the error message coming from  LaTeX engine.
         */

        function parseMessage(_msg) {
            var re = /\/math\.tex:([0-9]*):([^\\]*)/;
            var err = re.exec(_msg)
            if (err) {
                return "Error: " + err[2]
            }
            return '';
        }

        /**
         * Adds error message to the preview panel.
         */

        function reportError(exception) {
            resetPreviewPane();
            jQuery("<div id='preview-error'>" + exception + "</div> ").appendTo(jQuery("#preview-space"));
        }

        /**
         * Show or hide the busy indicator icon
         */

        function showHideIndicator(show) {
            if (show) jQuery("<img id='preview-icon-loading' src='/media/images/icon_loading.gif'></img>").appendTo(jQuery("#preview-space"));
            else jQuery("#preview-space > img#preview-icon-loading").remove();
        }

        /**
         * Basic validation for TextArea.
         * TODO: extend it to have more complex level validation.
         */

        function validateTex(expression) {
            if (expression == null || jQuery.trim(expression) == '') {
                alert('Please Enter LaTeX Math Equation to preview');
                return false;
            }

            //A division without numerator or denominator is invalid
            if (jQuery.trim(expression) == '/') {
                _err = 'Division / without numerator or denominator is invalid' 
                reportError("Entered LaTeX Math Equation is invalid.<br/>" + _err + " <br/>Please correct it and try again.");
                return false;
            }

            return true;
        }

        /**
         * Posts request to server to create equation image out of this LaTeX.
         * If equation image is created successfully then it is added to
         * ChapterEditor else error message will be shown.
         */

        function insertMathImage() {
            var mathForm = document.editorform;
            var expression = mathForm.symbol_input_area.value;
            // validate input tex expression
            if (!validateTex(expression)) return;

            // remove inner elements from div
            resetPreviewPane();
            showHideIndicator(true);
            if(exercise_mode) {
                //expression = expression.replace(/\$/g, '\\$');
                expression = expression.replace(/(\\)?\$/g, function($0,$1){ return $1?$0:'\\$';});
            }

            if (getClassName() == blockMathClass) {
		params = {
                "type": "block",
                "expression": expression
            	};
            } else if (getClassName() == alignatMathClass) {
                params = {
                    "type": "alignat",
                    "expression": expression
                };
            } else {
                params = {
                    "type": "inline",
                    "expression": expression
                };
            } 

            //If tex expression is not yet previewed
            if (!madePreview) {
                //Try getting image
                jQuery.ajax({
                    type: 'POST',
                    url: getWin().$.flxweb.settings.math_preview_endpoint,
                    data: params, 
                    success: function (data) {
                        if (data != null && data['error'] != null && data['status'] != 0) {
                            var _err = parseMessage(data['error']);
                            reportError("Entered tex is invalid.<br/>" + _err + " <br/>Please correct the tex and try again.");
                        } else {
                            submitAndClose(expression);
                        }
                        showHideIndicator(false);
                    },
                    error: function (xhr, textStatus) {
                        reportError("It's taking too long to process the request<br />The service may be busy. Please try again later.");
                    },
                    dataType: 'json'
                });
            } else {
                submitAndClose(params.expression);
            }
        }

        /*assName = blockMathClass
         * Actually adds/updates image equation to chapter editor.
         * If user is in edit mode then image equation is updated
         * else it is inserted
         */

        function submitAndClose(expression) {
            var t = tinymce_local;
            var ed = t.EditorManager.activeEditor;
            var f = document.forms[0];
            var nl = f.elements;
            var args_img = {};
            var args_span = {};
            var v, el;

            if (!t.isWindow && t.isIE) ed.selection.moveToBookmark(ed.windowManager.bookmark);

            // Fixes crash in Safari
            if (t.isWebKit) ed.getWin().focus();
            // encode math expression
            encodedExp = encodeURIComponent(expression).replace('+', '%2B');

            t.extend(args_img, {
                src: getMathUrl(encodedExp),
                alt: expression
            });
            // Get current selected node in chapter editor if any.
            el = ed.selection.getNode();
            // if element is IMG and represents Math equation then update that image with new one.
            // Else add new IMG element to chapter editor.
            if (el && el.nodeName == 'IMG' && ((ed.dom.getAttrib(el, 'class') == blockMathClass) || (ed.dom.getAttrib(el, 'class') == inlineMathClass) || (ed.dom.getAttrib(el, 'class') == alignatMathClass) )) {
                ed.dom.setAttribs(el, args_img)
                ed.dom.setAttrib(el, 'class', getClassName())
            } else {
                var eleImage = "<img id='__mce_tmp' src='' alt='' class='blockMathClass' />";
                ed.execCommand('mceInsertContent', false, eleImage, {
                    skip_undo: 1
                });
                ed.dom.setAttribs('__mce_tmp', args_img);
                ed.dom.setAttrib('__mce_tmp', 'class', getClassName())
                ed.dom.setAttrib('__mce_tmp', 'id', '');
                ed.undoManager.add();
            }
            madePreview = false;
            closeEditorPopup();
        }

        /**
         * Builds math URL with enocded LaTeX equation.
         */

        function getMathUrl(encodedMath) {
            URL = getWin().$.flxweb.settings.math_endpoint;
            className = getClassName(); 
            if (className == blockMathClass) {
                URL += "block";
            } else if (className == alignatMathClass) {
                URL += "alignat";
            } else {
                URL += "inline";
            }
            return URL + '/' + encodedMath;
        }

        /**
         * when Tiny_MCE Editor popup is closed.
         */

        function closeEditorPopup() {
            var t = tinymce_local;
            var ed = t.EditorManager.activeEditor;
            // To avoid domain relaxing issue in Opera


            function close() {
                ed.windowManager.close(window, ed.windowManager.params['mce_window_id']);
            };
            if (t.isOpera) t.getWin().setTimeout(close, 0);
            else close();
        }
    }
})(jQuery);

/**
 * Click on Symbols get resolved here.
 */

function clickFunction(id) {
    if (symbols_model[id]['isMatrix']) {
        makeMatrix(id);
    } else {
        jQuery(document.editorform.symbol_input_area).replaceSelection(symbols_model[id]['symbol'], true);
        SetSelection(document.editorform.symbol_input_area, document.editorform.symbol_input_area.value.length, 0);
        jQuery(document.editorform.symbol_input_area).focus();
    }
    madePreview = false;
}

/**
 * For Matrices we need special treatment. So first take inputs from user
 * for rows & cols. Then create a matrix depending on the selection with
 * default values.  Ex. Matrix of 3x3 will look like:
 *
 * \begin{vmatrix}
 * a1 & a2 & a3\\
 * b1 & b2 & b3\\
 * c1 & c2 & c3
 * \end{vmatrix}
 */

function makeMatrix(id) {
    var matr = '',
        i = 0;
    var row = "\n";
    var dim = prompt('Enter the array dimensions separated by a comma \n(e.g. "2,3" for 2 rows and 3 columns):', '');
    if (dim !== '' && dim !== null) {
        dim = dim.split(',');
        m = parseInt(dim[0]);
        n = parseInt(dim[1]);
        if (!isNaN(m) && !isNaN(n)) {
            for (i = 0; i < m; i++) {
                charCode = 97 + (i % 26);
                lChar = String.fromCharCode(charCode);
                // initialze to first value
                row = row + lChar + 1;
                for (j = 2; j <= n; j++) {
                    row = row + ' & ' + (lChar + j);
                }
                if (i < m - 1) matr = matr + row + '\\\\\n';
                else {
                    matr = matr + row + '\n';
                }
                row = '';

            }
            matrix_body = symbols_model[id]['symbol']
            matrix_body = matrix_body.replace('$matrix_body', matr);
            // Bug 4846 
            //Default Max column value is 10.For huge Matrices we need to set Max Colunm value.Now value is 20 we can increase.
            if (m >= 11 || n >= 11) {
                matrix_body = "\\setcounter{MaxMatrixCols}{20}" + matrix_body;
            }
            insertText(matrix_body);
        } else makeMatrix(id);
    }
}

/**
 * returns the math equation kept with equation image
 */

function getMathEquation(src, className) {
    uri = getWin().$.flxweb.settings.math_endpoint;
    if (className == blockMathClass) {
         uri += "block/";
    } else if (className == alignatMathClass) {
         uri += "alignat/";
    } else {
         uri += "inline/";
    }

    return src.substring(src.indexOf(uri) + uri.length);
}

/**
 * Resets TextArea and preview space.
 */

function reset() {
    jQuery("#" + txtAreaId).val('');
    resetPreviewPane();
    madePreview = false;
}

/**
 * Sets preview panel to blank
 */

function resetPreviewPane() {
    jQuery("#preview-space").empty();
}

/**
 * Adds preview image to preview panel,
 */

function renderPreviewImage(src) {
    resetPreviewPane();
    jQuery("<img id='preview-image' src='" + src + "'></img>").appendTo(jQuery("#preview-space"));
    madePreview = true;
}

/**
 * If checkbox is set to true then equation is going to be inline. It is
 * unchecked by default.
 */

function getClassName() {
    className = blockMathClass;
    classType = jQuery('input:radio[name=mode]:checked').val();
    if (classType == 'inline') {
         className = inlineMathClass;
    } else if ( classType == 'alignat') {   	
         className = alignatMathClass;
    } else {
         className = blockMathClass;
    }   
    return className;
}

/**
 * Check or uncheck Inline checkbox depending on the selection
 */

function setRadioBox(className) {
    jQuery("input:radio[name='mode']:checked").removeAttr('checked');
    if (className == blockMathClass) { 
        jQuery("#blockmath").attr('checked','checked');
    } else if ( className == alignatMathClass) {
        jQuery("#alignat").attr('checked','checked');
    } else {
        jQuery("#inline").attr('checked','checked');
    }  
}

/**
 * Loads default values of Text area or Preview if Equation is edited.
 */

function loadDefaults() {
    tinymce_local = getWin().tinymce;
    var t = tinymce_local;
    var ed = tinymce_local.EditorManager.activeEditor;
    ed.windowManager.setTitle(window, document.title);
    exercise_mode = ed.windowManager.params.exercise_mode;
    if (tinymce_local.isWebKit) ed.getWin().focus();
    var el = ed.selection.getNode();
    if(!exercise_mode) {
       jQuery("#alignat").next('label').remove();
       jQuery("#alignat").remove();
       jQuery("#inline").attr('checked','checked'); 
    } 	
    className = null;
    if (el && el.nodeName == 'IMG' && ((ed.dom.getAttrib(el, 'class') == blockMathClass) || (ed.dom.getAttrib(el, 'class') == inlineMathClass) || (ed.dom.getAttrib(el, 'class') == alignatMathClass))) {
        className = ed.dom.getAttrib(el, 'class');
        imgSrc = ed.dom.getAttrib(el, 'src');

        enc_exp = getMathEquation(imgSrc, className);
        enc_exp = enc_exp.replace(/\+/g, ' ');

        jQuery("#" + txtAreaId).val(decodeURIComponent(enc_exp));
        renderPreviewImage(imgSrc);
        setRadioBox(className);
    }

}

/**
 * This is to add font styles to LaTeX.
 */

function fontStyleChanged() {
    var size = jQuery('#fontstyle');
    if (size) {
        var options = document.getElementById('fontstyle');
        txt = options.value;
        if (txt && txt != 'blank') {
            var selection = jQuery(document.editorform.symbol_input_area).getSelection();

            if (selection.text != '') {
                txt = "\\" + txt + "{" + selection.text + "}";
            } else {
                txt = "\\" + txt + "{}";
            }
            insertText(txt);
        }
    }
}

/**
 * It inserts/replaces text to the exact cursor location.
 */

function insertText(text) {
    jQuery(document.editorform.symbol_input_area).replaceSelection(text).focus();
    SetSelection(document.editorform.symbol_input_area, document.editorform.symbol_input_area.value.length, 0);
}

/*
 * Sets the text selection in specified text area
 */

function SetSelection(txt, idx, length) {
    if (txt.createTextRange) {
        var range = txt.createTextRange();

        range.collapse(true);
        range.moveStart('character', idx);
        range.moveEnd('character', idx + length);
        range.select();
    } else if (txt.selectionEnd != undefined) {
        txt.selectionStart = idx;
        txt.selectionEnd = idx + length;
    }
}

/**
 * Intializes editor after loading the HTML.
 */
jQuery(document).ready(function () {
    reset();
    jQuery("#doc").editor();
    jQuery('#group-tabs').tabs({
        fxFade: true,
        fxSpeed: 'fast'
    });
    loadDefaults();
});
