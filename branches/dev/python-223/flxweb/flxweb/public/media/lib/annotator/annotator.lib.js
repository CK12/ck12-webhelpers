!function(window) {
    var $, Util, gettext, _gettext, _ref, _t;
    gettext = null, "undefined" != typeof Gettext && null !== Gettext ? (_gettext = new Gettext({
        domain: "annotator"
    }), gettext = function(msgid) {
        return _gettext.gettext(msgid);
    }) : gettext = function(msgid) {
        return msgid;
    }, _t = function(msgid) {
        return gettext(msgid);
    }, ("undefined" != typeof jQuery && null !== jQuery && null != (_ref = jQuery.fn) ? _ref.jquery : void 0) || console.error(_t("Annotator requires jQuery: have you included lib/vendor/jquery.js?")), 
    JSON && JSON.parse && JSON.stringify || console.error(_t("Annotator requires a JSON implementation: have you included lib/vendor/json2.js?")), 
    $ = jQuery, Util = {}, Util.flatten = function(array) {
        var flatten;
        return (flatten = function(ary) {
            var el, flat, _i, _len;
            for (flat = [], _i = 0, _len = ary.length; _i < _len; _i++) el = ary[_i], flat = flat.concat(el && $.isArray(el) ? flatten(el) : el);
            return flat;
        })(array);
    }, Util.contains = function(parent, child) {
        var node;
        for (node = child; null != node; ) {
            if (node === parent) return !0;
            node = node.parentNode;
        }
        return !1;
    }, Util.getTextNodes = function(jq) {
        var getTextNodes;
        return getTextNodes = function(node) {
            var nodes;
            if (node && node.nodeType !== Node.TEXT_NODE) {
                if (nodes = [], node.nodeType !== Node.COMMENT_NODE) for (node = node.lastChild; node; ) nodes.push(getTextNodes(node)), 
                node = node.previousSibling;
                return nodes.reverse();
            }
            return node;
        }, jq.map(function() {
            return Util.flatten(getTextNodes(this));
        });
    }, Util.getLastTextNodeUpTo = function(n) {
        var result;
        switch (n.nodeType) {
          case Node.TEXT_NODE:
            return n;

          case Node.ELEMENT_NODE:
            if (null != n.lastChild && (result = Util.getLastTextNodeUpTo(n.lastChild), null != result)) return result;
        }
        return n = n.previousSibling, null != n ? Util.getLastTextNodeUpTo(n) : null;
    }, Util.getFirstTextNodeNotBefore = function(n) {
        var result;
        switch (n.nodeType) {
          case Node.TEXT_NODE:
            return n;

          case Node.ELEMENT_NODE:
            if (null != n.firstChild && (result = Util.getFirstTextNodeNotBefore(n.firstChild), 
            null != result)) return result;
        }
        return n = n.nextSibling, null != n ? Util.getFirstTextNodeNotBefore(n) : null;
    }, Util.readRangeViaSelection = function(range) {
        var sel;
        return sel = Util.getGlobal().getSelection(), sel.removeAllRanges(), sel.addRange(range.toRange()), 
        sel.toString();
    }, Util.xpathFromNode = function(el, relativeRoot) {
        var exception, result;
        try {
            result = simpleXPathJQuery.call(el, relativeRoot);
        } catch (_error) {
            exception = _error, console.log("jQuery-based XPath construction failed! Falling back to manual."), 
            result = simpleXPathPure.call(el, relativeRoot);
        }
        return result;
    }, Util.nodeFromXPath = function(xp, root) {
        var idx, name, node, step, steps, _i, _len, _ref1;
        for (steps = xp.substring(1).split("/"), node = root, _i = 0, _len = steps.length; _i < _len; _i++) step = steps[_i], 
        _ref1 = step.split("["), name = _ref1[0], idx = _ref1[1], idx = null != idx ? parseInt((null != idx ? idx.split("]") : void 0)[0]) : 1, 
        node = findChild(node, name.toLowerCase(), idx);
        return node;
    }, Util.escape = function(html) {
        return html.replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }, Util.uuid = function() {
        var counter;
        return counter = 0, function() {
            return counter++;
        };
    }(), Util.getGlobal = function() {
        return function() {
            return this;
        }();
    }, Util.maxZIndex = function($elements) {
        var all, el;
        return all = function() {
            var _i, _len, _results;
            for (_results = [], _i = 0, _len = $elements.length; _i < _len; _i++) el = $elements[_i], 
            "static" === $(el).css("position") ? _results.push(-1) : _results.push(parseFloat($(el).css("z-index")) || -1);
            return _results;
        }(), Math.max.apply(Math, all);
    }, Util.mousePosition = function(e, offsetEl) {
        var offset, _ref1;
        return "absolute" !== (_ref1 = $(offsetEl).css("position")) && "fixed" !== _ref1 && "relative" !== _ref1 && (offsetEl = $(offsetEl).offsetParent()[0]), 
        offset = $(offsetEl).offset(), {
            top: e.pageY - offset.top,
            left: e.pageX - offset.left
        };
    }, Util.preventEventDefault = function(event) {
        return null != event && "function" == typeof event.preventDefault ? event.preventDefault() : void 0;
    };
    var fn, functions, _i, _j, _len, _len1, __slice = [].slice;
    if (functions = [ "log", "debug", "info", "warn", "exception", "assert", "dir", "dirxml", "trace", "group", "groupEnd", "groupCollapsed", "time", "timeEnd", "profile", "profileEnd", "count", "clear", "table", "error", "notifyFirebug", "firebug", "userObjects" ], 
    "undefined" != typeof console && null !== console) for (null == console.group && (console.group = function(name) {
        return console.log("GROUP: ", name);
    }), null == console.groupCollapsed && (console.groupCollapsed = console.group), 
    _i = 0, _len = functions.length; _i < _len; _i++) fn = functions[_i], null == console[fn] && (console[fn] = function() {
        return console.log(_t("Not implemented:") + (" console." + name));
    }); else {
        for (this.console = {}, _j = 0, _len1 = functions.length; _j < _len1; _j++) fn = functions[_j], 
        this.console[fn] = function() {};
        this.console.error = function() {
            var args;
            return args = 1 <= arguments.length ? __slice.call(arguments, 0) : [], alert("ERROR: " + args.join(", "));
        }, this.console.warn = function() {
            var args;
            return args = 1 <= arguments.length ? __slice.call(arguments, 0) : [], alert("WARNING: " + args.join(", "));
        };
    }
    var Delegator, __slice = [].slice, __hasProp = {}.hasOwnProperty;
    Delegator = function() {
        function Delegator(element, options) {
            this.options = $.extend(!0, {}, this.options, options), this.element = $(element), 
            this._closures = {}, this.on = this.subscribe, this.addEvents();
        }
        return Delegator.prototype.events = {}, Delegator.prototype.options = {}, Delegator.prototype.element = null, 
        Delegator.prototype.destroy = function() {
            return this.removeEvents();
        }, Delegator.prototype.addEvents = function() {
            var event, _i, _len, _ref, _results;
            for (_ref = Delegator._parseEvents(this.events), _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) event = _ref[_i], 
            _results.push(this._addEvent(event.selector, event.event, event.functionName));
            return _results;
        }, Delegator.prototype.removeEvents = function() {
            var event, _i, _len, _ref, _results;
            for (_ref = Delegator._parseEvents(this.events), _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) event = _ref[_i], 
            _results.push(this._removeEvent(event.selector, event.event, event.functionName));
            return _results;
        }, Delegator.prototype._addEvent = function(selector, event, functionName) {
            var closure;
            return closure = function(_this) {
                return function() {
                    return _this[functionName].apply(_this, arguments);
                };
            }(this), "" === selector && Delegator._isCustomEvent(event) ? this.subscribe(event, closure) : this.element.delegate(selector, event, closure), 
            this._closures["" + selector + "/" + event + "/" + functionName] = closure, this;
        }, Delegator.prototype._removeEvent = function(selector, event, functionName) {
            var closure;
            return closure = this._closures["" + selector + "/" + event + "/" + functionName], 
            "" === selector && Delegator._isCustomEvent(event) ? this.unsubscribe(event, closure) : this.element.undelegate(selector, event, closure), 
            delete this._closures["" + selector + "/" + event + "/" + functionName], this;
        }, Delegator.prototype.publish = function() {
            return this.element.triggerHandler.apply(this.element, arguments), this;
        }, Delegator.prototype.subscribe = function(event, callback) {
            var closure;
            return closure = function() {
                return callback.apply(this, [].slice.call(arguments, 1));
            }, closure.guid = callback.guid = $.guid += 1, this.element.bind(event, closure), 
            this;
        }, Delegator.prototype.unsubscribe = function() {
            return this.element.unbind.apply(this.element, arguments), this;
        }, Delegator;
    }(), Delegator._parseEvents = function(eventsObj) {
        var event, events, functionName, sel, selector, _i, _ref;
        events = [];
        for (sel in eventsObj) functionName = eventsObj[sel], _ref = sel.split(" "), selector = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, 
        []), event = _ref[_i++], events.push({
            selector: selector.join(" "),
            event: event,
            functionName: functionName
        });
        return events;
    }, Delegator.natives = function() {
        var key, specials, val;
        return specials = function() {
            var _ref, _results;
            _ref = jQuery.event.special, _results = [];
            for (key in _ref) __hasProp.call(_ref, key) && (val = _ref[key], _results.push(key));
            return _results;
        }(), "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/).concat(specials);
    }(), Delegator._isCustomEvent = function(event) {
        return event = event.split(".")[0], $.inArray(event, Delegator.natives) === -1;
    };
    var Range, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    };
    Range = {}, Range.sniff = function(r) {
        return null != r.commonAncestorContainer ? new Range.BrowserRange(r) : "string" == typeof r.start ? new Range.SerializedRange(r) : r.start && "object" == typeof r.start ? new Range.NormalizedRange(r) : (console.error(_t("Could not sniff range type")), 
        !1);
    }, Range.nodeFromXPath = function(xpath, root) {
        var customResolver, evaluateXPath, namespace, node, segment;
        return null == root && (root = document), evaluateXPath = function(xp, nsResolver) {
            var exception;
            null == nsResolver && (nsResolver = null);
            try {
                return document.evaluate("." + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            } catch (_error) {
                return exception = _error, console.log("XPath evaluation failed."), console.log("Trying fallback..."), 
                Util.nodeFromXPath(xp, root);
            }
        }, $.isXMLDoc(document.documentElement) ? (customResolver = document.createNSResolver(null === document.ownerDocument ? document.documentElement : document.ownerDocument.documentElement), 
        node = evaluateXPath(xpath, customResolver), node || (xpath = function() {
            var _i, _len, _ref, _results;
            for (_ref = xpath.split("/"), _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) segment = _ref[_i], 
            segment && segment.indexOf(":") === -1 ? _results.push(segment.replace(/^([a-z]+)/, "xhtml:$1")) : _results.push(segment);
            return _results;
        }().join("/"), namespace = document.lookupNamespaceURI(null), customResolver = function(ns) {
            return "xhtml" === ns ? namespace : document.documentElement.getAttribute("xmlns:" + ns);
        }, node = evaluateXPath(xpath, customResolver)), node) : evaluateXPath(xpath);
    }, Range.RangeError = function(_super) {
        function RangeError(type, message, parent) {
            this.type = type, this.message = message, this.parent = null != parent ? parent : null, 
            RangeError.__super__.constructor.call(this, this.message);
        }
        return __extends(RangeError, _super), RangeError;
    }(Error), Range.BrowserRange = function() {
        function BrowserRange(obj) {
            this.commonAncestorContainer = obj.commonAncestorContainer, this.startContainer = obj.startContainer, 
            this.startOffset = obj.startOffset, this.endContainer = obj.endContainer, this.endOffset = obj.endOffset;
        }
        return BrowserRange.prototype.normalize = function(root) {
            var n, node, nr, r;
            if (this.tainted) return console.error(_t("You may only call normalize() once on a BrowserRange!")), 
            !1;
            if (this.tainted = !0, r = {}, this.startContainer.nodeType === Node.ELEMENT_NODE ? (r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]), 
            r.startOffset = 0) : (r.start = this.startContainer, r.startOffset = this.startOffset), 
            this.endContainer.nodeType === Node.ELEMENT_NODE) {
                if (node = this.endContainer.childNodes[this.endOffset], null != node) {
                    for (n = node; null != n && n.nodeType !== Node.TEXT_NODE; ) n = n.firstChild;
                    null != n && (r.end = n, r.endOffset = 0);
                }
                null == r.end && (node = this.endContainer.childNodes[this.endOffset - 1], r.end = Util.getLastTextNodeUpTo(node), 
                r.endOffset = r.end.nodeValue.length);
            } else r.end = this.endContainer, r.endOffset = this.endOffset;
            for (nr = {}, r.startOffset > 0 ? r.start.nodeValue.length > r.startOffset ? nr.start = r.start.splitText(r.startOffset) : nr.start = r.start.nextSibling : nr.start = r.start, 
            r.start === r.end ? (nr.start.nodeValue.length > r.endOffset - r.startOffset && nr.start.splitText(r.endOffset - r.startOffset), 
            nr.end = nr.start) : (r.end.nodeValue.length > r.endOffset && r.end.splitText(r.endOffset), 
            nr.end = r.end), nr.commonAncestor = this.commonAncestorContainer; nr.commonAncestor.nodeType !== Node.ELEMENT_NODE; ) nr.commonAncestor = nr.commonAncestor.parentNode;
            return new Range.NormalizedRange(nr);
        }, BrowserRange.prototype.serialize = function(root, ignoreSelector) {
            return this.normalize(root).serialize(root, ignoreSelector);
        }, BrowserRange;
    }(), Range.NormalizedRange = function() {
        function NormalizedRange(obj) {
            this.commonAncestor = obj.commonAncestor, this.start = obj.start, this.end = obj.end;
        }
        return NormalizedRange.prototype.normalize = function(root) {
            return this;
        }, NormalizedRange.prototype.limit = function(bounds) {
            var nodes, parent, startParents, _i, _len, _ref;
            if (nodes = $.grep(this.textNodes(), function(node) {
                return node.parentNode === bounds || $.contains(bounds, node.parentNode);
            }), !nodes.length) return null;
            for (this.start = nodes[0], this.end = nodes[nodes.length - 1], startParents = $(this.start).parents(), 
            _ref = $(this.end).parents(), _i = 0, _len = _ref.length; _i < _len; _i++) if (parent = _ref[_i], 
            startParents.index(parent) !== -1) {
                this.commonAncestor = parent;
                break;
            }
            return this;
        }, NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
            var end, serialization, start;
            return serialization = function(node, isEnd) {
                var n, nodes, offset, origParent, textNodes, xpath, _i, _len;
                for (origParent = ignoreSelector ? $(node).parents(":not(" + ignoreSelector + ")").eq(0) : $(node).parent(), 
                xpath = Util.xpathFromNode(origParent, root)[0], textNodes = Util.getTextNodes(origParent), 
                nodes = textNodes.slice(0, textNodes.index(node)), offset = 0, _i = 0, _len = nodes.length; _i < _len; _i++) n = nodes[_i], 
                offset += n.nodeValue.length;
                return isEnd ? [ xpath, offset + node.nodeValue.length ] : [ xpath, offset ];
            }, start = serialization(this.start), end = serialization(this.end, !0), new Range.SerializedRange({
                start: start[0],
                end: end[0],
                startOffset: start[1],
                endOffset: end[1]
            });
        }, NormalizedRange.prototype.text = function() {
            var node;
            return function() {
                var _i, _len, _ref, _results;
                for (_ref = this.textNodes(), _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) node = _ref[_i], 
                _results.push(node.nodeValue);
                return _results;
            }.call(this).join("");
        }, NormalizedRange.prototype.textNodes = function() {
            var end, start, textNodes, _ref;
            return textNodes = Util.getTextNodes($(this.commonAncestor)), _ref = [ textNodes.index(this.start), textNodes.index(this.end) ], 
            start = _ref[0], end = _ref[1], $.makeArray(textNodes.slice(start, +end + 1 || 9e9));
        }, NormalizedRange.prototype.toRange = function() {
            var range;
            return range = document.createRange(), range.setStartBefore(this.start), range.setEndAfter(this.end), 
            range;
        }, NormalizedRange;
    }(), Range.SerializedRange = function() {
        function SerializedRange(obj) {
            this.start = obj.start, this.startOffset = obj.startOffset, this.end = obj.end, 
            this.endOffset = obj.endOffset;
        }
        return SerializedRange.prototype.normalize = function(root) {
            var contains, e, length, node, p, range, targetOffset, tn, _i, _j, _len, _len1, _ref, _ref1;
            for (range = {}, _ref = [ "start", "end" ], _i = 0, _len = _ref.length; _i < _len; _i++) {
                p = _ref[_i];
                try {
                    node = Range.nodeFromXPath(this[p], root);
                } catch (_error) {
                    throw e = _error, new Range.RangeError(p, "Error while finding " + p + " node: " + this[p] + ": " + e, e);
                }
                if (!node) throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p]);
                for (length = 0, targetOffset = this[p + "Offset"], "end" === p && targetOffset--, 
                _ref1 = Util.getTextNodes($(node)), _j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    if (tn = _ref1[_j], length + tn.nodeValue.length > targetOffset) {
                        range[p + "Container"] = tn, range[p + "Offset"] = this[p + "Offset"] - length;
                        break;
                    }
                    length += tn.nodeValue.length;
                }
                if (null == range[p + "Offset"]) throw new Range.RangeError("" + p + "offset", "Couldn't find offset " + this[p + "Offset"] + " in element " + this[p]);
            }
            return contains = null == document.compareDocumentPosition ? function(a, b) {
                return a.contains(b);
            } : function(a, b) {
                return 16 & a.compareDocumentPosition(b);
            }, $(range.startContainer).parents().each(function() {
                if (contains(this, range.endContainer)) return range.commonAncestorContainer = this, 
                !1;
            }), new Range.BrowserRange(range).normalize(root);
        }, SerializedRange.prototype.serialize = function(root, ignoreSelector) {
            return this.normalize(root).serialize(root, ignoreSelector);
        }, SerializedRange.prototype.toObject = function() {
            return {
                start: this.start,
                startOffset: this.startOffset,
                end: this.end,
                endOffset: this.endOffset
            };
        }, SerializedRange;
    }();
    var Annotator, g, _Annotator, _ref, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    };
    _Annotator = this.Annotator, Annotator = function(_super) {
        function Annotator(element, options) {
            return this.onDeleteAnnotation = __bind(this.onDeleteAnnotation, this), this.onEditAnnotation = __bind(this.onEditAnnotation, this), 
            this.onAdderClick = __bind(this.onAdderClick, this), this.onAdderMousedown = __bind(this.onAdderMousedown, this), 
            this.onHighlightMouseover = __bind(this.onHighlightMouseover, this), this.checkForEndSelection = __bind(this.checkForEndSelection, this), 
            this.checkForStartSelection = __bind(this.checkForStartSelection, this), this.clearViewerHideTimer = __bind(this.clearViewerHideTimer, this), 
            this.startViewerHideTimer = __bind(this.startViewerHideTimer, this), this.showViewer = __bind(this.showViewer, this), 
            this.onEditorSubmit = __bind(this.onEditorSubmit, this), this.onEditorHide = __bind(this.onEditorHide, this), 
            this.showEditor = __bind(this.showEditor, this), Annotator.__super__.constructor.apply(this, arguments), 
            this.plugins = {}, Annotator.supported() ? (this.options.readOnly || this._setupDocumentEvents(), 
            this._setupWrapper()._setupViewer()._setupEditor(), this._setupDynamicStyle(), this.adder = $(this.html.adder).appendTo(this.wrapper).hide(), 
            void Annotator._instances.push(this)) : this;
        }
        return __extends(Annotator, _super), Annotator.prototype.events = {
            ".annotator-adder button click": "onAdderClick",
            ".annotator-adder button mousedown": "onAdderMousedown",
            ".annotator-hl mouseover": "onHighlightMouseover",
            ".annotator-hl mouseout": "startViewerHideTimer"
        }, Annotator.prototype.html = {
            adder: '<div class="annotator-adder"><button>' + _t("Annotate") + "</button></div>",
            wrapper: '<div class="annotator-wrapper"></div>'
        }, Annotator.prototype.options = {
            readOnly: !1
        }, Annotator.prototype.plugins = {}, Annotator.prototype.editor = null, Annotator.prototype.viewer = null, 
        Annotator.prototype.selectedRanges = null, Annotator.prototype.mouseIsDown = !1, 
        Annotator.prototype.ignoreMouseup = !1, Annotator.prototype.viewerHideTimer = null, 
        Annotator.prototype._setupWrapper = function() {
            return this.wrapper = $(this.html.wrapper), this.element.find("script").remove(), 
            this.element.wrapInner(this.wrapper), this.wrapper = this.element.find(".annotator-wrapper"), 
            this;
        }, Annotator.prototype._setupViewer = function() {
            return this.viewer = new Annotator.Viewer({
                readOnly: this.options.readOnly
            }), this.viewer.hide().on("edit", this.onEditAnnotation).on("delete", this.onDeleteAnnotation).addField({
                load: function(_this) {
                    return function(field, annotation) {
                        return annotation.text ? $(field).html(Util.escape(annotation.text)) : $(field).html("<i>" + _t("No Comment") + "</i>"), 
                        _this.publish("annotationViewerTextField", [ field, annotation ]);
                    };
                }(this)
            }).element.appendTo(this.wrapper).bind({
                mouseover: this.clearViewerHideTimer,
                mouseout: this.startViewerHideTimer
            }), this;
        }, Annotator.prototype._setupEditor = function() {
            return this.editor = new Annotator.Editor(), this.editor.hide().on("hide", this.onEditorHide).on("save", this.onEditorSubmit).addField({
                type: "textarea",
                label: _t("Comments") + "…",
                load: function(field, annotation) {
                    return $(field).find("textarea").val(annotation.text || "");
                },
                submit: function(field, annotation) {
                    return annotation.text = $(field).find("textarea").val();
                }
            }), this.editor.element.appendTo(this.wrapper), this;
        }, Annotator.prototype._setupDocumentEvents = function() {
            return $(document).bind({
                mouseup: this.checkForEndSelection,
                mousedown: this.checkForStartSelection
            }), this;
        }, Annotator.prototype._setupDynamicStyle = function() {
            var max, sel, style, x;
            return style = $("#annotator-dynamic-style"), style.length || (style = $('<style id="annotator-dynamic-style"></style>').appendTo(document.head)), 
            sel = "*" + function() {
                var _i, _len, _ref, _results;
                for (_ref = [ "adder", "outer", "notice", "filter" ], _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) x = _ref[_i], 
                _results.push(":not(.annotator-" + x + ")");
                return _results;
            }().join(""), max = Util.maxZIndex($(document.body).find(sel)), max = Math.max(max, 1e3), 
            style.text([ ".annotator-adder, .annotator-outer, .annotator-notice {", "  z-index: " + (max + 20) + ";", "}", ".annotator-filter {", "  z-index: " + (max + 10) + ";", "}" ].join("\n")), 
            this;
        }, Annotator.prototype.destroy = function() {
            var idx, name, plugin, _base, _ref;
            Annotator.__super__.destroy.apply(this, arguments), $(document).unbind({
                mouseup: this.checkForEndSelection,
                mousedown: this.checkForStartSelection
            }), $("#annotator-dynamic-style").remove(), this.adder.remove(), this.viewer.destroy(), 
            this.editor.destroy(), this.wrapper.find(".annotator-hl").each(function() {
                return $(this).contents().insertBefore(this), $(this).remove();
            }), this.wrapper.contents().insertBefore(this.wrapper), this.wrapper.remove(), this.element.data("annotator", null), 
            _ref = this.plugins;
            for (name in _ref) plugin = _ref[name], "function" == typeof (_base = this.plugins[name]).destroy && _base.destroy();
            if (idx = Annotator._instances.indexOf(this), idx !== -1) return Annotator._instances.splice(idx, 1);
        }, Annotator.prototype.getSelectedRanges = function() {
            var browserRange, i, normedRange, r, ranges, rangesToIgnore, selection, _i, _len;
            for (selection = Util.getGlobal().getSelection(), ranges = [], rangesToIgnore = [], 
            selection.isCollapsed || (ranges = function() {
                var _i, _ref, _results;
                for (_results = [], i = _i = 0, _ref = selection.rangeCount; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) r = selection.getRangeAt(i), 
                browserRange = new Range.BrowserRange(r), normedRange = browserRange.normalize().limit(this.wrapper[0]), 
                null === normedRange && rangesToIgnore.push(r), _results.push(normedRange);
                return _results;
            }.call(this), selection.removeAllRanges()), _i = 0, _len = rangesToIgnore.length; _i < _len; _i++) r = rangesToIgnore[_i], 
            selection.addRange(r);
            return $.grep(ranges, function(range) {
                return range && selection.addRange(range.toRange()), range;
            });
        }, Annotator.prototype.createAnnotation = function() {
            var annotation;
            return annotation = {}, this.publish("beforeAnnotationCreated", [ annotation ]), 
            annotation;
        }, Annotator.prototype.setupAnnotation = function(annotation) {
            var e, normed, normedRanges, r, root, _i, _j, _len, _len1, _ref;
            for (root = this.wrapper[0], annotation.ranges || (annotation.ranges = this.selectedRanges), 
            normedRanges = [], _ref = annotation.ranges, _i = 0, _len = _ref.length; _i < _len; _i++) {
                r = _ref[_i];
                try {
                    normedRanges.push(Range.sniff(r).normalize(root));
                } catch (_error) {
                    if (e = _error, !(e instanceof Range.RangeError)) throw e;
                    this.publish("rangeNormalizeFail", [ annotation, r, e ]);
                }
            }
            for (annotation.quote = [], annotation.ranges = [], annotation.highlights = [], 
            _j = 0, _len1 = normedRanges.length; _j < _len1; _j++) normed = normedRanges[_j], 
            annotation.quote.push($.trim(normed.text())), annotation.ranges.push(normed.serialize(this.wrapper[0], ".annotator-hl")), 
            $.merge(annotation.highlights, this.highlightRange(normed));
            return annotation.quote = annotation.quote.join(" / "), $(annotation.highlights).data("annotation", annotation), 
            $(annotation.highlights).attr("data-annotation-id", annotation.id), annotation;
        }, Annotator.prototype.updateAnnotation = function(annotation) {
            return this.publish("beforeAnnotationUpdated", [ annotation ]), $(annotation.highlights).attr("data-annotation-id", annotation.id), 
            this.publish("annotationUpdated", [ annotation ]), annotation;
        }, Annotator.prototype.deleteAnnotation = function(annotation) {
            var child, h, _i, _len, _ref;
            if (null != annotation.highlights) for (_ref = annotation.highlights, _i = 0, _len = _ref.length; _i < _len; _i++) h = _ref[_i], 
            null != h.parentNode && (child = h.childNodes[0], $(h).replaceWith(h.childNodes));
            return this.publish("annotationDeleted", [ annotation ]), annotation;
        }, Annotator.prototype.loadAnnotations = function(annotations) {
            var clone, loader;
            return null == annotations && (annotations = []), loader = function(_this) {
                return function(annList) {
                    var n, now, _i, _len;
                    for (null == annList && (annList = []), now = annList.splice(0, 10), _i = 0, _len = now.length; _i < _len; _i++) n = now[_i], 
                    _this.setupAnnotation(n);
                    return annList.length > 0 ? setTimeout(function() {
                        return loader(annList);
                    }, 10) : _this.publish("annotationsLoaded", [ clone ]);
                };
            }(this), clone = annotations.slice(), loader(annotations), this;
        }, Annotator.prototype.dumpAnnotations = function() {
            return this.plugins.Store ? this.plugins.Store.dumpAnnotations() : (console.warn(_t("Can't dump annotations without Store plugin.")), 
            !1);
        }, Annotator.prototype.highlightRange = function(normedRange, cssClass) {
            var hl, node, white, _i, _len, _ref, _results;
            for (null == cssClass && (cssClass = "annotator-hl"), white = /^\s*$/, hl = $("<span class='" + cssClass + "'></span>"), 
            _ref = normedRange.textNodes(), _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) node = _ref[_i], 
            white.test(node.nodeValue) || _results.push($(node).wrapAll(hl).parent().show()[0]);
            return _results;
        }, Annotator.prototype.highlightRanges = function(normedRanges, cssClass) {
            var highlights, r, _i, _len;
            for (null == cssClass && (cssClass = "annotator-hl"), highlights = [], _i = 0, _len = normedRanges.length; _i < _len; _i++) r = normedRanges[_i], 
            $.merge(highlights, this.highlightRange(r, cssClass));
            return highlights;
        }, Annotator.prototype.addPlugin = function(name, options) {
            var klass, _base;
            return this.plugins[name] ? console.error(_t("You cannot have more than one instance of any plugin.")) : (klass = Annotator.Plugin[name], 
            "function" == typeof klass ? (this.plugins[name] = new klass(this.element[0], options), 
            this.plugins[name].annotator = this, "function" == typeof (_base = this.plugins[name]).pluginInit && _base.pluginInit()) : console.error(_t("Could not load ") + name + _t(" plugin. Have you included the appropriate <script> tag?"))), 
            this;
        }, Annotator.prototype.showEditor = function(annotation, location) {
            return this.editor.element.css(location), this.editor.load(annotation), this.publish("annotationEditorShown", [ this.editor, annotation ]), 
            this;
        }, Annotator.prototype.onEditorHide = function() {
            return this.publish("annotationEditorHidden", [ this.editor ]), this.ignoreMouseup = !1;
        }, Annotator.prototype.onEditorSubmit = function(annotation) {
            return this.publish("annotationEditorSubmit", [ this.editor, annotation ]);
        }, Annotator.prototype.showViewer = function(annotations, location) {
            return this.viewer.element.css(location), this.viewer.load(annotations), this.publish("annotationViewerShown", [ this.viewer, annotations ]);
        }, Annotator.prototype.startViewerHideTimer = function() {
            if (!this.viewerHideTimer) return this.viewerHideTimer = setTimeout(this.viewer.hide, 250);
        }, Annotator.prototype.clearViewerHideTimer = function() {
            return clearTimeout(this.viewerHideTimer), this.viewerHideTimer = !1;
        }, Annotator.prototype.checkForStartSelection = function(event) {
            return event && this.isAnnotator(event.target) || this.startViewerHideTimer(), this.mouseIsDown = !0;
        }, Annotator.prototype.checkForEndSelection = function(event) {
            var container, range, _i, _len, _ref;
            if (this.mouseIsDown = !1, !this.ignoreMouseup) {
                for (this.selectedRanges = this.getSelectedRanges(), _ref = this.selectedRanges, 
                _i = 0, _len = _ref.length; _i < _len; _i++) if (range = _ref[_i], container = range.commonAncestor, 
                this.isAnnotator(container)) return;
                return event && this.selectedRanges.length ? this.adder.css(Util.mousePosition(event, this.wrapper[0])).show() : this.adder.hide();
            }
        }, Annotator.prototype.isAnnotator = function(element) {
            return !!$(element).parents().addBack().filter("[class^=annotator-]").not("[class=annotator-hl]").not(this.wrapper).length;
        }, Annotator.prototype.onHighlightMouseover = function(event) {
            var annotations;
            return this.clearViewerHideTimer(), !this.mouseIsDown && (this.viewer.isShown() && this.viewer.hide(), 
            annotations = $(event.target).parents(".annotator-hl").addBack().map(function() {
                return $(this).data("annotation");
            }).toArray(), this.showViewer(annotations, Util.mousePosition(event, this.wrapper[0])));
        }, Annotator.prototype.onAdderMousedown = function(event) {
            return null != event && event.preventDefault(), this.ignoreMouseup = !0;
        }, Annotator.prototype.onAdderClick = function(event) {
            var annotation, cancel, cleanup, position, save;
            return null != event && event.preventDefault(), position = this.adder.position(), 
            this.adder.hide(), annotation = this.setupAnnotation(this.createAnnotation()), $(annotation.highlights).addClass("annotator-hl-temporary"), 
            save = function(_this) {
                return function() {
                    return cleanup(), $(annotation.highlights).removeClass("annotator-hl-temporary"), 
                    _this.publish("annotationCreated", [ annotation ]);
                };
            }(this), cancel = function(_this) {
                return function() {
                    return cleanup(), _this.deleteAnnotation(annotation);
                };
            }(this), cleanup = function(_this) {
                return function() {
                    return _this.unsubscribe("annotationEditorHidden", cancel), _this.unsubscribe("annotationEditorSubmit", save);
                };
            }(this), this.subscribe("annotationEditorHidden", cancel), this.subscribe("annotationEditorSubmit", save), 
            this.showEditor(annotation, position);
        }, Annotator.prototype.onEditAnnotation = function(annotation) {
            var cleanup, offset, update;
            return offset = this.viewer.element.position(), update = function(_this) {
                return function() {
                    return cleanup(), _this.updateAnnotation(annotation);
                };
            }(this), cleanup = function(_this) {
                return function() {
                    return _this.unsubscribe("annotationEditorHidden", cleanup), _this.unsubscribe("annotationEditorSubmit", update);
                };
            }(this), this.subscribe("annotationEditorHidden", cleanup), this.subscribe("annotationEditorSubmit", update), 
            this.viewer.hide(), this.showEditor(annotation, offset);
        }, Annotator.prototype.onDeleteAnnotation = function(annotation) {
            return this.viewer.hide(), this.deleteAnnotation(annotation);
        }, Annotator;
    }(Delegator), Annotator.Plugin = function(_super) {
        function Plugin(element, options) {
            Plugin.__super__.constructor.apply(this, arguments);
        }
        return __extends(Plugin, _super), Plugin.prototype.pluginInit = function() {}, Plugin;
    }(Delegator), g = Util.getGlobal(), null == (null != (_ref = g.document) ? _ref.evaluate : void 0) && $.getScript("http://assets.annotateit.org/vendor/xpath.min.js"), 
    null == g.getSelection && $.getScript("http://assets.annotateit.org/vendor/ierange.min.js"), 
    null == g.JSON && $.getScript("http://assets.annotateit.org/vendor/json2.min.js"), 
    null == g.Node && (g.Node = {
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE: 6,
        PROCESSING_INSTRUCTION_NODE: 7,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9,
        DOCUMENT_TYPE_NODE: 10,
        DOCUMENT_FRAGMENT_NODE: 11,
        NOTATION_NODE: 12
    }), Annotator.$ = $, Annotator.Delegator = Delegator, Annotator.Range = Range, Annotator.Util = Util, 
    Annotator._instances = [], Annotator._t = _t, Annotator.supported = function() {
        return function() {
            return !!this.getSelection;
        }();
    }, Annotator.noConflict = function() {
        return Util.getGlobal().Annotator = _Annotator, this;
    }, $.fn.annotator = function(options) {
        var args;
        return args = Array.prototype.slice.call(arguments, 1), this.each(function() {
            var instance;
            return instance = $.data(this, "annotator"), "destroy" === options ? ($.removeData(this, "annotator"), 
            null != instance ? instance.destroy(args) : void 0) : instance ? options && instance[options].apply(instance, args) : (instance = new Annotator(this, options), 
            $.data(this, "annotator", instance));
        });
    }, this.Annotator = Annotator;
    var __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    };
    Annotator.Widget = function(_super) {
        function Widget(element, options) {
            Widget.__super__.constructor.apply(this, arguments), this.classes = $.extend({}, Annotator.Widget.prototype.classes, this.classes);
        }
        return __extends(Widget, _super), Widget.prototype.classes = {
            hide: "annotator-hide",
            invert: {
                x: "annotator-invert-x",
                y: "annotator-invert-y"
            }
        }, Widget.prototype.destroy = function() {
            return this.removeEvents(), this.element.remove();
        }, Widget.prototype.checkOrientation = function() {
            var current, offset, viewport, widget, window;
            return this.resetOrientation(), window = $(Annotator.Util.getGlobal()), widget = this.element.children(":first"), 
            offset = widget.offset(), viewport = {
                top: window.scrollTop(),
                right: window.width() + window.scrollLeft()
            }, current = {
                top: offset.top,
                right: offset.left + widget.width()
            }, current.top - viewport.top < 0 && this.invertY(), current.right - viewport.right > 0 && this.invertX(), 
            this;
        }, Widget.prototype.resetOrientation = function() {
            return this.element.removeClass(this.classes.invert.x).removeClass(this.classes.invert.y), 
            this;
        }, Widget.prototype.invertX = function() {
            return this.element.addClass(this.classes.invert.x), this;
        }, Widget.prototype.invertY = function() {
            return this.element.addClass(this.classes.invert.y), this;
        }, Widget.prototype.isInvertedY = function() {
            return this.element.hasClass(this.classes.invert.y);
        }, Widget.prototype.isInvertedX = function() {
            return this.element.hasClass(this.classes.invert.x);
        }, Widget;
    }(Delegator);
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    };
    Annotator.Editor = function(_super) {
        function Editor(options) {
            this.onCancelButtonMouseover = __bind(this.onCancelButtonMouseover, this), this.processKeypress = __bind(this.processKeypress, this), 
            this.submit = __bind(this.submit, this), this.load = __bind(this.load, this), this.hide = __bind(this.hide, this), 
            this.show = __bind(this.show, this), Editor.__super__.constructor.call(this, $(this.html)[0], options), 
            this.fields = [], this.annotation = {};
        }
        return __extends(Editor, _super), Editor.prototype.events = {
            "form submit": "submit",
            ".annotator-save click": "submit",
            ".annotator-cancel click": "hide",
            ".annotator-cancel mouseover": "onCancelButtonMouseover",
            "textarea keydown": "processKeypress"
        }, Editor.prototype.classes = {
            hide: "annotator-hide",
            focus: "annotator-focus"
        }, Editor.prototype.html = '<div class="annotator-outer annotator-editor">\n  <form class="annotator-widget">\n    <ul class="annotator-listing"></ul>\n    <div class="annotator-controls">\n      <a href="#cancel" class="annotator-cancel">' + _t("Cancel") + '</a>\n<a href="#save" class="annotator-save annotator-focus">' + _t("Save") + "</a>\n    </div>\n  </form>\n</div>", 
        Editor.prototype.options = {}, Editor.prototype.show = function(event) {
            return Annotator.Util.preventEventDefault(event), this.element.removeClass(this.classes.hide), 
            this.element.find(".annotator-save").addClass(this.classes.focus), this.checkOrientation(), 
            this.element.find(":input:first").focus(), this.setupDraggables(), this.publish("show");
        }, Editor.prototype.hide = function(event) {
            return Annotator.Util.preventEventDefault(event), this.element.addClass(this.classes.hide), 
            this.publish("hide");
        }, Editor.prototype.load = function(annotation) {
            var field, _i, _len, _ref;
            for (this.annotation = annotation, this.publish("load", [ this.annotation ]), _ref = this.fields, 
            _i = 0, _len = _ref.length; _i < _len; _i++) field = _ref[_i], field.load(field.element, this.annotation);
            return this.show();
        }, Editor.prototype.submit = function(event) {
            var field, _i, _len, _ref;
            for (Annotator.Util.preventEventDefault(event), _ref = this.fields, _i = 0, _len = _ref.length; _i < _len; _i++) field = _ref[_i], 
            field.submit(field.element, this.annotation);
            return this.publish("save", [ this.annotation ]), this.hide();
        }, Editor.prototype.addField = function(options) {
            var element, field, input;
            switch (field = $.extend({
                id: "annotator-field-" + Annotator.Util.uuid(),
                type: "input",
                label: "",
                load: function() {},
                submit: function() {}
            }, options), input = null, element = $('<li class="annotator-item" />'), field.element = element[0], 
            field.type) {
              case "textarea":
                input = $("<textarea />");
                break;

              case "input":
              case "checkbox":
                input = $("<input />");
                break;

              case "select":
                input = $("<select />");
            }
            return element.append(input), input.attr({
                id: field.id,
                placeholder: field.label
            }), "checkbox" === field.type && (input[0].type = "checkbox", element.addClass("annotator-checkbox"), 
            element.append($("<label />", {
                "for": field.id,
                html: field.label
            }))), this.element.find("ul:first").append(element), this.fields.push(field), field.element;
        }, Editor.prototype.checkOrientation = function() {
            var controls, list;
            return Editor.__super__.checkOrientation.apply(this, arguments), list = this.element.find("ul"), 
            controls = this.element.find(".annotator-controls"), this.element.hasClass(this.classes.invert.y) ? controls.insertBefore(list) : controls.is(":first-child") && controls.insertAfter(list), 
            this;
        }, Editor.prototype.processKeypress = function(event) {
            return 27 === event.keyCode ? this.hide() : 13 !== event.keyCode || event.shiftKey ? void 0 : this.submit();
        }, Editor.prototype.onCancelButtonMouseover = function() {
            return this.element.find("." + this.classes.focus).removeClass(this.classes.focus);
        }, Editor.prototype.setupDraggables = function() {
            var classes, controls, cornerItem, editor, mousedown, onMousedown, onMousemove, onMouseup, resize, textarea, throttle;
            return this.element.find(".annotator-resize").remove(), cornerItem = this.element.hasClass(this.classes.invert.y) ? this.element.find(".annotator-item:last") : this.element.find(".annotator-item:first"), 
            cornerItem && $('<span class="annotator-resize"></span>').appendTo(cornerItem), 
            mousedown = null, classes = this.classes, editor = this.element, textarea = null, 
            resize = editor.find(".annotator-resize"), controls = editor.find(".annotator-controls"), 
            throttle = !1, onMousedown = function(event) {
                if (event.target === this) return mousedown = {
                    element: this,
                    top: event.pageY,
                    left: event.pageX
                }, textarea = editor.find("textarea:first"), $(window).bind({
                    "mouseup.annotator-editor-resize": onMouseup,
                    "mousemove.annotator-editor-resize": onMousemove
                }), event.preventDefault();
            }, onMouseup = function() {
                return mousedown = null, $(window).unbind(".annotator-editor-resize");
            }, onMousemove = function(_this) {
                return function(event) {
                    var diff, directionX, directionY, height, width;
                    if (mousedown && throttle === !1) return diff = {
                        top: event.pageY - mousedown.top,
                        left: event.pageX - mousedown.left
                    }, mousedown.element === resize[0] ? (height = textarea.outerHeight(), width = textarea.outerWidth(), 
                    directionX = editor.hasClass(classes.invert.x) ? -1 : 1, directionY = editor.hasClass(classes.invert.y) ? 1 : -1, 
                    textarea.height(height + diff.top * directionY), textarea.width(width + diff.left * directionX), 
                    textarea.outerHeight() !== height && (mousedown.top = event.pageY), textarea.outerWidth() !== width && (mousedown.left = event.pageX)) : mousedown.element === controls[0] && (editor.css({
                        top: parseInt(editor.css("top"), 10) + diff.top,
                        left: parseInt(editor.css("left"), 10) + diff.left
                    }), mousedown.top = event.pageY, mousedown.left = event.pageX), throttle = !0, setTimeout(function() {
                        return throttle = !1;
                    }, 1e3 / 60);
                };
            }(this), resize.bind("mousedown", onMousedown), controls.bind("mousedown", onMousedown);
        }, Editor;
    }(Annotator.Widget);
    var LinkParser, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    };
    Annotator.Viewer = function(_super) {
        function Viewer(options) {
            this.onDeleteClick = __bind(this.onDeleteClick, this), this.onEditClick = __bind(this.onEditClick, this), 
            this.load = __bind(this.load, this), this.hide = __bind(this.hide, this), this.show = __bind(this.show, this), 
            Viewer.__super__.constructor.call(this, $(this.html.element)[0], options), this.item = $(this.html.item)[0], 
            this.fields = [], this.annotations = [];
        }
        return __extends(Viewer, _super), Viewer.prototype.events = {
            ".annotator-edit click": "onEditClick",
            ".annotator-delete click": "onDeleteClick"
        }, Viewer.prototype.classes = {
            hide: "annotator-hide",
            showControls: "annotator-visible"
        }, Viewer.prototype.html = {
            element: '<div class="annotator-outer annotator-viewer">\n  <ul class="annotator-widget annotator-listing"></ul>\n</div>',
            item: '<li class="annotator-annotation annotator-item">\n  <span class="annotator-controls">\n    <a href="#" title="View as webpage" class="annotator-link">View as webpage</a>\n    <button title="Edit" class="annotator-edit">Edit</button>\n    <button title="Delete" class="annotator-delete">Delete</button>\n  </span>\n</li>'
        }, Viewer.prototype.options = {
            readOnly: !1
        }, Viewer.prototype.show = function(event) {
            var controls;
            return Annotator.Util.preventEventDefault(event), controls = this.element.find(".annotator-controls").addClass(this.classes.showControls), 
            setTimeout(function(_this) {
                return function() {
                    return controls.removeClass(_this.classes.showControls);
                };
            }(this), 500), this.element.removeClass(this.classes.hide), this.checkOrientation().publish("show");
        }, Viewer.prototype.isShown = function() {
            return !this.element.hasClass(this.classes.hide);
        }, Viewer.prototype.hide = function(event) {
            return Annotator.Util.preventEventDefault(event), this.element.addClass(this.classes.hide), 
            this.publish("hide");
        }, Viewer.prototype.load = function(annotations) {
            var annotation, controller, controls, del, edit, element, field, item, link, links, list, _i, _j, _len, _len1, _ref, _ref1;
            for (this.annotations = annotations || [], list = this.element.find("ul:first").empty(), 
            _ref = this.annotations, _i = 0, _len = _ref.length; _i < _len; _i++) for (annotation = _ref[_i], 
            item = $(this.item).clone().appendTo(list).data("annotation", annotation), controls = item.find(".annotator-controls"), 
            link = controls.find(".annotator-link"), edit = controls.find(".annotator-edit"), 
            del = controls.find(".annotator-delete"), links = new LinkParser(annotation.links || []).get("alternate", {
                type: "text/html"
            }), 0 === links.length || null == links[0].href ? link.remove() : link.attr("href", links[0].href), 
            this.options.readOnly ? (edit.remove(), del.remove()) : controller = {
                showEdit: function() {
                    return edit.removeAttr("disabled");
                },
                hideEdit: function() {
                    return edit.attr("disabled", "disabled");
                },
                showDelete: function() {
                    return del.removeAttr("disabled");
                },
                hideDelete: function() {
                    return del.attr("disabled", "disabled");
                }
            }, _ref1 = this.fields, _j = 0, _len1 = _ref1.length; _j < _len1; _j++) field = _ref1[_j], 
            element = $(field.element).clone().appendTo(item)[0], field.load(element, annotation, controller);
            return this.publish("load", [ this.annotations ]), this.show();
        }, Viewer.prototype.addField = function(options) {
            var field;
            return field = $.extend({
                load: function() {}
            }, options), field.element = $("<div />")[0], this.fields.push(field), field.element, 
            this;
        }, Viewer.prototype.onEditClick = function(event) {
            return this.onButtonClick(event, "edit");
        }, Viewer.prototype.onDeleteClick = function(event) {
            return this.onButtonClick(event, "delete");
        }, Viewer.prototype.onButtonClick = function(event, type) {
            var item;
            return item = $(event.target).parents(".annotator-annotation"), this.publish(type, [ item.data("annotation") ]);
        }, Viewer;
    }(Annotator.Widget), LinkParser = function() {
        function LinkParser(data) {
            this.data = data;
        }
        return LinkParser.prototype.get = function(rel, cond) {
            var d, k, keys, match, v, _i, _len, _ref, _results;
            for (null == cond && (cond = {}), cond = $.extend({}, cond, {
                rel: rel
            }), keys = function() {
                var _results;
                _results = [];
                for (k in cond) __hasProp.call(cond, k) && (v = cond[k], _results.push(k));
                return _results;
            }(), _ref = this.data, _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) d = _ref[_i], 
            match = keys.reduce(function(m, k) {
                return m && d[k] === cond[k];
            }, !0), match && _results.push(d);
            return _results;
        }, LinkParser;
    }();
    var Annotator, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    };
    Annotator = Annotator || {}, Annotator.Notification = function(_super) {
        function Notification(options) {
            this.hide = __bind(this.hide, this), this.show = __bind(this.show, this), Notification.__super__.constructor.call(this, $(this.options.html).appendTo(document.body)[0], options);
        }
        return __extends(Notification, _super), Notification.prototype.events = {
            click: "hide"
        }, Notification.prototype.options = {
            html: "<div class='annotator-notice'></div>",
            classes: {
                show: "annotator-notice-show",
                info: "annotator-notice-info",
                success: "annotator-notice-success",
                error: "annotator-notice-error"
            }
        }, Notification.prototype.show = function(message, status) {
            return null == status && (status = Annotator.Notification.INFO), this.currentStatus = status, 
            $(this.element).addClass(this.options.classes.show).addClass(this.options.classes[this.currentStatus]).html(Util.escape(message || "")), 
            setTimeout(this.hide, 5e3), this;
        }, Notification.prototype.hide = function() {
            return null == this.currentStatus && (this.currentStatus = Annotator.Notification.INFO), 
            $(this.element).removeClass(this.options.classes.show).removeClass(this.options.classes[this.currentStatus]), 
            this;
        }, Notification;
    }(Delegator), Annotator.Notification.INFO = "info", Annotator.Notification.SUCCESS = "success", 
    Annotator.Notification.ERROR = "error", $(function() {
        var notification;
        return notification = new Annotator.Notification(), Annotator.showNotification = notification.show, 
        Annotator.hideNotification = notification.hide;
    });
    var findChild, getNodeName, getNodePosition, simpleXPathJQuery, simpleXPathPure;
    simpleXPathJQuery = function(relativeRoot) {
        var jq;
        return jq = this.map(function() {
            var elem, idx, path, tagName;
            for (path = "", elem = this; (null != elem ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot; ) tagName = elem.tagName.replace(":", "\\:"), 
            idx = $(elem.parentNode).children(tagName).index(elem) + 1, idx = "[" + idx + "]", 
            path = "/" + elem.tagName.toLowerCase() + idx + path, elem = elem.parentNode;
            return path;
        }), jq.get();
    }, simpleXPathPure = function(relativeRoot) {
        var getPathSegment, getPathTo, jq, rootNode;
        return getPathSegment = function(node) {
            var name, pos;
            return name = getNodeName(node), pos = getNodePosition(node), "" + name + "[" + pos + "]";
        }, rootNode = relativeRoot, getPathTo = function(node) {
            var xpath;
            for (xpath = ""; node !== rootNode; ) {
                if (null == node) throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode);
                xpath = getPathSegment(node) + "/" + xpath, node = node.parentNode;
            }
            return xpath = "/" + xpath, xpath = xpath.replace(/\/$/, "");
        }, jq = this.map(function() {
            var path;
            return path = getPathTo(this);
        }), jq.get();
    }, findChild = function(node, type, index) {
        var child, children, found, name, _i, _len;
        if (!node.hasChildNodes()) throw new Error("XPath error: node has no children!");
        for (children = node.childNodes, found = 0, _i = 0, _len = children.length; _i < _len; _i++) if (child = children[_i], 
        name = getNodeName(child), name === type && (found += 1, found === index)) return child;
        throw new Error("XPath error: wanted child not found.");
    }, getNodeName = function(node) {
        var nodeName;
        switch (nodeName = node.nodeName.toLowerCase()) {
          case "#text":
            return "text()";

          case "#comment":
            return "comment()";

          case "#cdata-section":
            return "cdata-section()";

          default:
            return nodeName;
        }
    }, getNodePosition = function(node) {
        var pos, tmp;
        for (pos = 0, tmp = node; tmp; ) tmp.nodeName === node.nodeName && pos++, tmp = tmp.previousSibling;
        return pos;
    };
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
        return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, 
        child;
    }, __indexOf = [].indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) if (i in this && this[i] === item) return i;
        return -1;
    };
    Annotator.Plugin.Store = function(_super) {
        function Store(element, options) {
            this._onError = __bind(this._onError, this), this._onLoadAnnotationsFromSearch = __bind(this._onLoadAnnotationsFromSearch, this), 
            this._onLoadAnnotations = __bind(this._onLoadAnnotations, this), this._getAnnotations = __bind(this._getAnnotations, this), 
            Store.__super__.constructor.apply(this, arguments), this.annotations = [];
        }
        return __extends(Store, _super), Store.prototype.events = {
            annotationCreated: "annotationCreated",
            annotationDeleted: "annotationDeleted",
            annotationUpdated: "annotationUpdated"
        }, Store.prototype.options = {
            annotationData: {},
            emulateHTTP: !1,
            loadFromSearch: !1,
            prefix: "/store",
            urls: {
                create: "/annotations",
                read: "/annotations/:id",
                update: "/annotations/:id",
                destroy: "/annotations/:id",
                search: "/search"
            }
        }, Store.prototype.pluginInit = function() {
            if (Annotator.supported()) return this.annotator.plugins.Auth ? this.annotator.plugins.Auth.withToken(this._getAnnotations) : this._getAnnotations();
        }, Store.prototype._getAnnotations = function() {
            return this.options.loadFromSearch ? this.loadAnnotationsFromSearch(this.options.loadFromSearch) : this.loadAnnotations();
        }, Store.prototype.annotationCreated = function(annotation) {
            return __indexOf.call(this.annotations, annotation) < 0 ? (this.registerAnnotation(annotation), 
            this._apiRequest("create", annotation, function(_this) {
                return function(data) {
                    return null == data.id && console.warn(Annotator._t("Warning: No ID returned from server for annotation "), annotation), 
                    _this.updateAnnotation(annotation, data);
                };
            }(this))) : this.updateAnnotation(annotation, {});
        }, Store.prototype.annotationUpdated = function(annotation) {
            if (__indexOf.call(this.annotations, annotation) >= 0) return this._apiRequest("update", annotation, function(_this) {
                return function(data) {
                    return _this.updateAnnotation(annotation, data);
                };
            }(this));
        }, Store.prototype.annotationDeleted = function(annotation) {
            if (__indexOf.call(this.annotations, annotation) >= 0) return this._apiRequest("destroy", annotation, function(_this) {
                return function() {
                    return _this.unregisterAnnotation(annotation);
                };
            }(this));
        }, Store.prototype.registerAnnotation = function(annotation) {
            return this.annotations.push(annotation);
        }, Store.prototype.unregisterAnnotation = function(annotation) {
            return this.annotations.splice(this.annotations.indexOf(annotation), 1);
        }, Store.prototype.updateAnnotation = function(annotation, data) {
            return __indexOf.call(this.annotations, annotation) < 0 ? console.error(Annotator._t("Trying to update unregistered annotation!")) : $.extend(annotation, data), 
            $(annotation.highlights).data("annotation", annotation);
        }, Store.prototype.loadAnnotations = function() {
            return this._apiRequest("read", null, this._onLoadAnnotations);
        }, Store.prototype._onLoadAnnotations = function(data) {
            var a, annotation, annotationMap, newData, _i, _j, _len, _len1, _ref;
            for (null == data && (data = []), annotationMap = {}, _ref = this.annotations, _i = 0, 
            _len = _ref.length; _i < _len; _i++) a = _ref[_i], annotationMap[a.id] = a;
            for (newData = [], _j = 0, _len1 = data.length; _j < _len1; _j++) a = data[_j], 
            annotationMap[a.id] ? (annotation = annotationMap[a.id], this.updateAnnotation(annotation, a)) : newData.push(a);
            return this.annotations = this.annotations.concat(newData), this.annotator.loadAnnotations(newData.slice());
        }, Store.prototype.loadAnnotationsFromSearch = function(searchOptions) {
            return this._apiRequest("search", searchOptions, this._onLoadAnnotationsFromSearch);
        }, Store.prototype._onLoadAnnotationsFromSearch = function(data) {
            return null == data && (data = {}), this._onLoadAnnotations(data.rows || []);
        }, Store.prototype.dumpAnnotations = function() {
            var ann, _i, _len, _ref, _results;
            for (_ref = this.annotations, _results = [], _i = 0, _len = _ref.length; _i < _len; _i++) ann = _ref[_i], 
            _results.push(JSON.parse(this._dataFor(ann)));
            return _results;
        }, Store.prototype._apiRequest = function(action, obj, onSuccess) {
            var id, options, request, url;
            return id = obj && obj.id, url = this._urlFor(action, id), options = this._apiRequestOptions(action, obj, onSuccess), 
            request = $.ajax(url, options), request._id = id, request._action = action, request;
        }, Store.prototype._apiRequestOptions = function(action, obj, onSuccess) {
            var data, method, opts;
            return method = this._methodFor(action), opts = {
                type: method,
                headers: this.element.data("annotator:headers"),
                dataType: "json",
                success: onSuccess || function() {},
                error: this._onError
            }, !this.options.emulateHTTP || "PUT" !== method && "DELETE" !== method || (opts.headers = $.extend(opts.headers, {
                "X-HTTP-Method-Override": method
            }), opts.type = "POST"), "search" === action ? opts = $.extend(opts, {
                data: obj
            }) : (data = obj && this._dataFor(obj), this.options.emulateJSON ? (opts.data = {
                json: data
            }, this.options.emulateHTTP && (opts.data._method = method), opts) : opts = $.extend(opts, {
                data: data,
                contentType: "application/json; charset=utf-8"
            }));
        }, Store.prototype._urlFor = function(action, id) {
            var url;
            return url = null != this.options.prefix ? this.options.prefix : "", url += this.options.urls[action], 
            url = url.replace(/\/:id/, null != id ? "/" + id : ""), url = url.replace(/:id/, null != id ? id : "");
        }, Store.prototype._methodFor = function(action) {
            var table;
            return table = {
                create: "POST",
                read: "GET",
                update: "PUT",
                destroy: "DELETE",
                search: "GET"
            }, table[action];
        }, Store.prototype._dataFor = function(annotation) {
            var data, highlights;
            return highlights = annotation.highlights, delete annotation.highlights, $.extend(annotation, this.options.annotationData), 
            data = JSON.stringify(annotation), highlights && (annotation.highlights = highlights), 
            data;
        }, Store.prototype._onError = function(xhr) {
            var action, message;
            switch (action = xhr._action, message = Annotator._t("Sorry we could not ") + action + Annotator._t(" this annotation"), 
            "search" === xhr._action ? message = Annotator._t("Sorry we could not search the store for annotations") : "read" !== xhr._action || xhr._id || (message = Annotator._t("Sorry we could not ") + action + Annotator._t(" the annotations from the store")), 
            xhr.status) {
              case 401:
                message = Annotator._t("Sorry you are not allowed to ") + action + Annotator._t(" this annotation");
                break;

              case 404:
                message = Annotator._t("Sorry we could not connect to the annotations store");
                break;

              case 500:
                message = Annotator._t("Sorry something went wrong with the annotation store");
            }
            return Annotator.showNotification(message, Annotator.Notification.ERROR), console.error(Annotator._t("API request failed:") + (" '" + xhr.status + "'"));
        }, Store;
    }(Annotator.Plugin);
}(window);
//# sourceMappingURL=annotator.lib.js.map