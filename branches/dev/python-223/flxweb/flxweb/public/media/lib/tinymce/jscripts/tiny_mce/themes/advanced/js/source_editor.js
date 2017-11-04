function saveContent() {
    'use strict';

    tinyMCEPopup.editor.setContent(document.getElementById('htmlSource').value, {
        source_view: true
    });
    tinyMCEPopup.close();
}

function resizeInputs() {
    'use strict';

    var vp = tinyMCEPopup.dom.getViewPort(window),
        el = document.getElementById('htmlSource');

    if (el) {
        el.style.width = (vp.w - 20) + 'px';
        el.style.height = (vp.h - 65) + 'px';
    }
}

function setWrap(val) {
    'use strict';

    var v, n, s = document.getElementById('htmlSource');

    s.wrap = val;

    if (!tinymce.isIE) {
        v = s.value;
        n = s.cloneNode(false);
        n.setAttribute('wrap', val);
        s.parentNode.replaceChild(n, s);
        n.value = v;
    }
}

function onLoadInit() {
    'use strict';

    tinyMCEPopup.resizeToInnerSize();

    // Remove Gecko spellchecking
    if (tinymce.isGecko) {
        document.body.spellcheck = tinyMCEPopup.editor.getParam('gecko_spellcheck');
    }

    document.getElementById('htmlSource').value = tinyMCEPopup.editor.getContent({
        source_view: true
    });

    if (tinyMCEPopup.editor.getParam('theme_advanced_source_editor_wrap', true)) {
        setWrap('soft');
        document.getElementById('wraped').checked = true;
    }

    resizeInputs();
}

function toggleWordWrap(elm) {
    'use strict';

    if (elm.checked) {
        setWrap('soft');
    } else {
        setWrap('off');
    }
}

tinyMCEPopup.requireLangPack();
tinyMCEPopup.onInit.add(onLoadInit);