/**
 * Copyright 2007-2013 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
define(['jquery'], function ($) {
    'use strict';

    function URL(url) {

        var _c = this; //context
        this.protocol = null;
        this.pathname = null;
        this.host = null;
        this.hostname = null;
        this.port = null;
        this.search = null;
        this.hash = null;
        this.href = null;
        this.search_params = {};
        this.hash_params = {};

        function _decodeURIComponent(str){
            var out = decodeURIComponent(str),
                next = out.indexOf('%') === -1 ? decodeURIComponent(out) : out;
            while (out !== next){
                out = next;
                next = decodeURIComponent(out);
            }
            return out;
        }

        function _parseParams(querystring) {
            var i,
                qparr = querystring.split('&'),
                params = {},
                qp = null;
            for (i = 0; i < qparr.length; i++) {
                qp = qparr[i];
                if (qp) {
                    qp = qp.split('=');
                    if (qp.length > 1) {
                        params[_decodeURIComponent(qp[0])] = _decodeURIComponent(qp[1]);
                    }
                }
            }
            return params;
        }

        function _parse_fragments() {
            var _pathname = (_c.pathname || '').toString(),
                _fragments = [];
            if (_pathname.indexOf('/') === 0) {
                _pathname = _pathname.substr(1);
            }
            if (_pathname.lastIndexOf('/') === _pathname.length - 1) {
                _pathname = _pathname.substr(0, _pathname.length - 1);
            }
            _fragments = _pathname.split('/');
            return _fragments;
        }

        function _init() {
            var _url,
                i,
                prop,
                l,
                _specified = true,
                _url_props = ['hash', 'host', 'hostname', 'href', 'pathname', 'port', 'protocol', 'search'];

            l = _url_props.length;
            if (!url) {
                url = window.location.href;
                _specified = false;
            }
            _url = document.createElement('a');
            _url.href = url;
            for (i = 0; i < l; i++) {
                prop = _url_props[i];
                _c[prop] = _url[prop];
            }
            if ( (_c.protocol === ':' || _c.protocol === '') && _c.hostname === '') {
                _url.href = window.location.href;
                _c.protocol = _url.protocol;
                _c.hostname = _url.hostname;
            }

            //handle cases where IE (and in cases, safari) picks port number from the URL even when the url doesn't explicitly specify port
            if (_c.port === '0' || (_c.protocol === 'http:' && _c.port === '80') || (_c.protocol === 'https:' && _c.port === '443')) {
                _c.port = '';
            }

            if (_c.protocol.indexOf('http') !== -1){
                if (_specified && !_c.hostname) {
                    _c.hostname = window.location.hostname;
                    _c.host = window.location.host;
                    _c.port = window.location.port;

                    if (_specified && url.indexOf('/') !== 0 ) { //if not a root-relative URL, and not file protocol
                        _c.pathname = window.location.pathname + _c.pathname;
                    }
                }

                if (_c.pathname.indexOf('/') !== 0) {
                    _c.pathname = '/' + _c.pathname;
                }
            }
            _c.search_params = _parseParams(_c.search.substr(1));
            _c.hash_params = _parseParams(_c.hash.substr(1));
            _c.path_fragments = _parse_fragments();
        }

        function _extend(target, extension) {
            var src, copy, o;
            for (o in extension) {
                if (extension.hasOwnProperty(o)) {
                    src = target[o];
                    copy = extension[o];
                    if (src !== copy && copy !== undefined) {
                        target[o] = copy;
                    }
                }
            }
            return target;
        }

        function _serialize(obj) {
            var p, str = [];
            for (p in obj) {
                if (obj.hasOwnProperty(p) && obj[p]) {
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
            }
            return str.join('&');
        }

        _c.url = function () {
            var _url = _c.protocol + '//' + _c.hostname;
            _url += _c.port ? ':' + _c.port : '';
            _url += _c.pathname.indexOf('/') === 0 ? _c.pathname : '/' + _c.pathname;

            _url += _c.search + _c.hash;

            return _url;
        };

        _c.updateHashParams = function (params) {
            if (params) {
                _c.hash_params = _extend(_c.hash_params, params);
                _c.hash = '#' + _serialize(_c.hash_params);
                _c.href = _c.protocol + '//' + _c.host + _c.pathname + _serialize(_c.search_params) + _c.hash;
            }
            return _c;
        };

        _c.setHash = function (new_hash) {
            _c.hash = new_hash;
            if (_c.hash.indexOf('#') !== 0) {
                _c.hash = '#' + _c.hash;
            }
            _c.hash_params = _parseParams(_c.hash.substr(1));
            return _c;
        };

        _c.updateSearchParams = function (params) {
            var _search;
            if (params) {
                _c.search_params = $.extend(_c.search_params, params);
                _search = '?' + _serialize(_c.search_params);
                if (_search !== '?') {
                    _c.search = _search;
                } else {
                    _c.search = '';
                }
            }
            return _c;
        };

        _c.setSearch = function (new_hash) {
            _c.search = new_hash;
            if (_c.search.indexOf('?') !== 0) {
                _c.search = '?' + _c.search;
            }
            _c.search_params = _parseParams(_c.search.substr(1));
            return _c;
        };

        _init();
    }

    return URL;
});
