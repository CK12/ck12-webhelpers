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

function getTree(id, levels, onComplete) {
    // figure out type of the node
    var type = 'conceptNode';
    var parts = id.split('.');
    if (parts.length == 1) {
        type = 'subject';
    } else if (parts.length == 2) {
        type = 'branch';
    }

    var url = server;
    if (type == 'subject') {
        url += '/get/info/branches/' + id;
    } else if (type == 'branch') {
        // get all top-level nodes
        url += '/get/info/concepts/' + parts[0] + '/' + parts[1] + '/top';
    } else {
        url += '/get/info/descendants/concepts/' + id + '/' + levels;
    }
    $.ajax({
        url: url,
        type: 'GET', 
        success: function(data) {
            output = $.parseJSON(data);
            if (output.responseHeader.status != 0) {
                alert("Error getting descendants for " + id);
                return;
            }

            var text = data.replace(/encodedID/g, 'id');
            text = text.replace(/shortname/g, 'id');

            var json = $.parseJSON(text);
            if (type == 'subject') {
                for (var i = 0; i < json.response.branches.length; i++) {
                    json.response.branches[i].id = id + '.' + json.response.branches[i].id;
                    json.response.branches[i].name = titleCaps(json.response.branches[i].name);
                }
                json = { 'id': id, 'children': json.response.branches };
                onComplete(id, json);
            } else if (type == 'branch') {
                json = { 'id': id, 'children': json.response.conceptNodes };
                onComplete(id, json);
            } else {
                onComplete(id, json.response.conceptNode);
            }
        },
        error: function(xhr, code, err) {
            alert("Failed to get descendants for " + id + ', error code: ' + code + ', msg: ' + err);
        }
    });
}

var getSubjects = function() {
    // Get subjects
    $.ajax({
        url: server + '/get/info/subjects',
        type: 'GET',
        success: function(data) {
            output = $.parseJSON(data);
            if (output.responseHeader.status != 0) {
                alert("Error getting subject names");
                return;
            }

            var text = data.replace(/shortname/g, 'id');
            var json = $.parseJSON(text);
            var subjects = json.response.subjects;
            for (var i = 0; i < subjects.length; i++) {
                subjects[i].name = titleCaps(subjects[i].name);
            }
            json = { 'id': 'root', 'name': 'Mathematics and Science', 'children': subjects };

            //load json data
            st.loadJSON(json);
            //compute node positions and layout
            st.compute();
            //emulate a click on the root node.
            st.onClick(st.root);
        },
        error: function(xhr, code, err) {
            alert('Failed to get subjects. Error code:' + code + ', message: ' + err);
        }
    });
}


var st = null;

function init() {

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
        duration: 800,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //set max levels to show. Useful when used with
        //the request method for requesting trees of specific depth
        levelsToShow: 1,
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 40,
            width: 140,
            //use a custom
            //node rendering function
            type: 'nodeline',
            color:'#23A4FF',
            lineWidth: 2,
            align:"center",
            verticalAlign:"middle",
            overridable: true
        },
        
        Edge: {
            type: 'bezier',
            lineWidth: 2,
            color:'#23A4FF',
            overridable: true
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
            getTree(nodeId, level, onComplete.onComplete);
          // var ans = getTree(nodeId, onComplete);
          // onComplete.onComplete(nodeId, ans);  
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
            label.id = node.id;            
            label.innerHTML = node.name;
            label.onclick = function(){
                st.onClick(node.id);
            };
            //set label styles
            var style = label.style;
            style.width = 140 + 'px';
            style.height = 17 + 'px';            
            style.cursor = 'pointer';
            style.color = '#fff';
            //style.backgroundColor = '#1a1a1a';
            style.fontSize = '0.7em';
            style.textAlign= 'center';
            style.textDecoration = 'none';
            style.paddingTop = '3px';
            style.verticalAlign = 'middle';
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
                node.data.$color = "#ff7";
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
                adj.data.$color = "#eed";
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

    getSubjects();

}
