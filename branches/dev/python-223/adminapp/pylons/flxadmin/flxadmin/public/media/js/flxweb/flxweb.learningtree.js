var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

var server = '/learningtree';
var nodes = new Hash();
var pageSize = 10;
var artifactColor = '#DD7A26';
var exerciseSelectedColor = '#8467D7'; 
//
// Add a node to nodes hash map - recursively
//
function addNodeToHash(node) {
    if (nodes.get(node.id) == null) {
        obj = {};
        if ('kind' in node) {
            obj['kind'] = node.kind;
        }
        if ('hasChildren' in node) {
            obj['hasChildren'] = node.hasChildren;
        }
        if ('artifactCount' in node) {
            obj['artifactCount'] = node.artifactCount;
        }
        if ('perma' in node) {
            obj['perma'] = node.perma;
            if ('anchor' in node && node.anchor != '') {
                obj['perma'] += node.anchor;
            }
        }
        if ('name' in node) {
            obj['name'] = node.name;
        }
        if ('numChildren' in node) {
            obj['numChildren'] = node.numChildren;
            obj['pages'] = Math.ceil(node.numChildren/pageSize);
            if ('page' in node) {
                obj['page'] = node.page;
            } else {
                obj['page'] = 1;
            }
        }
        nodes.set(node.id, obj);
    }
    if ( 'children' in node ) {
        for (var i = 0; i < node.children.length; i++) {
            addNodeToHash(node.children[i]);
        }
    }
}

//
// Get the next levels of tree -- this currently only works with levels=1
//
function getTree(id, levels, callback) {
    // figure out type of the node

    var nodeProps = nodes.get(id);
    var type = nodeProps['kind'];
    var newid = null;
    var page = null;
    var url = server;
    if (type == 'subject') {
        url += '/get/info/branches/' + id + '/';
    } else if (type == 'branch') {
        if ('page' in nodeProps) {
            url += '/get/info/conceptNodes/' + id.replace('.', '/') + '/top/?pageNum=' + nodeProps['page'] + '&pageSize=' + pageSize;
        } else {
            // get all top-level nodes
            var params = id.replace('.', '/');
            url += '/get/info/conceptNodes/' + params + '/top/?pageNum=1&pageSize=' + pageSize;
        }
    } else if (type == 'conceptNode') {
        // conceptNode type
        if (nodeProps['hasChildren']) {
            // If the node has more children, we get the descendants (and directly associated artifacts - if any)
            url += '/get/info/descendant/conceptNodes/' + id + '/' + levels + '/';
        } else if (nodeProps['artifactCount'] > 0) {
            // If the node has directly associated artifacts we get them
            url += '/browse/concepts/' + id + '/';
        } else {
            // Else this is a no-op - will center the clicked node and mark it selected.
            callback(id, []);
            return;
        }
    } else {
        return;
    }
    // Get the next level
    $.ajax({
        url: url,
        type: 'GET', 
        dataType: 'json',
        success: function(data) {
            var output = data;
            if (output.responseHeader.status != 0) {
                alert("Error getting descendants for " + id);
                return;
            }

            var json = output;
            if (type == 'subject') {
                for (var i = 0; i < json.response.branches.length; i++) {
                    addNodeToHash(json.response.branches[i]);
                }
                json = { 'id': id, 'children': json.response.branches };
                callback(id, json);
            } else if (type == 'branch') {
                for (var i = 0; i < json.response.conceptNodes.length; i++) {
                    addNodeToHash(json.response.conceptNodes[i]);
                }
                var total = json.response.total;
                var numPages = Math.ceil(total/pageSize);
                var curPage = json.response.offset/pageSize + 1;
                nodes.get(id)['pages'] = numPages;
                nodes.get(id)['page'] = curPage;
                json = { 'id': id, 'children': json.response.conceptNodes };
                callback(id, json);
            } else {
                if (nodeProps['hasChildren']) {
                    addNodeToHash(json.response.conceptNode);
                    callback(id, json.response.conceptNode);
                } else if (nodeProps['artifactCount'] > 0) {
                    for (var i = 0; i < json.response.results.length; i++) {
                        addNodeToHash(json.response.results[i]);
                    }
                    json = { 'id': id, 'children': json.response.results };
                    callback(id, json);
                }
            }
        },
        error: function(xhr, code, err) {
            alert("Failed to get descendants for " + id + ', error code: ' + code + ', msg: ' + err);
        }
    });
}

//
// Get all subjects - which is level 1
// We then add a sudo root as parent of all subjects
//
var getSubjects = function() {
    // Get subjects
    $.ajax({
        url: server + '/get/info/subjects/',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var output = data;
            if (output.responseHeader.status != 0) {
                alert("Error getting subject names");
                return;
            }

            var json = output;
            var subjects = json.response.subjects;
            json = { 'id': 'root', 'name': 'Mathematics and Science', 'hasChildren': true, 'children': subjects };
            addNodeToHash(json);

            //load json data
            st.loadJSON(json);
            //compute node positions and layout
            st.compute();
            //emulate a click on the root node.
            st.select(st.root);
        },
        error: function(xhr, code, err) {
            alert('Failed to get subjects. Error code:' + code + ', message: ' + err);
        }
    });
}

//
// Mark a node selected without using animation - this is used when the tree needs to be shown 
// expanded.
//
function selectPath(node, selectedNode) {
    addNodeToHash(node);
    if ('children' in node && node['children'].length > 0) {
        st.select(node.id);
        if ('page' in node) {
            addPagerCode(node.id, nodes.get(node.id)['label']);
        }
        for (var i = 0; i < node['children'].length; i++) {
            selectPath(node['children'][i], selectedNode);
        }
    }
}

//
// Used to get precreated tree when a specific node
// needs to be shown as selected 
// (when jumping from details page to the tree view)
//
var initializeTree = function(id) {
    var jsonData = {};
   // Get ancestors
   $.ajax({
        url: server + '/get/info/tree/' + id + '/',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var output = data;
            if (output.responseHeader.status != 0) {
                alert('Error getting ancestors');
                return;
            }

            var subjects = output.response.subjects;
            var selectedNode = $('#selectedNode').val();
            var json = { 'id': 'root', 'name': 'Mathematics and Science', 'children': subjects, 'hasChildren': true };

            //load json data
            st.loadJSON(json);
            //compute node positions and layout
            st.compute();
            selectPath(json, selectedNode);
        }
    });
}

var setPage = function(incre, id) {
    nodes.get(id)['page'] += incre;
    addPagerCode(id, nodes.get(id)['label']);
    if (st.clickedNode.id != id) {
        st.clickedNode = st.graph.getNode(id);
    }
    st.removeSubtree(id, false, 'replot');
}

var addPagerCode = function(id, label) {
    var nodeProps = nodes.get(id);
    if (nodeProps['pages'] <= 1) {
        return;
    }
    var divID = id + '_pager';

    var pagerActive = ' cursor:text; color:#999; ';
    var onclick = '';
    if (nodeProps['page'] > 1) {
        pagerActive = ' cursor:pointer; ';
        onclick = ' onclick="setPage(-1, \'' + id + '\'); return false;" ';
    }
    var pn = '<div class="pager-prev" style="text-decoration:none;' + pagerActive + '"' + onclick + '>&lt;</div>';

    pagerActive = ' cursor:text; color:#999; ';
    onclick = '';
    pn += '<div class="pager-pages" style="text-decoration:none;' + pagerActive + '">' + nodeProps['page'] + ' of ' + nodeProps['pages'] + '</div>';

    if (nodeProps['page'] < nodeProps['pages']) {
        pagerActive = ' cursor:pointer; ';
        onclick = ' onclick="setPage(1, \'' + id + '\'); return false;" ';
    }
    pn += '<div' + onclick + 'class="pager-next" style="text-decoration:none;' + pagerActive + '">&gt;</div>';

    if ($('div#' + divID).length > 0) {
        $('div#' + divID).html(pn);
    } else {
        var html = label.innerHTML;
        var pos = html.indexOf('div');
        if (pos != -1) {
            html = html.substring(0, pos-1);
        }
        label.innerHTML = html + '<div id="' + divID + '">' + pn + '</div>';
    }
}

var st = null;
var mode = null;

function init(mode) {
    mode = mode;     
    //Implement a node rendering function called 'nodeline' that plots a straight line
    //when contracting or expanding a subtree.
    $jit.ST.Plot.NodeTypes.implement({
        'nodeline': {
          'render': function(node, canvas, animating) {
                if(animating === 'expand' || animating === 'contract') {
                  var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
                  var width  = nconfig.width, height = nconfig.height;
                  var algnPos = this.getAlignedPos(pos, width, height);
                  var ctx = canvas.getCtx(), ort = this.config.orientation;
                  ctx.beginPath();
                  if(ort == 'left' || ort == 'right') {
                      ctx.moveTo(algnPos.x, algnPos.y + height / 2);
                      ctx.lineTo(algnPos.x + width, algnPos.y + height / 2);
                  } else {
                      ctx.moveTo(algnPos.x + width / 2, algnPos.y);
                      ctx.lineTo(algnPos.x + width / 2, algnPos.y + height);
                  }
                  ctx.stroke();
              } 
          }
        }
          
    });

    //init Spacetree
    //Create a new ST instance
    st = new $jit.ST({
        'injectInto': 'infovis',
        //set duration for the animation
        duration: 500,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //set max levels to show. Useful when used with
        //the request method for requesting trees of specific depth
        levelsToShow: 1,
        Navigation: {
            enable: true,
            panning: 'avoid nodes',
        },

        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 50,
            width: 200,
            //use a custom
            //node rendering function
            type: 'nodeline',
            color:'#646F75',
            lineWidth: 2,
            align:"center",
            verticalAlign:"middle",
            overridable: true,
            margin: 0
        },
        
        Edge: {
            type: 'bezier',
            lineWidth: 2,
            color:'#646F75',
            overridable: true
        },

        Tips: {
            enable: true,
            type: 'auto',
            onShow: function(tip, node) {
                var nodeProps = nodes.get(node.id);
                if (nodeProps != null) {
                    if (nodeProps['kind'] == 'artifact') {

                        if (mode == 'concept') {  
                            tip.innerHTML = 'Click to view ' + node.name;
                        } else if (mode == 'exercise' && selectedNodes.indexOf(node.id) == -1) {
                            tip.innerHTML = 'Click to add ' + node.name;
                        } 
                    } else {
                        tip.innerHTML = node.id;
                    }
                }
            }
        },
        
        //Add a request method for requesting on-demand json trees. 
        //This method gets called when a node
        //is clicked and its subtree has a smaller depth
        //than the one specified by the levelsToShow parameter.
        //In that case a subtree is requested and is added to the dataset.
        //This method is asynchronous, so you can make an Ajax request for that
        //subtree and then handle it to the onComplete callback.
        //Here we just use a client-side tree generator (the getTree function).
        request: function(nodeId, level, onComplete) {
            var nodeProps = nodes.get(nodeId);
            if (nodeProps == null || nodeProps['kind'] != 'artifact') {
                getTree(nodeId, level, onComplete.onComplete);
            } else {
                onComplete.onComplete(nodeId, []);
            }
        },
        
        onBeforeCompute: function(node){
            Log.write("loading " + node.name);
        },
        
        onAfterCompute: function(){
            Log.write("done");
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            var nodeProps = nodes.get(node.id);
            nodes.get(node.id)['label'] = label;
            label.id = node.id;            
            label.onclick = function(){
                if (nodeProps != null && nodeProps['kind'] == 'artifact') {
                    if (nodeProps['perma'].indexOf('http') == 0) {
                        window.open(nodeProps['perma'], 'ck12');
                    } else {
                        if(mode == 'concept') {
                            window.location = '/' + nodeProps['perma'];
                        } else if (mode == 'exercise' && selectedNodes.indexOf(node.id) == -1) {
                            var style = label.style;
                            style.color = exerciseSelectedColor;
                            addToSelectedExerciseNodes(node.id)
                            try {
                                addToWorkBookToc(node.id, node.name)
                            } catch (err) {
                                alert(err)
                            }
                        }
                   }
                } else {
                    st.select(node.id);
                }
            };
            //set label styles
            var style = label.style;
            style.width = 200 + 'px';
            style.color = '#999';
            style.fontSize = '1em';
            // style.height = 17 + 'px';            
            if (nodeProps != null && nodeProps['kind'] == 'artifact') {
                style.color = artifactColor;
                //Styling automatically added exercise nodes   
                if (mode == 'exercise' && selectedNodes.indexOf(node.id) != -1) {
                    style.color = exerciseSelectedColor;
                }  
                style.fontWeight = 'bold';
                style.cursor = 'pointer';
                style.padding = '2px';
                style.margin = '0 0 15px 0';
                style.backgroundColor = '#DD7A26'
            }
            style.backgroundColor = 'transparent';
            style.textAlign= 'left';
            style.textDecoration = 'none';
            var spanStyle = '';
            if (nodeProps != null 
                    && ('artifactCount' in nodeProps && nodeProps['artifactCount'] > 0) 
                    || ('hasChildren' in nodeProps && nodeProps['hasChildren'])) {
                spanStyle += 'text-decoration:underline; ';
                style.fontWeight = 'bold';
                style.color = '#333';
                style.cursor = 'pointer';
            }
            style.margin = '10px -10px' ;
            style.padding = '5px 5px 5px 20px';
            style.verticalAlign = 'middle';
            label.innerHTML = '<span style="' + spanStyle + '">' + node.name + '</span>';
            if (nodeProps['kind'] == 'branch' && 'page' in nodeProps) {
                addPagerCode(node.id, label);
            }
        },
        
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#646F75";
            }
            else {
                delete node.data.$color;
            }
        },
        
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#DD7A26";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
    //end

    // Turn the tree top-side
    // st.switchPosition('top', 'animate');
    //end
    //

    var encodedID = $('#encodedID').val();
    if (encodedID == null || encodedID == '') {
        getSubjects();
        if ($('#learningtree_loader')) {
            $('#learningtree_loader').hide();
        }
    } else {
        initializeTree(encodedID);
        if ($('#learningtree_loader')) {
            $('#learningtree_loader').hide();
        }
    }
}
var selectedNodes = [];
function addToSelectedExerciseNodes(nodeId) {
    selectedNodes.push(nodeId);
}
 
function removeFromSelectedExerciseNodes(nodeId) {
    if (selectedNodes.indexOf(nodeId) != -1) {
        selectedNodes.splice(selectedNodes.indexOf(nodeId),1);
        removedNode = document.getElementById(nodeId);
        if (removedNode) {
           removedNode.style.color = artifactColor;  
        }
    }
} 
