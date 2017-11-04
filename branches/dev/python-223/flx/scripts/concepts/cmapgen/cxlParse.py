from xml.etree.ElementTree import ElementTree
import sys
import urllib2, json
import codecs

from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options

cache_opts = {
            'cache.type': 'file',
            'cache.data_dir': '/tmp/cxl_cache/data',
            'cache.lock_dir': '/tmp/cxl_cache/lock',
            }

cache = CacheManager(**parse_cache_config_options(cache_opts))
remote_server = 'http://www.ck12.org'

@cache.cache('getJsonResponse', type='file', expire=86400)
def getJsonResponse(url):
    f = urllib2.urlopen(url)
    webstring = f.read()
    j = json.loads(webstring)
    f.close()
    return j

#********************************************************************
#
# Initializations and Define Parameters 
#
#********************************************************************

# Define data structure for concept node information
# ntype flag key:
#   0: root node
#   1: chapter level (also used as default for missing link/encode cases)
#   2: concept level
#   3: junction node
class cnode:
    def __init__(self):
        self.id   = ''
        self.name = ''
        self.x    = ''
        self.y    = ''
        self.encode = ''
        self.ntype = 1 
	self.nchild = 0
	self.child = []

# Name of div container that map will reside in
divname = 'holder'

# Display attributes for map
rootboxcolor = '#7cbf00'
roottextcolor = 'white'
roottextcolor = '#000000'
roottextsize = '24'
rootboxthick = '4'

chapboxcolor = '#bf5600'
chaptextcolor = '#bf5600'
chaptextcolor = '#666666'
chaptextsize = '14'
chapboxthick = '3'

boxcolor = '#bf5600'
textcolor = 'white'
textcolor = '#000000'
hovercolor = '#bf5600'
#hovercolor = '#6D7B8D'
textsize = '14'
boxthick = '3'

linecolor = '#333333'
linethick = '3'

# Flag for generating artifact icons within node boxes
showIcons = True
hideConceptIcon = True


#********************************************************************
#
# Parse data from CXL file
#
#********************************************************************

# Read in name of cxl file from command line
fname = None
try:
    if len(sys.argv) > 1:
        fname = sys.argv[1]
    if not fname:
        raise Exception("Please specify an input CXL file")
except Exception, e:
    print str(e)
    sys.exit(1)

# Parse CXL data
tree = ElementTree()
tree.parse(fname)

nlist = []

# Populate list of node ids and concept names and flag root node
for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}concept'):
    nlist.append(cnode())
    i = len(nlist)-1
    nlist[i].id = node.attrib.get('id')
    nlist[i].name = node.attrib.get('label')
    nlist[i].name = nlist[i].name.rstrip()
    if len(nlist[i].name.split('['))==1:
        nlist[i].ntype = 0

# Assign x and y coord to corresponding node
cnt = 0
njunc = 0
for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}concept-appearance'):
    if node.attrib.get('id') == nlist[cnt].id:
        nlist[cnt].x = node.attrib.get('x')
        nlist[cnt].y = node.attrib.get('y')
        cnt = cnt+1
    else:
        print 'Error: Node ID mismatch'

# Parse junction points (linking phrase) from cxl and flag
for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}linking-phrase'):
    nlist.append(cnode())
    nlist[len(nlist)-1].id = node.attrib.get('id')
    nlist[len(nlist)-1].ntype = 3
    njunc = njunc + 1

# Assign x and y coord to junction points; cnt starts from number of nodes above
for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}linking-phrase-appearance'):
    if node.attrib.get('id') == nlist[cnt].id:
        nlist[cnt].x = node.attrib.get('x')
        nlist[cnt].y = node.attrib.get('y')
        cnt = cnt+1
    else:
        print 'Error: Node ID mismatch'

# Strip encode ID from concept/chapter names and store in list
for i in range(len(nlist)):
    if nlist[i].ntype != 0 and nlist[i].ntype != 3:
        tmpstr = nlist[i].name.split('[')
        if len(tmpstr)==2:
            nlist[i].encode = tmpstr[1]
            nlist[i].encode = nlist[i].encode.rstrip(']')

            nlist[i].name = tmpstr[0]
            nlist[i].name = nlist[i].name.rstrip('\n')
        else:
            print 'Error: Concept name and encode ID could not be split. Possible missing encode ID:\n'
            print 'Concept Name:\n'
            print str(nlist[i].name)
            sys.exit(1)

# Parse connectivity information from cxl to populate node children
for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}connection'):
    fid = node.attrib.get('from-id')
    tid = node.attrib.get('to-id') 
    for i in range(len(nlist)):
        if nlist[i].id == tid:
            ichild = i
    for i in range(len(nlist)):
        if nlist[i].id == fid:
            nlist[i].nchild = nlist[i].nchild + 1
            nlist[i].child.append(ichild)


#********************************************************************
#
# Adjustments to normalize positions of nodes 
#
#********************************************************************

# Find size of map
xcoord = []
ycoord = []
for node in nlist:   
    xcoord.append(int(node.x))
    ycoord.append(int(node.y))

xmargin = 200
ymargin = 100
width = max(xcoord) - min(xcoord) + 2*xmargin
height = max(ycoord) - min(ycoord) + 2*ymargin

# Shift nodes so that they are fitted to container
for node in nlist:
    node.x = str(int(node.x) - min(xcoord) + xmargin)
    node.y = str(int(node.y) - min(ycoord) + ymargin)


#********************************************************************
#
# Get concept links via API call
#
#********************************************************************
link = []
conceptDetailLinks = {}
for i in range(len(nlist)):
    link.append('')
    
    if nlist[i].ntype != 0 and nlist[i].ntype != 3:
        # API request
        url = remote_server + '/flx/browse/concept/'+str(nlist[i].encode)+'?pageSize=1'
        artifacts = getJsonResponse(url)

        response = artifacts['response']
    
        if response.get(str(nlist[i].encode)):
            artifact = dict(response[str(nlist[i].encode)][0])
            
            # Set link to concept
            cname = nlist[i].name.encode("utf-8").replace('\n', ' ')
            link[i] = link[i] + str(artifact['artifactType']) + '/' + artifact['handle']
            if artifact['realm']:
                link[i] = link[i] + '/' + str(artifact['realm'])
            if link[i] and not link[i].startswith('/'):
                link[i] = '/' + link[i]
            conceptDetailLinks[str(nlist[i].encode)] = link[i]
            link[i] = link[i] + '/#' + cname

            # Flag as linked concept
            nlist[i].ntype = 2
  

#********************************************************************
#
# Get video links via API call
#
#********************************************************************
vidArtifact = []
vidlink = []
numVids = 0
for i in range(len(nlist)):
    vidArtifact.append(False)
    vidlink.append('')
    
    eid = str(nlist[i].encode)
    if nlist[i].ntype != 0 and nlist[i].ntype != 3:
        # API request here
        # Set vidArtifact[i] == True if video artifact exists
        # place link to artifact in vidLink[i]
        url = remote_server + '/flx/get/info/artifact/resources/'+eid+'/video,cover%20video,interactive'
        videos = getJsonResponse(url)

        response = videos['response']
    
        if response.get('resources') and len(response['resources']) > 0:
            print "Got %d videos for %s" % (len(response['resources']), eid)
            vidArtifact[i] = True
            if conceptDetailLinks.get(eid):
                vidlink[i] = conceptDetailLinks.get(eid) + '/#view_videos'
            numVids += len(response['resources'])
        else:
            print "!!! No videos found for %s" % eid
print "Found total videos: %d" % numVids

#********************************************************************
#
# Get exercise links via API call
#
#********************************************************************
exArtifact = []
exlink = []
numEx = 0
for i in range(len(nlist)):
    exArtifact.append(False)
    exlink.append('')
    
    if nlist[i].ntype != 0 and nlist[i].ntype != 3:
        # API request here        
        # set exArtifact[i] == True if exercise artifact exists
        # place link to artifact in exLink[i]
        # API request
        eid = str(nlist[i].encode)
        url = remote_server + '/hwp/get/info/exercise/encodedid/'+eid+'.L.1'
        exercises = getJsonResponse(url)

        response = exercises['response']
    
        if response.get('exercise') and response['exercise'].get('questions') and len(response['exercise']['questions']) > 0:
            print "Got %d exercises for %s" % (len(response['exercise']['questions']), eid)
            exArtifact[i] = True
            if conceptDetailLinks.get(eid):
                exlink[i] = conceptDetailLinks.get(eid) + '/#view_exercises'
            numEx += len(response['exercise']['questions'])
        else:
            print "!!! No exercises found for %s" % eid
print "Found total exercises: %d" % numEx

#********************************************************************
#
# Get attachments links via API call
#
#********************************************************************
attArtifact = []
attlink = []
numAtt = 0
for i in range(len(nlist)):
    attArtifact.append(False)
    attlink.append('')
    
    if nlist[i].ntype != 0 and nlist[i].ntype != 3:
        # API request
        eid = str(nlist[i].encode)
        url = remote_server + '/flx/get/info/artifact/resources/'+eid+'/resource?attachmentsOnly=true'
        attachments = getJsonResponse(url)

        response = attachments['response']
    
        if response.get('resources') and len(response['resources']) > 0:
            print "Got %d attachments for %s" % (len(response['resources']), eid)
            attArtifact[i] = True
            if conceptDetailLinks.get(eid):
                attlink[i] = conceptDetailLinks.get(eid) + '/#view_attachments'
            numAtt += len(response['resources'])
        else:
            print "!!! No attachments found for %s" % eid
print "Found total attachments: %d" % numAtt

#********************************************************************
#
# Write header of javascript output file
#
#********************************************************************

# Generate Raphaeljs code for node placement
f = codecs.open('map.js','w','utf-8')

# Write header stuff
f.write("function initMap() { \n\n")
f.write('// Set size parameters \n')
f.write("mapWidth = "+str(width)+"; \n")
f.write("mapHeight = "+str(height)+"; \n")
f.write("var holder = document.getElementById('"+ divname + "'); \n");
f.write("boxWidth = holder.getElementWidth();\n");
f.write("boxHeight = holder.getElementHeight();\n");
f.write("canvasWidth = boxWidth; \n")
f.write("canvasHeight = boxHeight; \n")
f.write("aspectRatio = boxWidth/boxHeight; \n")
f.write("zoomFactor = 5; \n\n")
f.write("// Create Raphael canvas for map \n")
f.write("paper = Raphael(document.getElementById('"+ divname +"'), '100%', '100%');\n\n")

# Write position of root node for centering
for node in nlist:
    if node.ntype == 0:
        f.write('// Define view center position \n')
        f.write("rootx = "+str(node.x)+"; \n")
        f.write("rooty = "+str(node.y)+"; \n")
f.write("\n")

# Initial zoom to center on root
f.write("xorig = rootx-boxWidth/2; \n")
f.write("yorig = rooty; \n")
f.write("} \n\n")


#********************************************************************
#
# Write js function to set snap node locations to grid
#
#********************************************************************

f.write("function snapGrid() { \n\n")
f.write("var xint = Math.round(mapWidth/15) + 1; \n")
f.write("var yint = Math.round(mapHeight/15) + 1; \n\n")
f.write("var xgrid = new Array(); \n")
f.write("var ygrid = new Array(); \n\n")
f.write("for (var i = 0; i < xint; i++) xgrid[i] = i*15; \n")
f.write("for (var i = 0; i < yint; i++) ygrid[i] = i*15; \n\n")
f.write("for (var i = 0; i < nnodes; i++) { \n")
f.write("    nx[i] = Raphael.snapTo(xgrid,nx[i],7.5); \n")
f.write("    ny[i] = Raphael.snapTo(ygrid,ny[i],7.5); \n")
f.write("} \n")
f.write("} \n\n")


#********************************************************************
#
# Write js function to set node positions to original/default
#
#********************************************************************

f.write("function defPos() { \n\n")
f.write("nnodes = "+ str(len(nlist)) +"; \n")
f.write("njunc = "+ str(njunc) +"; \n\n")

for i in range(len(nlist)):
    f.write("nx["+ str(i) +"]=" + str(nlist[i].x) +";\n")
    f.write("ny["+ str(i) +"]=" + str(nlist[i].y) +";\n")

f.write("\n")
f.write("// snapGrid(); \n")

f.write("} \n\n")


#********************************************************************
#
# Write js function to set immediate family connections
#
#********************************************************************

f.write("function family(i) { \n\n")
f.write("var members = new Array(); \n\n")

for i in range(len(nlist)):
    # Add children of node i to family
    family = []
    family.extend(nlist[i].child)

    # Find parent(s) of node i and append
    for j in range(len(nlist)):
        if i in nlist[j].child:
            family.append(j)

            # Find sibblings of node i and append
            family.extend(nlist[j].child)

    # Remove repeated members and node i
    family = list(set(family))
    if family.count(i): family.remove(i)

    # Write family members
    f.write("members["+str(i)+"]="+str(family)+"; \n")

f.write("\n")
f.write("return members[i]; \n")
f.write("} \n\n")
    

#********************************************************************
#
# Write js function that draws concept map
#
#********************************************************************

# Write function to draw node boxes
f.write("function drawMap(sfac) { \n\n")

f.write("var rect; \n")
f.write("var tbox; \n\n")

f.write("paper.clear(); \n\n")

for i in range(len(nlist)):
    # Draw node titles and boxes
    # Special color and size for root node
    if nlist[i].ntype == 0:
        tstr = 't['+str(i)+']=paper.text(nx[' + str(i) + '],ny[' + str(i) + '],'\
               + repr(nlist[i].name.encode("ISO-8859-1")) + ').attr({fill:"'+ \
               roottextcolor  +'","font-size": '+ roottextsize +'*sfac['+str(i)+']});'
        btstr = 'bt[' + str(i) + ']=ny[' + str(i) + ']-(tBox.height/2+10*sfac['+str(i)+']);'
        bbstr = 'bb[' + str(i) + ']=ny[' + str(i) + ']+(tBox.height/2+10*sfac['+str(i)+']);'
        blstr = 'bl[' + str(i) + ']=nx[' + str(i) + ']-(tBox.width/2+10*sfac['+str(i)+']);'
        brstr = 'br[' + str(i) + ']=nx[' + str(i) + ']+(tBox.width/2+10*sfac['+str(i)+']);'
        bxstr = 'rect=paper.rect(bl[' + str(i) + '], bt[' + str(i)\
                + '], br[' + str(i) + ']-bl[' + str(i) + '], bb[' + str(i) + ']-bt[' + str(i)\
                + '], 10*sfac['+str(i)+']).attr({stroke:"'+ rootboxcolor  +'","stroke-width": "'+ rootboxthick +\
                '",fill:"black","fill-opacity":"0"});'
        f.write(tstr + "\n")
        f.write('tBox=t['+str(i)+'].getBBox(); \n')
        f.write(btstr + "\n")
        f.write(bbstr + "\n")
        f.write(blstr + "\n")
        f.write(brstr + "\n")
        f.write('paper.setStart(); \n')
        f.write(bxstr + "\n")
        f.write('b['+str(i)+']=paper.setFinish(); \n')
        f.write("\n")
    # If node is chapter level (or with missing encode), draw without link
    if nlist[i].ntype == 1:
        tstr = 't['+str(i)+']=paper.text(nx[' + str(i) + '],ny[' + str(i) + '],'\
                + repr(nlist[i].name.encode("ISO-8859-1")) + ').attr({fill:"'+ \
                chaptextcolor  +'","font-size": '+ chaptextsize +'*sfac['+str(i)+']});'
        btstr = 'bt[' + str(i) + ']=ny[' + str(i) + ']-(tBox.height/2+10*sfac['+str(i)+']);'
        bbstr = 'bb[' + str(i) + ']=ny[' + str(i) + ']+(tBox.height/2+10*sfac['+str(i)+']);'
        blstr = 'bl[' + str(i) + ']=nx[' + str(i) + ']-(tBox.width/2+10*sfac['+str(i)+']);'
        brstr = 'br[' + str(i) + ']=nx[' + str(i) + ']+(tBox.width/2+10*sfac['+str(i)+']);'
        bxstr = 'rect=paper.rect(bl[' + str(i) + '], bt[' + str(i)\
                + '], br[' + str(i) + ']-bl[' + str(i) + '], bb[' + str(i) + ']-bt[' + str(i)\
                + '], 10*sfac['+str(i)+']).attr({stroke:"'+ chapboxcolor  +'","stroke-width": "'+ chapboxthick +\
                '", fill:"black","fill-opacity":"0"});'
        f.write(tstr + "\n")
        f.write('tBox=t['+str(i)+'].getBBox(); \n')
        f.write(btstr + "\n")
        f.write(bbstr + "\n")
        f.write(blstr + "\n")
        f.write(brstr + "\n")
        f.write('paper.setStart(); \n')
        f.write(bxstr + "\n")
        f.write('b['+str(i)+']=paper.setFinish(); \n')
        f.write("\n") 
    # If node is at concept level, include link to content
    if nlist[i].ntype == 2:
        # Expand node and shift text up if displaying artifact icons
        yshift = 0
        if showIcons == True:
            yshift = 10

        tstr = 't['+str(i)+']=paper.text(nx[' + str(i) + '],ny[' + str(i) + ']-'+str(yshift)+','\
    	        + repr(nlist[i].name.encode("ISO-8859-1")) + ').attr({fill:"'+ \
                textcolor +'", cursor: "pointer", "font-size": '+ textsize +'*sfac['+str(i)+']});'
        lstr = '    this.attr({fill: "'+ hovercolor  +'", cursor: "pointer", href: "' + link[i] + '", target: "_top",title:"Click to jump to concept"});'
        btstr = 'bt[' + str(i) + ']=ny[' + str(i) + ']-'+str(yshift)+'-(tBox.height/2+10*sfac['+str(i)+']);'
        bbstr = 'bb[' + str(i) + ']=ny[' + str(i) + ']-'+str(yshift)+'+(tBox.height/2+10*sfac['+str(i)+']);'
        blstr = 'bl[' + str(i) + ']=nx[' + str(i) + ']-(tBox.width/2+10*sfac['+str(i)+']);'
        brstr = 'br[' + str(i) + ']=nx[' + str(i) + ']+(tBox.width/2+10*sfac['+str(i)+']);'
        bxstr = 'rect=paper.rect(bl[' + str(i) + '], bt[' + str(i) + '], br[' \
                + str(i) + ']-bl[' + str(i) + '], bb[' + str(i) + ']-bt[' + str(i) + \
                '], 10*sfac['+str(i)+']).attr({stroke:"'+ boxcolor +'","stroke-width": "'+ boxthick +\
                '", fill:"black","fill-opacity":"0"});'       
        f.write(tstr + "\n")
        f.write('t['+str(i)+'].mouseover(function (event) { \n')
        f.write(lstr + "\n")
        f.write('}); \n')
        f.write('t['+str(i)+'].mouseout(function (event) { \n')
        f.write('    this.attr({cursor: "pointer", fill: "'+ textcolor  +'"}); \n')
        f.write('}); \n')
        f.write('tBox=t['+str(i)+'].getBBox(); \n')
        f.write(btstr + "\n")
        f.write(bbstr + "\n")
        f.write(blstr + "\n")
        f.write(brstr + "\n")
        
        if showIcons == True: 
            # Make space in node for icons
            f.write("var nwidth = br["+str(i)+"]-bl["+str(i)+"]; \n")
            f.write("if (nwidth < 100) { \n")
            f.write("    var delta = (100-nwidth)/2; \n")
            f.write("    bl["+str(i)+"] = bl["+str(i)+"] - delta; \n")
            f.write("    br["+str(i)+"] = br["+str(i)+"] + delta; \n")
            f.write("} \n")
            f.write("bb["+str(i)+"] = bb["+str(i)+"]+20; \n")
    
            f.write("yicon = bb["+str(i)+"]-25; \n")
            # Determine icon x locations based on number of icons (note: these shifts are based on 20x20 icon)
            ix = -40
            if not hideConceptIcon:
                f.write("xicon1 = nx["+str(i)+"]+"+str(ix)+"; \n")
                ix += 30
            f.write("xicon2 = nx["+str(i)+"]+"+str(ix)+"; \n")
            ix += 30
            f.write("xicon3 = nx["+str(i)+"]+"+str(ix)+"; \n")
            ix += 30
            f.write("xicon4 = nx["+str(i)+"]+"+str(ix)+"; \n")

            if not hideConceptIcon:
                # Always display icon for concept
                f.write("texticon = paper.image('/media/js/conceptmap/icons/book.png',xicon1,yicon,20,20); \n")
                f.write("texticon.mouseover(function (event) { \n")
                f.write('     this.attr({cursor: "pointer", href: "' + link[i] + '", target: "_top",title:"Click to jump to concept"}); \n')
                f.write("}); \n")

            # Display video and exercise icons if artifacts are available
            if vidArtifact[i]:
                f.write("vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); \n")
                f.write("vidicon.mouseover(function (event) { \n")
                f.write('     this.attr({cursor: "pointer", href: "' + vidlink[i] + '", target: "_top",title:"Click to jump to concept video"}); \n')
                f.write("}); \n")
            if exArtifact[i]:
                f.write("exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); \n")
                f.write("exicon.mouseover(function (event) { \n")
                f.write('     this.attr({cursor: "pointer", href: "' + exlink[i] + '", target: "_top",title:"Click to jump to concept exercise"}); \n')
                f.write("}); \n")
            if attArtifact[i]:
                ## TODO: Change icon
                f.write("atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); \n")
                f.write("atticon.mouseover(function (event) { \n")
                f.write('     this.attr({cursor: "pointer", href: "' + attlink[i] + '", target: "_top",title:"Click to jump to concept attachments"}); \n')
                f.write("}); \n")

        f.write('paper.setStart(); \n')
        f.write(bxstr + "\n")
        f.write('b['+str(i)+']=paper.setFinish(); \n')
        f.write("t["+str(i)+"].toFront(); \n")
        if showIcons == True:
            if not hideConceptIcon:
                f.write("texticon.toFront(); \n")
            if vidArtifact[i]:
                f.write("vidicon.toFront(); \n")
            if exArtifact[i]:
                f.write("exicon.toFront(); \n")
            if attArtifact[i]:
                f.write("atticon.toFront(); \n")
        f.write('\n')
     
    # Write coordinate locations of junction points for use with connector lines        
    if nlist[i].ntype == 3:
        f.write('bb[' + str(i) + ']= ny[' + str(i) + ']; \n')
        f.write('bt[' + str(i) + ']= ny[' + str(i) + ']; \n')
        f.write('bl[' + str(i) + ']= nx[' + str(i) + ']; \n')
        f.write('br[' + str(i) + ']= nx[' + str(i) + ']; \n')
        f.write('\n')   

# Call function to draw lines
f.write("drawLines(); \n")
f.write("boxClick(); \n")
f.write("boxHover(); \n")

f.write("} \n\n")


#********************************************************************
#
# Write js function that adds click handlers for nodes
#
#********************************************************************

f.write("function boxClick() { \n\n")

for i in range(len(nlist)):
    if nlist[i].ntype != 3:
        f.write("b["+str(i)+"].click(function() {recenter("+str(i)+");}); \n")

f.write("} \n\n")


#********************************************************************
#
# Write js function that adds hover handlers for nodes
#
#********************************************************************

f.write("function boxHover() { \n\n")

for i in range(len(nlist)):
    if nlist[i].ntype != 3:
        f.write("b["+str(i)+"].hover(function() {nodeHover("+str(i)+");}, function() {nodeUnhover("+str(i)+");}); \n")

f.write("} \n\n")




#********************************************************************
#
# Write js function that draws connector lines based on node boxes
#
#********************************************************************

# Write function to draw connector lines
f.write("function drawLines() { \n\n")

f.write("var mid; \n")
f.write("var s1; \n")
f.write("var s2; \n")
f.write("var s3; \n")
f.write("var v1; \n")
f.write("var v2; \n")
f.write("var hleft; \n")
f.write("var hright; \n")
f.write("var h; \n")

nlines = 0

# Initialize left and right parent x loc arrays for junctions
jleftparent = []
jrightparent = []
for i in range(len(nlist)):
    jleftparent.append(i)
    jrightparent.append(i)

# Pre-process arrays
for i in range(len(nlist)):
    # Find number of node children (excluding junctions)
    nnodechild = nlist[i].nchild
    junchild = []
    for j in nlist[i].child:
        if nlist[j].ntype == 3:
            nnodechild = nnodechild - 1
            junchild.append(j)
    
    # Find left-most and right-most junction parents
    if nnodechild <= 1:
        for j in junchild:
            if int(nlist[i].x) > int(nlist[jrightparent[j]].x):
                jrightparent[j] = i
            if int(nlist[i].x) < int(nlist[jleftparent[j]].x):
                jleftparent[j] = i


for i in range(len(nlist)):
    # Find number of node children (excluding junctions)
    nnodechild = nlist[i].nchild
    junchild = []
    for j in nlist[i].child:
        if nlist[j].ntype == 3:
            nnodechild = nnodechild - 1
            junchild.append(j)

    # If one node child, then draw single vertical line
    if nnodechild == 1:
        fromnode = i
        for child in nlist[i].child:
            if nlist[child].ntype != 3:
                tonode = child

        # Vertical line   
        vcntr = 'nx['+str(fromnode)+']'
        vtop = 'bb['+str(fromnode)+']'
        vbot = 'bt['+str(tonode)+']'
        f.write('paper.setStart(); \n')
        f.write("s1='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +"; \n")
        f.write('v1=paper.path(s1); \n')
        f.write('v1.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
        f.write('lines['+str(nlines)+']=paper.setFinish(); \n')
        f.write('lineNodes['+str(nlines)+']=['+str(fromnode)+','+str(tonode)+'] ; \n')
        f.write("\n")
        nlines = nlines + 1;
  
    # If >1 node child, then draw orthogonal tree to all children
    if nnodechild > 1:
        xloc = []
        yloc = []
        dy = []
        fromnode = i
        for j in nlist[i].child:
            xloc.append(int(nlist[j].x))
            yloc.append(int(nlist[j].y))
            if int(nlist[j].x) == min(xloc):
                leftchild = j
            if int(nlist[j].x) == max(xloc):
                rightchild = j
            if int(nlist[j].y) == min(yloc):
                topchild = j 

        # Make sure horizontal tree line doesn't intersect nodes above it
        for j in range(len(nlist)):
            if int(nlist[j].x) <= max(xloc):
                if int(nlist[j].x) >= min(xloc):
                    dytmp = int(nlist[topchild].y) - int(nlist[j].y)
                    if dytmp > 0:
                        dy.append(dytmp)
                        if dytmp == min(dy):
                            mindynode = j
                            
        # Loop through all children and draw line for each
        for j in nlist[i].child:
            # Draw horizontal line (for outermost children only)
            f.write('paper.setStart(); \n')
            f.write('mid=bb[' + str(mindynode) + ']+(bt[' + str(topchild) + ']-bb[' + str(mindynode) + '])/2; \n')
            if (j == leftchild or j == rightchild):
                hleft = 'nx['+str(j)+']'
                hright = 'nx['+str(i)+']'
                #f.write('paper.setStart(); \n')
                #f.write('mid=bb[' + str(mindynode) + ']+(bt[' + str(topchild) + ']-bb[' + str(mindynode) + '])/2; \n')
                f.write('hleft = '+hleft+'; \n')
                f.write('hright = '+hright+'; \n')
                f.write("s1='M '+hleft+' '+mid+' L '+hright+' '+mid; \n")
                f.write('h=paper.path(s1); \n')
                f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
        
            # Draw vertical line from parent to horizontal line (only do once per family)
            if (j == nlist[i].child[0]):
                vcntr = 'nx['+str(fromnode)+']'
                vtop = 'bb['+str(fromnode)+']'
                vbot = 'mid'
                f.write("s2='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +"; \n")
                f.write('v1=paper.path(s2); \n')
                f.write('v1.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')    

            # Draw vertical line from horizontal line to each child
            vcntr = 'nx['+str(j)+']'
            vtop = 'mid'
            vbot = 'bt['+str(j)+']'
            f.write("s3='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +";\n")
            f.write('v2=paper.path(s3); \n')
            f.write('v2.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n') 
            f.write('lines['+str(nlines)+']=paper.setFinish(); \n')
            f.write('lineNodes['+str(nlines)+']=['+str(i)+','+str(j)+']; \n')
            f.write('\n')

            nlines = nlines + 1
 
            
    # Draw connectors to junction children (special treatment if junction is not part
    # of a family of node children)
    if nnodechild <= 1:
        for j in junchild:
            xnode = int(nlist[i].x)
            ynode = int(nlist[i].y)
            xjunc = int(nlist[j].x)
            yjunc = int(nlist[j].y)

            # Draw vertical line to junction y location
            vcntr = 'nx['+str(i)+']'
            vtop = 'bb['+str(i)+']'
            vbot = 'ny['+str(j)+']'
            f.write('paper.setStart(); \n')
            f.write("s1='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +"; \n")
            f.write('v1=paper.path(s1); \n')
            f.write('v1.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
            
            # Draw horizontal line
            if i == jleftparent[j]:
                hleft = 'nx['+str(jleftparent[j])+']'
                hright = 'nx['+str(jrightparent[j])+']'
                hy = 'ny['+str(j)+']'
                f.write("s2='M '+" + hleft + "+' '+" + hy + "+' L '+" + hright + "+' '+" + hy + "; \n")
                f.write('h=paper.path(s2); \n')
                f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
                f.write('lines['+str(nlines)+']=paper.setFinish(); \n')
                f.write('lineNodes['+str(nlines)+']=['+str(i)+','+str(j)+']; \n')
                f.write('\n')
            else:
                f.write('lines['+str(nlines)+']=paper.setFinish(); \n')
                f.write('lineNodes['+str(nlines)+']=['+str(i)+','+str(j)+']; \n')
                f.write('\n') 
            
            nlines = nlines + 1

f.write('nlines = '+str(nlines)+';\n')

# End of file:
f.write("}") 
f.close()
