/* globals $:false */

var CK12Config = {
    cookie: {
        getItem: function(sKey) {
            if (!sKey) {
                return null;
            }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function(sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) {
                return false;
            }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function(sKey) {
            if (!sKey) {
                return false;
            }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: function() {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
                aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
            }
            return aKeys;
        },
        toggleItem: function(sKey, aValues) {
            if (this.hasItem(sKey) && this.getItem(sKey) === aValues[0].toString()) {
                this.setItem(sKey, aValues[1]);
            } else {
                this.setItem(sKey, aValues[0]);
            }
        }
    },

    isOldTinyMCE: function() {
        return CK12Config.cookie.getItem('mceVersion') === '3';
    },

    tinyMCE3: ['/flxadmin/media/js/lib/tinymce/jscripts/tiny_mce/jquery.tinymce.js', '/flxadmin/media/js/lib/tinymce/jscripts/tiny_mce/tiny_mce.js'],
    tinyMCE4: ['/flxadmin/media/js/lib/tinymce4/js/tinymce/jquery.tinymce.min.js', '/flxadmin/media/js/lib/tinymce4/js/tinymce/tinymce.js'],

    loadTinyMCEScripts: function() {
        var oldVersion = CK12Config.isOldTinyMCE(),
            scripts    = oldVersion ? CK12Config.tinyMCE3 : CK12Config.tinyMCE4;
            poll       = CK12Config.poll;

        function getScript(url, options) {
            options = $.extend(options || {}, {
                dataType: "script",
                cache: true,
                url: url
            });
            return jQuery.ajax(options);
        }

        function loadTinyMCEJQuery() {
            getScript(scripts[0]).done(function() {
                loadTinyMCE();
            });
        }

        function loadTinyMCE() {
            getScript(scripts[1]).done(function(){
                loadTinyMCEConfig();
            });
        }

        function loadTinyMCEConfig() {
            // Setting document_base_url was not working for loading tinymce4, so forcing baseURL to be relative
            if(oldVersion) {
              tinyMCE.baseURL = '/flxadmin/media/js/lib/tinymce/jscripts/tiny_mce';
            } else {
              tinyMCE.baseURL = '/flxadmin/media/js/lib/tinymce4/js/tinymce';
            }

            getScript('/flxadmin/media/js/tinymce.js').done(function(){
              CK12Config.doneLoading = true;
            });

            (function bindSwitchEditorToggle() {
                $('#switchTMCE').on('click', function(e){
                    e.preventDefault();
                    if (window.confirm('Switching the editor will remove any unsaved content. Do you wish to continue?')){
                        if(CK12Config.cookie.getItem('mceVersion') === tinymce.majorVersion){
                            CK12Config.cookie.toggleItem('mceVersion', [3, 4], Infinity, '/');
                        }
                        document.location.reload();
                    }
                });
            })();

        }
        loadTinyMCEJQuery();
    }
};

CK12Config.loadTinyMCEScripts();
