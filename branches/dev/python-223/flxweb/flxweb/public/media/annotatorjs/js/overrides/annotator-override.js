define(['jquery', 'annotator'], function($){

/////////////
// Helpers //
/////////////

    var getNodeName = function(node) {
        var nodeName;
        nodeName = node.nodeName.toLowerCase();
        switch (nodeName) {
            case '#text':
                return 'text()';
            case '#comment':
                return 'comment()';
            case '#cdata-section':
                return 'cdata-section()';
            default:
                return nodeName;
        }
    };
    var getNodePosition = function(node) {
        var pos, tmp;
        pos = 0;
        tmp = node;
        while (tmp) {
            if (tmp.nodeName === node.nodeName) {
                pos++;
            }
            tmp = tmp.previousSibling;
        }
        return pos;
    };

    var simpleXPathPure = function(relativeRoot) {
        var getPathSegment, getPathTo, jq, rootNode;
        getPathSegment = function(node) {
            var name, pos;
            name = getNodeName(node);
            pos = getNodePosition(node);
            return '' + name + '[' + pos + ']';
        };
        rootNode = relativeRoot;
        getPathTo = function(node) {
            var xpath;
            xpath = '';
            while (node !== rootNode) {
                if (node == null) {
                    throw new Error('Called getPathTo on a node which was not a descendant of @rootNode. ' + rootNode);
                }
                xpath = getPathSegment(node) + '/' + xpath;
                node = node.parentNode;
            }
            xpath = '/' + xpath;
            xpath = xpath.replace(/\/$/, '');
            return xpath;
        };
        jq = this.map(function() {
            var path;
            path = getPathTo(this);
            return path;
        });
        return jq.get();
    };

    // TODO Does this need to be overriden globally? Or can it safely be overridden with just here?
    simpleXPathJQuery = function(relativeRoot) {
        var jq;
        jq = this.map(function() {
            // var elem, idx, path, tagName;
            // path = "";
            // elem = this;
            // while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
            //     tagName = elem.tagName.replace(":", "\\:");
            //     idx = $(elem.parentNode).children(tagName).index(elem) + 1;
            //     idx = "[" + idx + "]";
            //     path = "/" + elem.tagName.toLowerCase() + idx + path;
            //     elem = elem.parentNode
            // }
            // return path
            var target = $(this).closest('.x-ck12-mathEditor');
            if(target.length !== 0){
                return '/'+target.closest('p').attr('id');
            }
            var targetElement = $(this);
            while(!targetElement.attr('id')){
                targetElement = targetElement.parent();
            }
            return '/' + targetElement.attr('id');
        });
        return jq.get();
    };
    getFirstTextNode = function(n){
        if(n.nodeType === Node.TEXT_NODE && n.nodeValue.length > 0){
            return n;
        }else{
            var childNodes = n.childNodes;
            for(var i = 0; i < childNodes.length; i++){
                var textNode = getFirstTextNode(childNodes[i]);
                if(textNode){
                    return textNode;
                }
            }
        }
        return null;
    };
///////////////
// Overrides //
///////////////

    Annotator.prototype.events = {
        '.annotator-adder button click': 'onAdderClick',
        '.annotator-adder button mousedown': 'onAdderMousedown',
        '.annotation-icon click': 'onHighlightMouseover'
        // ".annotator-hl mouseout": "startViewerHideTimer"
    };

    Annotator.prototype._setupViewer = function() {
        var _this = this;
        this.viewer = new Annotator.Viewer({
            readOnly: this.options.readOnly
        });
        this.viewer.hide().on('edit', this.onEditAnnotation).on('delete', this.onDeleteAnnotation).addField({
            load: function(field, annotation) {
                if (annotation.text) {
                    $(field).html(Annotator.Util.escape(annotation.text));
                } else {
                    $(field).html('<i>' + _t('No Comment') + '</i>');
                }
                return _this.publish('annotationViewerTextField', [field, annotation]);
            }
        }).element.appendTo(this.wrapper.parent());
        return this;
    };

    Annotator.prototype._setupEditor = function() {
        this.editor = new Annotator.Editor;
        this.editor.hide().on('hide', this.onEditorHide).on('save', this.onEditorSubmit);
        // .addField({
        //     type: "textarea",
        //     label: _t("Comments") + "…",
        //     load: function(field, annotation) {
        //         return $(field).find("textarea").val(annotation.text || "")
        //     },
        //     submit: function(field, annotation) {
        //         return annotation.text = $(field).find("textarea").val()
        //     }
        // });
        this.editor.element.appendTo(this.wrapper.parent());
        return this;
    };

    Annotator.prototype.checkForEndSelection = function(event) {
        //select in viewer
        var viewer = this.viewer.element;
        if($(event.target).closest(".plix-thumbnail-container").length){
            // avoiding annotation for plix content
            return;
        }

        if(Annotator.Util.contains(viewer[0], event.target)){
            return this.adder.hide();
        }
        // automatically close editor
        var container = $('.annotator-editor');
        if(!container.is(event.target) && container.has(event.target).length === 0 && !this.ignoreMouseup){
            $('.annotator-cancel').trigger('click.annotator');
        }
        //
        var container, range, _k, _len2, _ref1;
        this.mouseIsDown = false;
        var $editor = $('.annotator-editor');
        if (this.ignoreMouseup) {
            this.ignoreMouseup = false;
            return;
        }
        // var newRange = document.createRange();

        // var target = $(event.target).closest('.x-ck12-mathEditor');
        // if(target.length !== 0){
        //     newRange.selectNode(target[0]);
        //     this.selectedRanges = [newRange];
        // }else{
        this.selectedRanges = this.getSelectedRanges();
        if(this.selectedRanges && this.selectedRanges[0] && this.selectedRanges[0].start.textContent.trim().length === 0 && this.selectedRanges[0].end.nodeValue.trim().length === 0){ // don't allow to select image
            return;
        }
        // }
        _ref1 = this.selectedRanges;
        // for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        //     range = _ref1[_k];
        //     container = range.commonAncestor;
        //     if (this.isAnnotator(container)) {
        //         return;
        //     }
        // }

        if (event && this.selectedRanges.length) {
            var target = $(event.target).closest('.x-ck12-mathEditor');
            if(target.length !== 0){
                var start = this.selectedRanges[0].start;
                var end = this.selectedRanges[0].end;
                if((start.nodeType === Node.TEXT_NODE && start.nodeValue.length === 0) || (end.nodeType === Node.TEXT_NODE && end.nodeValue.length === 0)){
                    this.publish('hideAdder');
                    return this.adder.hide();
                }
            }
            if($(event.target).hasClass('annotation-icon')){
                return this.adder.hide();
            }
            var target = this.adder.css(Annotator.Util.mousePosition(event, this.wrapper[0])).show();
            if($editor.hasClass('annotator-hide')){
                if(!$(event.target).hasClass('add-note-btn')){
                    this.publish('showAdder', Annotator.Util.mousePosition(event, this.wrapper[0]));
                }
            }else{
                $('.annotator-adder').hide();
                // this.publish('hideAdder');
            }
            return target;
        } else {
            this.publish('hideAdder');
            return this.adder.hide();
        }
    };

    Annotator.prototype.setupAnnotation = function(annotation) {
        var e, normed, normedRanges, r, root, _k, _l, _len2, _len3, _ref1, $annotationHighlights,
            rangeErrorNode, elemLength, lenDiff, missingNodeId,foundNode;
        root = this.wrapper[0];
        annotation.ranges || (annotation.ranges = this.selectedRanges);
        normedRanges = [];
        _ref1 = annotation.ranges;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            r = _ref1[_k];
            try {
                normedRanges.push(Annotator.Range.sniff(r).normalize(root));
            } catch (_error) {
                e = _error;
                if (e instanceof Annotator.Range.RangeError) {
                    //Bug 57597: Handle few cases
                    //Case 1: If the endoffset is now more than the current text length of end element, assume the max length
                    //as the endoffset. Else we get a RangError
                    rangeErrorNode = document.getElementById(r.end.replace(/\//,''));
                    if (rangeErrorNode) {
                        elemLength = rangeErrorNode.innerText.length;
                        lenDiff = r.endOffset - elemLength;
                        if (lenDiff) {
                            r.startOffset = (r.startOffset > lenDiff) ? r.startOffset - lenDiff : 0;
                            r.endOffset = elemLength;
                            normedRanges.push(Annotator.Range.sniff(r).normalize(root));
                        } else {
                            console.error(e);
                            this.publish('rangeNormalizeFail', [annotation, r, e]);
                        }
                    } else {
                        //case 2: The <p> content did not change, but id was changed due to bug in tinymce.
                        //Since the content remains the same, only the last 3 characters of the Id are different
                        //So we try to find the element ignoring the 3 characters.
                        //If we find, we use that element to show the annotation, else ignore this annotation and
                        //let it show in the annotation table
                        if (e.type === 'start') {
                            missingNodeId = r.start;
                        } else {
                            missingNodeId = r.end;
                        }

                        missingNodeId = r.start.replace(/\//g,'').slice(0,r.start.length-4);
                        foundNode = document.getElementById(missingNodeId);
                        if (foundNode && e.type === 'start') {
                            r.start = '/' + foundNode.id;
                        } else if (foundNode && e.type === 'end') {
                            r.end = '/' + foundNode.id;
                        } else {
                            console.error(e);
                            this.publish('rangeNormalizeFail', [annotation, r, e]);
                        }
                    }
                } else {
                    console.error(e);
                }
            }
        }
        annotation.quote = [];
        annotation.ranges = [];
        annotation.highlights = [];
        for (_l = 0, _len3 = normedRanges.length; _l < _len3; _l++) {
            normed = normedRanges[_l];
            annotation.quote.push($.trim(normed.text()));
            annotation.ranges.push(normed.serialize(this.wrapper[0], '.annotator-hl'));
            $.merge(annotation.highlights, this.highlightRange(normed));
        }
        annotation.quote = annotation.quote.join(' / ');

        $annotationHighlights = $(this.wrapper[0]).find(annotation.highlights);
        $annotationHighlights
            .data('annotation', annotation)
            .attr('data-annotation-id', annotation.id);

        if(annotation.highlightColor){
            $annotationHighlights
                .changeHighlightTo(annotation.highlightColor);
        }
        if(annotation && annotation.text && annotation.text.length > 0){
            var target = $annotationHighlights.last().closest('.x-ck12-mathEditor');
            if(target.length !== 0){
                target.attr('class', 'x-ck12-mathEditor '+ annotation.highlightColor);
                target.append('<i class="annotation-icon icon-notes" data-id="'+annotation.id+'"></i>');
                target.data('annotation', annotation);
            }else{
                $annotationHighlights.last().append('<i class="annotation-icon icon-notes" data-id="'+annotation.id+'"></i>');
            }
            // $('<i class="annotation-icon icon-studyaid" data-id="'+annotation.id+'"></i>').insertAfter(annotation.highlights);
        }

        return annotation;
    };

    Annotator.prototype.onHighlightMouseover = function(event) {
        var targetID = $(event.currentTarget).attr('data-id');
        var annotations;

        this.clearViewerHideTimer();
        if (this.mouseIsDown) {
            return false;
        }
        if (this.viewer.isShown()) {
            this.viewer.hide();
        }
        var a = $(event.target);
        var b = a.parents('.annotator-hl');
        if($(event.currentTarget).parent().hasClass('x-ck12-mathEditor')){
            var annotation = $('[data-annotation-id='+targetID+']').data('annotation');
            annotations = [annotation];
        }else{
            annotations = $(event.target).parents('.annotator-hl').addBack().map(function() {
                return $(this).data('annotation');
            }).toArray();
            annotations = annotations.filter(function(_annotation){
                return _annotation.id === targetID;
            });
        }
        // var pos = $(annotations[0].highlights).position();
        // this.showViewer(annotations, pos);
        this.showViewer(annotations, Annotator.Util.mousePosition(event, this.wrapper[0]));
        return false;
    };

    Annotator.prototype.loadAnnotations = function(annotations) {
        this.publish('allAnnotations', [annotations.slice()]);
        // annotations = annotations.filter(function(anno){
        //     return anno.id === "5780a0b3133cb416a09ffa4e";

        // });
        annotations = Annotator.Util.preProcessAnnotation(annotations, this.wrapper[0]);
        var clone, loader;
        return null == annotations && (annotations = []), loader = function(_this) {
            return function(annList) {
                var n, now, _i, _len;
                for (null == annList && (annList = []), now = annList.splice(0, 10), _i = 0, _len = now.length; _len > _i; _i++) n = now[_i],
                _this.setupAnnotation(n);
                return annList.length > 0 ? setTimeout(function() {
                    return loader(annList);
                }, 10) : _this.publish("annotationsLoaded", [ clone ]);
            };
        }(this), clone = annotations.slice(), loader(annotations), this;
    }
    Annotator.prototype._setupWrapper = function() {
        this.wrapper = $(this.html.wrapper);
        this.element.find("script").remove();
        // this.element.wrapInner(this.wrapper);
        this.wrapper = this.element;
        return this;
    }
    Annotator.prototype.isAnnotator = function(element) {
        return !!$(element).parents().addBack().filter('[class^=annotator-]').not('[class=annotator-hl]').not(this.wrapper).not(this.wrapper.parent()).length;
    };
    //////////////////////////
    //Scrible data transform//
    //////////////////////////
    convertScribleRange = function(annotation, rootNode){

        var range = annotation.ranges[0];

        var newRange = {
            start: range.start,
            end: range.end
        };

        var startContainerNode = document.getElementById(range.start.substring(1));
        if(!startContainerNode){
            throw 'start xpath does not exist'
        }

        if(startContainerNode.childNodes && startContainerNode.childNodes[0] === rootNode){
            startContainerNode = rootNode;
        }
        var endContainerNode = document.getElementById(range.end.substring(1));
        if(!endContainerNode){
            throw 'end xpath does not exist'
        }

        if(!rootNode.contains(startContainerNode) || !rootNode.contains(endContainerNode)){
            throw 'The is not in the annotation section';
        }
        if(endContainerNode.childNodes && endContainerNode.childNodes[0] === rootNode){
            endContainerNode = rootNode;
        }

        var startNode = findNode({
            containerNode: startContainerNode,
            childPath: range.startChildPath,
            nodePos: range.startNodePos,
        });
        var endNode = findNode({
            containerNode: endContainerNode,
            childPath: range.endChildPath,
            nodePos: range.endNodePos,
        });
        var startRoot = document.getElementById(range.start.substring(1));
        var endRoot = document.getElementById(range.end.substring(1));

        var commonAncestor = findCommonAncestorNode(startRoot, endRoot),
            nodes = Annotator.Util.getTextNodes($(commonAncestor)),
            nodesFromStart = Annotator.Util.getTextNodes($(startRoot)),
            nodesFromEnd = Annotator.Util.getTextNodes($(endRoot))

        var startNodeIndex = nodes.index(startNode),
            endNodeIndex = nodes.index(endNode),
            nodeIndexFromStart = nodesFromStart.index(startNode),
            nodeIndexFromEnd = nodesFromEnd.index(endNode),
            startOffset = -1,
            endOffset = -1;

        if(startNodeIndex <= endNodeIndex){
            startOffset = range.startOffset;
            endOffset = range.endOffset;

            startOffset = adjustOffset(startNode, startOffset, 'start', annotation.quote);
            endOffset = adjustOffset(endNode, endOffset, 'end', annotation.quote);

            startOffset += getPreviousNodeLength(nodesFromStart, nodeIndexFromStart, range.startOffset);
            endOffset += getPreviousNodeLength(nodesFromEnd, nodeIndexFromEnd);

        }else{
            console.log('selection in opposite direction');
        }

        newRange.startOffset = startOffset;
        newRange.endOffset = endOffset;

        annotation.ranges[0] = newRange;
    }
    adjustOffset = function(n, offset, type, quote){
        var words = quote.trim().split(' ');
        var targetWord = type==='start'? words[0]: words[words.length-1];
        var walk = 0;
        var min = 1000;
        var origOffset = offset;

        while((walk=n.nodeValue.trim().indexOf(targetWord, walk)) !== -1){
            var diff = 0;
            if(type === 'start'){
                diff = Math.abs(walk - origOffset);
            }else{
                diff = Math.abs(walk + targetWord.length - origOffset);
            }
            if(diff < min){
                min = diff;
                offset = type==='start'? walk++ : (walk += targetWord.length);
            }else{
                return offset;
            }
        }
        return offset;

    }
    findCommonAncestorNode = function(n1, n2){
        if(n1.contains(n2)){
            return n1;
        }

        if(n2.contains(n1)){
            return n2;
        }
        var parentNodes = $(n1).parents();
        for(var i = 0; i < parentNodes.length; i++){
            if(parentNodes[i].contains(n2)){
                return parentNodes[i];
            }
        }
        return null;
    }
    findNode = function(rangeInfo){
        var node, previousNodeLength, adjustOffset = 0;
        node = rangeInfo.containerNode;

        if(rangeInfo.childPath){
            node = getNodeByChildPath(node, rangeInfo.childPath);
        }
        if(rangeInfo.nodePos >= 0){
            node = getNodeByNodePos(node, rangeInfo.nodePos);
        }
        node = findFirstTextNode(node);

        return node || null;
    }
    findFirstTextNode = function(node){
        while(node.nodeType !== Node.TEXT_NODE){
            var targetNodes = [];
            for(var i = 0; i < node.childNodes.length; i++){
                if(node.childNodes[i].nodeType === Node.TEXT_NODE && (node.childNodes[i].nodeValue.trim().length > 0 || node.childNodes[i].nodeValue.match(/^\s*/)[0].length <= 1 )){
                    targetNodes.push(node.childNodes[i]);
                }else if(node.childNodes[i].nodeType !== Node.TEXT_NODE){
                    targetNodes.push(node.childNodes[i]);
                }
            }
            node = targetNodes[0];
        }
        return node || null;
    }
    getPreviousNodeLength = function(textNodes, nodeIndexPos){
        var offset = 0;
        for(var i = 0; i < textNodes.length && i < nodeIndexPos; i++){
            offset += textNodes[i].nodeValue.length;
        }
        var leadingSpace = textNodes[nodeIndexPos].nodeValue.match(/^\s*/)[0].length;
        if(leadingSpace > 1){
            offset += leadingSpace;
        }
        return offset;
    }
    getNodeByChildPath = function(containerNode, childPath){
        var node = containerNode;
        var nodePositions = childPath.split(',');
        for(var i = 0; i < nodePositions.length; i++){
           node = getNode(node, nodePositions[i]);
        }
        return node || null;
    }
    getNodeByNodePos = function(containerNode, nodePos){
        var node = containerNode;
        if(nodePos && nodePos > 0){
           node = getNode(node, nodePos);
        }
        return node || null;
    }
    getNode = function(rootNode, nodePos){
        var node = rootNode,
            targetNodes = [];
        for(var i=0; i < node.childNodes.length; i++){
            if(node.childNodes[i].nodeType === Node.TEXT_NODE && node.childNodes[i].nodeValue !== '\n' && (node.childNodes[i].nodeValue.trim().length !== 0 || node.childNodes[i].nodeValue.match(/^\s*/)[0].length <= 1)){
                targetNodes.push(node.childNodes[i]);
            }else if(node.childNodes[i].nodeType !== Node.TEXT_NODE ){
                targetNodes.push(node.childNodes[i]);
            }
        }
        node = targetNodes[nodePos];
        return node;
    }
// =========================================================
    Annotator.Util.preProcessAnnotation = function(annotations, root){
        var validAnnotations = [];
        for(var i = 0; i < annotations.length; i++){
            var annotation = annotations[i];
            if(annotation.migrated){
                try{
                    var r = convertScribleRange(annotation,root);
                    if(r === -1){
                        console.log('Can not find this annotation:', annotation);
                    }else{
                        validAnnotations.push(annotation);
                    }
                }catch(e){
                    console.warn(e, annotation)
                }
            }else{
                validAnnotations.push(annotation);
            }
        }
        return validAnnotations;
    }
    Annotator.prototype.onEditAnnotation = function(annotation) {
        var cleanup, offset, update, that = this;
        offset = this.viewer.element.position();
        update = function(_this) {
            return function() {
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_NOTE', {
                        artifactID: annotation.artifactID,
                        artifactRevisionID: annotation.revisionID,
                        color: annotation.highlightColor,
                        source : that.viewer.annotations.length > 1 ? 'multiple_side_note': 'single_side_note',
                        annotationID: annotation.id,
                        action: 'edit'
                    });
                }
                return cleanup(),
                _this.updateAnnotation(annotation);
            }
            ;
        }(this);
        cleanup = function(_this) {
            return function() {
                return _this.unsubscribe("annotationEditorHidden", cancel),
                _this.unsubscribe("annotationEditorSubmit", update);
            }
            ;
        }(this);

        var cancel = function(){
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_NOTE', {
                    artifactID: annotation.artifactID,
                    artifactRevisionID: annotation.revisionID,
                    color: annotation.highlightColor,
                    source : that.viewer.annotations.length > 1 ? 'multiple_side_note': 'single_side_note',
                    annotationID: annotation.id,
                    action: 'cancel'
                });
            }
            cleanup();
        }
        this.subscribe("annotationEditorHidden", cancel),
        this.subscribe("annotationEditorSubmit", update),
        this.viewer.hide(),
        this.showEditor(annotation, offset);
    }
    //////////
    // Util //
    //////////
    Annotator.Util.xpathFromNode = function(el, relativeRoot) {
        var exception, result;
        try {
            result = simpleXPathJQuery.call(el, relativeRoot);
        } catch (_error) {
            exception = _error;
            console.log('jQuery-based XPath construction failed! Falling back to manual.');
            result = simpleXPathPure.call(el, relativeRoot);
        }
        return result;
    };

    ///////////
    // Range //
    ///////////

    Annotator.Range.nodeFromXPath = function(xpath, root) {
        var customResolver, evaluateXPath, namespace, node, segment;
        if (root == null) {
            root = document;
        }
        evaluateXPath = function(xp, nsResolver) {
            var exception;
            if (nsResolver == null) {
                nsResolver = null;
            }
            try {
                // return document.evaluate("." + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                return document.getElementById(xp.substring(1));
            } catch (_error) {
                exception = _error;
                console.log('XPath evaluation failed.');
                console.log('Trying fallback...');
                return Annotator.Util.nodeFromXPath(xp, root);
            }
        };
        if (!$.isXMLDoc(document.documentElement)) {
            return evaluateXPath(xpath);
        } else {
            customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement : document.ownerDocument.documentElement);
            node = evaluateXPath(xpath, customResolver);
            if (!node) {
                xpath = function() {
                    var _k, _len2, _ref1, _results;
                    _ref1 = xpath.split('/');
                    _results = [];
                    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                        segment = _ref1[_k];
                        if (segment && segment.indexOf(':') === -1) {
                            _results.push(segment.replace(/^([a-z]+)/, 'xhtml:$1'));
                        } else {
                            _results.push(segment);
                        }
                    }
                    return _results;
                }().join('/');
                namespace = document.lookupNamespaceURI(null);
                customResolver = function(ns) {
                    if (ns === 'xhtml') {
                        return namespace;
                    } else {
                        return document.documentElement.getAttribute('xmlns:' + ns);
                    }
                };
                node = evaluateXPath(xpath, customResolver);
            }
            return node;
        }
    };

    Annotator.Range.NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
        var end, serialization, start;
        serialization = function(node, isEnd) {
            var n, nodes, offset, origParent, textNodes, xpath, _k, _len2;
            if (ignoreSelector) {
                origParent = $(node).parents(':not(' + ignoreSelector + ')').eq(0);
            } else {
                origParent = $(node).parent();
            }
            xpath = Annotator.Util.xpathFromNode(origParent, root)[0];
            origParent = $(document.getElementById(xpath.substring(1)));//ck12
            textNodes = Annotator.Util.getTextNodes(origParent);
            nodes = textNodes.slice(0, textNodes.index(node));
            offset = 0;
            for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
                n = nodes[_k];
                if(n.nodeValue.trim().length > 0) {
                    offset += n.nodeValue.length;
                }
            }
            if (isEnd) {
                return [xpath, offset + node.nodeValue.length];
            } else {
                return [xpath, offset];
            }
        };
        start = serialization(this.start);
        end = serialization(this.end, true);
        return new Annotator.Range.SerializedRange({
            start: start[0],
            end: end[0],
            startOffset: start[1],
            endOffset: end[1]
        });
    };
    Annotator.Range.BrowserRange.prototype.normalize = function(root) {
        var n, node, nr, r;
        if (this.tainted) {
          console.error(_t("You may only call normalize() once on a BrowserRange!"));
          return false;
        } else {
          this.tainted = true;
        }
        r = {};
        if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
          while(!getFirstTextNode(this.startContainer)){
            this.startContainer  = this.startContainer.parentNode;
          }
          r.start = Annotator.Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
          r.startOffset = 0;
        } else {
          r.start = this.startContainer;
          r.startOffset = this.startOffset;
        }

        if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
          node = this.endContainer.childNodes[this.endOffset];
          if (node != null) {
            n = node;
            while ((n != null) && (n.nodeType !== Node.TEXT_NODE)) {
              n = n.firstChild;
            }
            if (n != null) {
              r.end = n;
              r.endOffset = 0;
            }
          }
          if (r.end == null) {
            if (this.endOffset) {
              node = this.endContainer.childNodes[this.endOffset - 1];
            } else {
              node = this.endContainer.previousSibling;
            }
            r.end = Annotator.Util.getLastTextNodeUpTo(node);
            if(r.end){
                r.endOffset = r.end.nodeValue.length;
            }
          }
        } else {
          r.end = this.endContainer;
          r.endOffset = this.endOffset;
        }
        nr = {};
        if (r.startOffset > 0) {
          if (r.start.nodeValue.length > r.startOffset) {
            nr.start = r.start.splitText(r.startOffset);
          } else {
            nr.start = r.start.nextSibling;
            if(nr.start && nr.start.nodeType !== Node.TEXT_NODE){
                nr.start = findFirstTextNode(nr.start);
            }
          }
        } else {
          nr.start = r.start;
        }
        if (r.start === r.end) {
          if (nr.start.nodeValue.length > (r.endOffset - r.startOffset)) {
            nr.start.splitText(r.endOffset - r.startOffset);
          }
          nr.end = nr.start;
        } else {
          if (r.end && r.end.nodeValue.length > r.endOffset) {
            r.end.splitText(r.endOffset);
          }
          nr.end = r.end;
        }
        nr.commonAncestor = this.commonAncestorContainer;
        while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
          nr.commonAncestor = nr.commonAncestor.parentNode;
        }
        return new Annotator.Range.NormalizedRange(nr);
      }
      Annotator.prototype.destroy = function() {
          var idx, name, plugin, _base, _ref;
          Annotator.__super__.destroy.apply(this, arguments),
          $(document).unbind({
              mouseup: this.checkForEndSelection,
              mousedown: this.checkForStartSelection
          }),
          $("#annotator-dynamic-style").remove(),
          this.adder.remove(),
          this.viewer.destroy(),
          this.editor.destroy(),
          this.wrapper.find(".annotator-hl").each(function() {
              return $(this).contents().insertBefore(this),
              $(this).remove();
          }),
        //   this.wrapper.contents().insertBefore(this.wrapper),
        //   this.wrapper.remove(),
          this.element.data("annotator", null ),
          _ref = this.plugins;
          for (name in _ref)
              plugin = _ref[name],
              "function" == typeof (_base = this.plugins[name]).destroy && _base.destroy();
          if (idx = Annotator._instances.indexOf(this),
          idx !== -1)
              return Annotator._instances.splice(idx, 1);
      }
    ////////////
    // Viewer //
    ////////////
    Annotator.Viewer.prototype.onButtonClick = function(event, type) {
        var item = $(event.target).parents(".annotator-annotation");
        var annotation = item.data('annotation');
        if(type === 'delete'){
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_NOTE', {
                    artifactID: window.artifactID,
                    artifactRevisionID: window.artifactRevisionID,
                    color: annotation.highlightColor,
                    source : 'multiple_side_note',
                    annotationID: annotation.id,
                    action: 'delete'
                });
            }
        }

        this.publish(type, [item.data("annotation")]);
    }
    ////////////
    // Editor //
    ////////////
    Annotator.Editor.prototype.setupDraggables = function () {

    };
    Annotator.Editor.prototype.addField = function(options) {
        var $element, field, $innerEl;

        field = $.extend({
            id: 'annotator-field-' + Annotator.Util.uuid(),
            type: 'input',
            label: '',
            load: function() {},
            submit: function() {}
        }, options);

        $element = $('<li class="annotator-item" />');
        field.element = $element[0];

        if(field.innerHTML){
            $innerEl = $(field.innerHTML);
        } else {
            switch (field.type) {
            case 'textarea':
                $innerEl = $('<textarea />');
                break;
            case 'input':
            case 'checkbox':
                $innerEl = $('<input />');
                break;
            case 'select':
                $innerEl = $('<select />');
            }
        }

        $innerEl.attr({
            id: field.id,
            placeholder: !field.innerHTML ? field.label : null
        });

        $element
            .attr({
                id: field.ck12ID || null
            })
            .append($innerEl);

        if (field.type === 'checkbox') {
            $innerEl[0].type = 'checkbox';
            $element.addClass('annotator-checkbox');
            $element.append($('<label />', {
                'for': field.id,
                html: field.label
            }));
        }

        this.element.find('ul:first').prepend($element);
        this.fields.push(field);
        return field.element;
    };

    ////////////
    // Widget //
    ////////////

    Annotator.Widget.prototype.checkOrientation = function() {
        var current, offset, viewport, widget, window;
        this.resetOrientation();
        window = $(Annotator.Util.getGlobal());
        widget = this.element.children(':first');
        offset = widget.offset();
        viewport = {
            top: window.scrollTop()+100,
            right: window.width() + window.scrollLeft()
        };
        var container = $('.annotator-wrapper').parent()[0].getBoundingClientRect();
        current = {
            top: offset.top,
            right: offset.left + widget.width()
        };
        if (current.top - viewport.top < 0 || current.top - container.top < 0) {
            this.invertY();
        }
        if (current.right - container.right > 0) {
            this.invertX();
        }
        return this;
    };

    // Annotator.Viewer.prototype.html = {
    //     element: '<div class="annotator-outer annotator-viewer">\n  <ul class="annotator-widget annotator-listing"></ul>\n</div>',
    //     item: '<li class="annotator-annotation annotator-item">\n  <span class="annotator-controls">\n    <a href="#" title="View as webpage" class="annotator-link">View as webpage</a>\n    <button title="Edit" class="annotator-edit">Edit</button>\n   </span>\n</li>'
    // };
});
