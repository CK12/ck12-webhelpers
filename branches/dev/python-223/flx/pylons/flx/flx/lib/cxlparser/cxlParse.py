import os
from xml.etree.ElementTree import ElementTree
from pylons.i18n.translation import _ 
import sys
import logging

log = logging.getLogger(__name__)

# Define data structure for concept node information
# ntype flag key:
#   0: root node
#   1: chapter level (also used as default for missing encode cases)
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

def parse(inputFile, outputFilePrefix):
    
    mydir = os.path.dirname(__file__)
    log.info("My dir: %s" % mydir)
    htmlOutput = '%s.html' % outputFilePrefix
    jsOutput = '%s.js' % outputFilePrefix
    log.info("htmlOutput: %s, jsOutput: %s" % (htmlOutput, jsOutput))

    # Name of div container that map will reside in
    divname = 'holder'

    # Color codes from CXL for each type of node:
    rootColor = '255,100,0,255'
    chapterColor = '0,255,0,255'
    conceptColor = '255,255,255,255'

    # Display attributes for map
    rootboxcolor = '#7cbf00'
    roottextcolor = 'white'
    roottextsize = '24'
    rootboxthick = '4'

    chapboxcolor = '#bf5600'
    chaptextcolor = '#bf5600'
    chaptextsize = '14'
    chapboxthick = '2'

    boxcolor = '#bf5600'
    textcolor = 'white'
    hovercolor = '#6D7B8D'
    textsize = '14'
    boxthick = '2'

    linecolor = 'white'
    linethick = '3'

    fname = inputFile

    # Parse CXL data
    tree = ElementTree()
    tree.parse(fname)

    nlist = []

    # Populate list of node ids and concept names
    for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}concept'):
        nlist.append(cnode())
        nlist[len(nlist)-1].id = node.attrib.get('id')
        nlist[len(nlist)-1].name = node.attrib.get('label')
        nlist[len(nlist)-1].name = nlist[len(nlist)-1].name.rstrip()
     
    # Assign x and y coord to corresponding node and determine if chapter level or not
    cnt = 0
    for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}concept-appearance'):
        if node.attrib.get('id') == nlist[cnt].id:
            nlist[cnt].x = node.attrib.get('x')
            nlist[cnt].y = node.attrib.get('y')
            if node.attrib.get('background-color') == rootColor:
                nlist[cnt].ntype = 0
            if node.attrib.get('background-color') == chapterColor:
                nlist[cnt].ntype = 1
            if node.attrib.get('background-color') == conceptColor:
                nlist[cnt].ntype = 2
            cnt = cnt+1
        else:
            log.error('Error: Node ID mismatch')

    # Parse junction points (linking phrase) from cxl and flag
    for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}linking-phrase'):
        nlist.append(cnode())
        nlist[len(nlist)-1].id = node.attrib.get('id')
        nlist[len(nlist)-1].ntype = 3

    # Assign x and y coord to junction points; cnt starts from number of nodes above
    for node in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}linking-phrase-appearance'):
        if node.attrib.get('id') == nlist[cnt].id:
            nlist[cnt].x = node.attrib.get('x')
            nlist[cnt].y = node.attrib.get('y')
            cnt = cnt+1
        else:
            log.error('Error: Node ID mismatch')

    # Strip encode ID from concept/chapter names and store in list
    for i in range(len(nlist)):
        if nlist[i].ntype != 0:
            if nlist[i].ntype != 3:
                tmpstr = nlist[i].name.split('[')
                if len(tmpstr)==2:
                    nlist[i].encode = tmpstr[1]
                    nlist[i].encode = nlist[i].encode.rstrip(']')

                    nlist[i].name = tmpstr[0]
                    nlist[i].name = nlist[i].name.rstrip('\n')
                else:
                    log.error( 'Error: Concept name and encode ID could not be split. Possible missing encode ID:\n')
                    log.error( 'Concept Name:\n')
                    log.error( str(nlist[i].name))
                    raise Exception((_(u"Error: Concept name and encode ID could not be split. Possible missing encode ID")).encode("utf-8"))

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

    # Generate Raphaeljs code for node placement
    # Write header:
    boxwidth = 900;
    boxheight = 600;

    f = open(jsOutput,'w')
    f.write("window.onload = function() { \n")
    f.write("\n")
    f.write("mapWidth = "+str(width)+"; \n")
    f.write("mapHeight = "+str(height)+"; \n")
    f.write("\n")
    f.write("boxWidth = "+str(boxwidth)+"; \n")
    f.write("boxHeight = "+str(boxheight)+"; \n")
    f.write("aspectRatio = boxWidth/boxHeight; \n")
    f.write("zoomFactor = 5; \n")
    f.write("\n")
    f.write("var paper = Raphael(document.getElementById('"+ divname +"'), " + str(boxwidth) + \
                ", " + str(boxheight) + "); \n")
    f.write("\n")
    f.write("canvasWidth = boxWidth; \n")
    f.write("canvasHeight = boxHeight; \n")
    f.write("\n")

    # Write position of root node for centering
    for node in nlist:
        if node.ntype == 0:
            f.write("rootx = "+str(node.x)+"; \n")
            f.write("rooty = "+str(node.y)+"; \n")
            f.write("\n")

    # Initial zoom to center on root
    f.write("xorig = rootx-boxWidth/2; \n")
    f.write("yorig = rooty; \n")
    f.write("\n")
    f.write("zoomInitial = 500; \n")
    f.write("xorig = xorig-zoomInitial/2; \n")
    f.write("yorig = yorig-(zoomInitial/aspectRatio)/2; \n")
    f.write("canvasWidth = canvasWidth + zoomInitial; \n")
    f.write("canvasHeight = canvasHeight + zoomInitial/aspectRatio; \n")
    f.write("paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight); \n")
    f.write("\n")


    #
    # HACK TO INSERT CODE FOR NAV BUTTONS
    #
    fnav = open(os.path.join(mydir, 'navbuttons.js'),'r')
    for line in fnav:
        f.write(line)
    f.write("\n")




    # Draw nodes and write junction positions: 
    for i in range(len(nlist)):
        # Draw node titles and boxes
        # Special color and size for root node
        if nlist[i].ntype == 0:
            xstr = "var nx" + str(i) + "=" + nlist[i].x + ";"
            ystr = "var ny" + str(i) + "=" + nlist[i].y + ";"
            tstr = 'var t=paper.text(nx' + str(i) + ',ny' + str(i) + ','\
                   + repr(nlist[i].name.encode("ISO-8859-1")) + ').attr({fill:"'+ \
                   roottextcolor  +'","font-size": '+ roottextsize +'});'
            btstr = 'var bt' + str(i) + '=ny' + str(i) + '-(tBox.height/2+10);'
            bbstr = 'var bb' + str(i) + '=ny' + str(i) + '+(tBox.height/2+10);'
            blstr = 'var bl' + str(i) + '=nx' + str(i) + '-(tBox.width/2+10);'
            brstr = 'var br' + str(i) + '=nx' + str(i) + '+(tBox.width/2+10);'
            bxstr = 'var b' + str(i) + '=paper.rect(bl' + str(i) + ', bt' + str(i)\
                    + ', br' + str(i) + '-bl' + str(i) + ', bb' + str(i) + '-bt' + str(i)\
                    + ', 10).attr({stroke:"'+ rootboxcolor  +'","stroke-width": "'+ rootboxthick +'"});'
            f.write(xstr + "\n")
            f.write(ystr + "\n")
            f.write(tstr + "\n")
            f.write('var tBox=t.getBBox(); \n')
            f.write(btstr + "\n")
            f.write(bbstr + "\n")
            f.write(blstr + "\n")
            f.write(brstr + "\n")
            f.write(bxstr + "\n")
            f.write("\n")
        # If node is chapter level (or with missing encode), draw without link
        if nlist[i].ntype == 1:
            xstr = "var nx" + str(i) + "=" + nlist[i].x + ";"
            ystr = "var ny" + str(i) + "=" + nlist[i].y + ";"
            tstr = 'var t=paper.text(nx' + str(i) + ',ny' + str(i) + ','\
                    + repr(nlist[i].name.encode("ISO-8859-1")) + ').attr({fill:"'+ \
                    chaptextcolor  +'","font-size": '+ chaptextsize +'});'
            btstr = 'var bt' + str(i) + '=ny' + str(i) + '-(tBox.height/2+10);'
            bbstr = 'var bb' + str(i) + '=ny' + str(i) + '+(tBox.height/2+10);'
            blstr = 'var bl' + str(i) + '=nx' + str(i) + '-(tBox.width/2+10);'
            brstr = 'var br' + str(i) + '=nx' + str(i) + '+(tBox.width/2+10);'
            bxstr = 'var b' + str(i) + '=paper.rect(bl' + str(i) + ', bt' + str(i)\
                    + ', br' + str(i) + '-bl' + str(i) + ', bb' + str(i) + '-bt' + str(i)\
                    + ', 10).attr({stroke:"'+ chapboxcolor  +'","stroke-width": "'+ chapboxthick +'"});'
            f.write(xstr + "\n")
            f.write(ystr + "\n")
            f.write(tstr + "\n")
            f.write('var tBox=t.getBBox(); \n')
            f.write(btstr + "\n")
            f.write(bbstr + "\n")
            f.write(blstr + "\n")
            f.write(brstr + "\n")
            f.write(bxstr + "\n")
            f.write("\n") 
        # If node is at concept level, include link to content
        if nlist[i].ntype == 2:
            xstr = "var nx" + str(i) + "=" + nlist[i].x + ";"
            ystr = "var ny" + str(i) + "=" + nlist[i].y + ";"
            tstr = 'var t=paper.text(nx' + str(i) + ',ny' + str(i) + ','\
                    + repr(nlist[i].name.encode("ISO-8859-1")) + ').attr({fill:"'+ \
                    textcolor +'", cursor: "pointer", "font-size": '+ textsize +'});'
            cname = nlist[i].name.encode("ISO-8859-1").replace('\n', ' ')
            hstr = '/concept/' + str(nlist[i].encode) + '.C.1#' + cname 
            lstr = '    this.attr({fill: "'+ hovercolor  +'", cursor: "pointer", href: "' + hstr + '", target: "_top"});'
            btstr = 'var bt' + str(i) + '=ny' + str(i) + '-(tBox.height/2+10);'
            bbstr = 'var bb' + str(i) + '=ny' + str(i) + '+(tBox.height/2+10);'
            blstr = 'var bl' + str(i) + '=nx' + str(i) + '-(tBox.width/2+10);'
            brstr = 'var br' + str(i) + '=nx' + str(i) + '+(tBox.width/2+10);'
            bxstr = 'var b' + str(i) + '=paper.rect(bl' + str(i) + ', bt' + str(i) + ', br' \
                    + str(i) + '-bl' + str(i) + ', bb' + str(i) + '-bt' + str(i) + \
                    ', 10).attr({stroke:"'+ boxcolor +'","stroke-width": "'+ boxthick +'"});'           
            f.write(xstr + "\n")
            f.write(ystr + "\n")
            f.write(tstr + "\n")
            f.write('t.mouseover(function (event) { \n')
            f.write(lstr + "\n")
            f.write('}); \n')
            f.write('t.mouseout(function (event) { \n')
            f.write('    this.attr({cursor: "pointer", fill: "'+ textcolor  +'"}); \n')
            f.write('}); \n')
            f.write('var tBox=t.getBBox(); \n')
            f.write(btstr + "\n")
            f.write(bbstr + "\n")
            f.write(blstr + "\n")
            f.write(brstr + "\n")
            f.write(bxstr + "\n")
            f.write("\n")
         
        # Write coordinate locations of junction points for use with connector lines        
        if nlist[i].ntype == 3:
            f.write('bb' + str(i) + '=' + nlist[i].y + '\n')
            f.write('bt' + str(i) + '=' + nlist[i].y + '\n')
            f.write('bl' + str(i) + '=' + nlist[i].x + '\n')
            f.write('br' + str(i) + '=' + nlist[i].x + '\n')
            f.write('nx' + str(i) + '=' + nlist[i].x + '\n')
            f.write('ny' + str(i) + '=' + nlist[i].y + '\n')
            f.write('\n')
                
    # Draw connector lines:
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
            vcntr = 'nx'+str(fromnode)
            vtop = 'bb'+str(fromnode)
            vbot = 'bt'+str(tonode)
            f.write("s='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +"; \n")
            f.write('v=paper.path(s); \n')
            f.write('v.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
            f.write("\n")
      
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

            # Draw horizontal line     
            hleft = str(min(xloc))
            hright = str(max(xloc))
            f.write('var mid=bb' + str(mindynode) + '+(bt' + str(topchild) + '-bb' + str(mindynode) + ')/2; \n')
            f.write("s='M '+" + hleft + "+' '+mid+' L '+" + hright + "+' '+mid; \n")
            f.write('h=paper.path(s); \n')
            f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
            
            # Draw vertical line from parent to horizontal line
            vcntr = 'nx'+str(fromnode)
            vtop = 'bb'+str(fromnode)
            vbot = 'mid'
            f.write("s='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +"; \n")
            f.write('v=paper.path(s); \n')
            f.write('v.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')    

            # Draw vertical lines from horizontal line to each child
            for j in nlist[i].child:
                vcntr = 'nx'+str(j)
                vtop = 'mid'
                vbot = 'bt'+str(j)
                f.write("s='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +";\n")
                f.write('v=paper.path(s); \n')
                f.write('v.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')    
            f.write('\n')
                
        # Draw connectors to junction children (special treatment if junction is not part
        # of a family of node children)
        if nnodechild <= 1:
            for j in junchild:

                xnode = int(nlist[i].x)
                ynode = int(nlist[i].y)
                xjunc = int(nlist[j].x)
                yjunc = int(nlist[j].y)

                # If junction is same level as parent node, draw horizontal line only
                if yjunc > ynode-2:
                    if yjunc < ynode+2:
                        if xnode > xjunc:
                            hleft = str(xjunc)
                            hright = 'bl'+str(i)
                            hy = str(yjunc)
                            f.write("s='M '+" + hleft + "+' '+" + hy + "+' L '+" + hright + "+' '+" + hy + "; \n")
                            f.write('h=paper.path(s); \n')
                            f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
                            f.write('\n')
                        if xnode < xjunc:
                            hleft = 'br'+str(i)
                            hright = str(xjunc)
                            hy = str(yjunc)
                            f.write("s='M '+" + hleft + "+' '+" + hy + "+' L '+" + hright + "+' '+" + hy + "; \n")
                            f.write('h=paper.path(s); \n')
                            f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
                            f.write('\n')
                # If junction is below parent node draw vertical and horizontal line
                if yjunc > ynode + 2:
                    # Draw vertical line to junction y location
                    vcntr = 'nx'+str(i)
                    vtop = 'bb'+str(i)
                    vbot = str(yjunc)
                    f.write("s='M '+" + vcntr + "+' '+" + vtop + "+' L '+" + vcntr + "+' '+" + vbot +"; \n")
                    f.write('v=paper.path(s); \n')
                    f.write('v.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
                    
                    # Draw horizontal line
                    f.write('h=paper.path("M 0 0 L 1 0"); \n')
                    f.write('h.scale(' + str(max(xnode,xjunc)) + '-' + str(min(xnode,xjunc)) + ',1,0,0); \n')
                    f.write('h.translate(' + str(min(xnode,xjunc)) + ',' + str(yjunc) + '); \n')
                    f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
                    f.write('\n')

                    hleft = str(min(xnode,xjunc))
                    hright = str(max(xnode,xjunc))
                    hy = str(yjunc)
                    f.write("s='M '+" + hleft + "+' '+" + hy + "+' L '+" + hright + "+' '+" + hy + "; \n")
                    f.write('h=paper.path(s); \n')
                    f.write('h.attr({stroke:"'+ linecolor +'", "stroke-width": "'+ linethick +'"}); \n')
                    f.write('\n')


    #
    # HACK TO INSERT PAN/ZOOM EVENT HANDLER CODE
    #
    fevent = open(os.path.join(mydir, 'panzoom.js'),'r')
    for line in fevent:
        f.write(line)
    f.write("\n")


    # End of file:
    f.write("}") 
    f.close()
    fnav.close()
    fevent.close()

    htmlSrc = '''
<!DOCTYPE html>
<html>
<head>
<style type="text/css">
  html { height: 100% }
  body {
    overflow: hidden;
    padding: 0;
    background: #fff;
    color: #fff;
    font: 300 100.1% "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif;
  }
  #holder {
     position: relative;
     width: 900px;
     height: 600px;
     background-color: #333;
     color: #fff;
     overflow: hidden;
     cursor: move;
  }
  #navholder {
     position: absolute;
     top: 0;
     left: 0;
  }
</style>
<script charset="utf-8" type="text/javascript" src="/flx/media/js/raphael.js"></script>
<script charset="utf-8" type="text/javascript" src="@@JS@@"></script>
</head>


<body>
  <div id="holder">
    <div id="navholder"></div>
  </div>
</body>
</html>
'''

    jsPath = os.path.basename(jsOutput)
    f = open(htmlOutput, "w")
    htmlSrc = htmlSrc.replace('@@JS@@', '/flx/media/mapcache/%s' % jsPath)
    f.write(htmlSrc)
    f.close()

