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

var server = '/taxonomy';
var data = [];
var adjDict = new Hash();
var nodeList = [];
var fd = null;
var processed = 0;
var done = false;
var lastSeen = 0;
var levels = 0;
var maxLevels = 100;
var stopAt = null;
var foundEnd = false;

function handlePostrequisitesInResponse(id, node) {
    if (adjDict.get(id) == null) {
        var name = id;
        if ('name' in node) {
            name = node.name;
        }
        adj = {'id': id, 'name': name, 'data': { 
                "$color": "#83548B", 
                "$type": "circle"
                }, 'adjacencies': [] };
        adjDict.set(id, adj);
    }
    if (id == stopAt) {
        foundEnd = true;
        return;
    }
    var subject = $('#subjectID').val().toUpperCase();
    var branch = $('#branchID').val().toUpperCase();
    if ('post' in node && !foundEnd) {
        for (var j = 0; j < node.post.length; j++) {
            if (node.post[j].subject.shortname != subject || node.post[j].branch.shortname != branch) {
                continue;
            }
            var myid = node.post[j].encodedID;
            adjDict.get(id)['adjacencies'].push({'nodeTo': myid, 'nodeFrom': id, 'data': { "$direction": [id, myid] }});
            Log.write('Pushed ' + myid + ' into adjacencies for ' + id);
            if (adjDict.get(myid) == null && !done) {
                nodeList.push({'id': myid, 'name': node.post[j].name});
            }
            handlePostrequisitesInResponse(myid, node.post[j]);
        }
        processed ++;
        Log.write('processed: ' + processed + ', nodeList: ' + nodeList.length + ', last:' + nodeList[nodeList.length-1].id + ', levels:' + levels + ', waits:' + waits + ', total dict:' + adjDict.values().length);
    } else if ('postCount' in node) {
        if (node.postCount > 0) {
            processPostRequisites(node.encodedID);
        } 
    }
}

function processPostRequisites(id) {
    // Get the post ids
    new $.ajax({
        url: server + '/get/info/advanced/concepts/' + id + '/3',
        type: 'GET',
        success: function(resp) {
            levels ++;
            var ret = $.parseJSON(resp);
            if (ret.responseHeader.status != 0) {
                alert('Error getting advanced nodes for ' + id);
                return;
            }
            handlePostrequisitesInResponse(id, ret.response);
        },
        error: function(xhr, code, err) {
            alert('Failed to get correct response for advanced nodes: ' + code + ', ' + err);
        }
    });
}

function getPostRequisites() {
    var i = lastSeen;
    while (lastSeen < nodeList.length) {
        var id = nodeList[i].id;
        if (adjDict.get(id) == null) {
            adj = {'id': id, 'name': nodeList[i].name, 'data': { 
                        "$color": "#83548B", 
                        "$type": "circle"
                    }, 'adjacencies': [] };
            adjDict.set(id, adj);
            processPostRequisites(id);
        }
        if (!done) {
            setTimeout('waitForProcessing()', 1000);
        }
        if (done || foundEnd) {
            break;
        }
        i ++;
        lastSeen = i;
    }
}

var waits = 0;
function waitForProcessing() {
    waits++;
    if (processed >= nodeList.length || levels >= maxLevels || foundEnd) {
        if (!done) {
            drawTree(adjDict.values());
            done = true;
        }
        return;
    }

    // continue processing
    getPostRequisites();
}

function getRootNodes() {
    var subject = $('#subjectID').val();
    var branch = $('#branchID').val();
    var startID = $('#startID').val();
    var endID = $('#endID').val();

    if (endID != null && endID != '') {
        stopAt = endID;
    }

    if (startID != null && startID != '') {
        nodeList.push({'id': startID, 'name': $('#startName').val()});
        getPostRequisites();
    } else {
        // No start node specified
        $.ajax({
            url: server + '/get/info/fundamental/concepts/' + subject + '/' + branch,
            type: 'GET',
            success: function(resp) {
                var json = $.parseJSON(resp);
                if (json.responseHeader.status != 0) {
                    alert("Error getting fundamental concepts");
                    return;
                }

                concepts = json.response.conceptNodes;
                for (var i = 0; i < concepts.length; i++) {
                    nodeList.push({'id': concepts[i].encodedID, 'name': concepts[i].name});
                }
                // no root nodes, get the top-level nodes and start from there instead
                if (nodeList.length == 0) {
                    $.ajax({
                        url: server + '/get/info/concepts/' + subject + '/' + branch + '/top',
                        type: 'GET',
                        success: function(resp) {
                            var json = $.parseJSON(resp);
                            if (json.responseHeader.status != 0) {
                                alert("Error getting top-level concepts");
                                return;
                            }

                            concepts = json.response.conceptNodes;
                            for (var i = 0; i < concepts.length; i++) {
                                nodeList.push({'id': concepts[i].encodedID, 'name': concepts[i].name});
                            }
                            getPostRequisites();
                        },
                        error: function(xhr, code, err) {
                            alert('Error getting correct response for top-level concepts: ' + code + ', ' + err);
                        }
                    });
                } else {
                    getPostRequisites();
                }
            },
            error: function(xhr, code, err) {
                alert('Error getting correct response for fundamental concepts: ' + code + ', ' + err);
            }
        });
    }
}

function drawTree(json) {
    Log.write('Drawing ...');
    dumpData(json);
    // load JSON data.
    fd.loadJSON(json);
    // compute positions incrementally and animate.
    fd.computeIncremental({
    iter: 40,
    property: 'end',
    onStep: function(perc){
      Log.write(perc + '% loaded...');
    },
    onComplete: function(){
        rendered = true;
      Log.write('done');
      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2500
      });
    }
  });
}

function dumpData(json) {
    var html = $('#debug').html();
    for (var i = 0; i < json.length; i++) {
        html += i + '. ' + JSON.stringify(json[i]) + '<br/>';
    }
    $('#debug').html(html);
    $('#debug').scrollTop($('#debug')[0].scrollHeight);
}

function init(){
  // init ForceDirected
  fd = new $jit.ForceDirected({
    //id of the visualization container
    injectInto: 'infovis',
    //Enable zooming and panning
    //with scrolling and DnD
    Navigation: {
      enable: true,
      type: 'Native',
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: 'avoid nodes',
      zooming: 10 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true,
      dim: 7
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 0.8,
      type: 'arrow'
    },
    // Add node events
    Events: {
      enable: true,
      type: 'Native',
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
        var pos = eventInfo.getPos();
        node.pos.setc(pos.x, pos.y);
        fd.plot();
      },
      //Implement the same handler for touchscreens
      onTouchMove: function(node, eventInfo, e) {
        $jit.util.event.stop(e); //stop default touchmove event
        this.onDragMove(node, eventInfo, e);
      }
    },
    //Number of iterations for the FD algorithm
    iterations: 200,
    //Edge length
    levelDistance: 130,
    // This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){
      // Create a 'name' and 'close' buttons and add them
      // to the main node label
      var nameContainer = document.createElement('span');
      var closeButton = document.createElement('span');
      var style = nameContainer.style;
      nameContainer.className = 'name';
      nameContainer.innerHTML = node.name;
      // closeButton.className = 'close';
      // closeButton.innerHTML = 'x';
      domElement.appendChild(nameContainer);
      //domElement.appendChild(closeButton);
      style.fontSize = "0.8em";
      style.color = "#ddd";
      style.cursor = 'pointer';
      //Fade the node and its connections when
      //clicking the close button
      closeButton.onclick = function() {
        node.setData('alpha', 0, 'end');
        node.eachAdjacency(function(adj) {
          adj.setData('alpha', 0, 'end');
        });
        fd.fx.animate({
          modes: ['node-property:alpha',
                  'edge-property:alpha'],
          duration: 500
        });
      };
      //Toggle a node selection when clicking
      //its name. This is done by animating some
      //node styles like its dimension and the color
      //and lineWidth of its adjacencies.
      nameContainer.onclick = function() {
        //set final styles
        fd.graph.eachNode(function(n) {
          if(n.id != node.id) delete n.selected;
          n.setData('dim', 7, 'end');
          n.eachAdjacency(function(adj) {
            adj.setDataset('end', {
              lineWidth: 0.8,
              color: '#23a4ff'
            });
          });
        });
        if(!node.selected) {
          node.selected = true;
          node.setData('dim', 17, 'end');
          node.eachAdjacency(function(adj) {
            adj.setDataset('end', {
              lineWidth: 3,
              color: '#36acfb'
            });
          });
        } else {
          delete node.selected;
        }
        //trigger animation to final styles
        fd.fx.animate({
          modes: ['node-property:dim',
                  'edge-property:lineWidth:color'],
          duration: 500
        });
        // Build the right column relations list.
        // This is done by traversing the clicked node connections.
        var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
            list = [];
        node.eachAdjacency(function(adj){
          if(adj.getData('alpha')) list.push(adj.nodeTo.name);
        });
        //append connections information
        $jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
      };
    },
    // Change node styles when DOM labels are placed
    // or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
      style.top = (top + 10) + 'px';
      style.display = '';
    }
  });

  getRootNodes();

  // end
}

$(document).ready(function() {
    init();
});
