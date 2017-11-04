# -*- coding: utf-8 -*-

import sys
import os
import clr
import re
import System

clr.AddReference("System.Xml")

from System import Xml
from xml.dom import minidom
from openxml.htmlentities import replaceHtmlEntities, escapeHtmlEntities
from tempfile import NamedTemporaryFile
from urllib import quote, unquote

import copy

NONBLOCK_NODES = [ "strong", "b", "em", "i", "u", "strike", "a", "sup", "sub", "span" ]

exp = re.compile(r'[\s ]+')
emptySpaceExp = re.compile(r'(/(strong|b|em|i|u|strike|a|sup|sub|span)>)[ ]+(<(strong|b|em|i|u|strike|a|sup|sub|span))')
ampExp = re.compile(r'&[\s]+')
bAfterNbExp = re.compile(r'(/(strong|b|em|i|u|strike|a|sup|sub|span)>)(<([a-zA-Z]+))')
nbAfterBExp = re.compile(r'(/([a-zA-Z]+)>)(<(strong|b|em|i|u|strike|a|sup|sub|span))')
mathAltExp = re.compile(r'alt="(.*?)"', re.I)

class XHTMLParser:
    def __init__(self, file):
        self.file = file

        self.settings = Xml.XmlReaderSettings()
        self.settings.ConformanceLevel = Xml.ConformanceLevel.Fragment
        self.settings.IgnoreWhitespace = True
        self.settings.IgnoreComments = False
        self.settings.CheckCharacters = False
        self.settings.DtdProcessing = Xml.DtdProcessing.Prohibit
        self.settings.XmlResolver = None

    def preprocessXHTML(self):
        f = open(self.file)
        text = f.read()
        f.close()

        def quoteAlt(match):
            if match.group(1):
                return 'alt="%s"' % quote(match.group(1))

        text = ampExp.sub(r'&amp; ', text)
        text = replaceHtmlEntities(text)
        text = emptySpaceExp.sub(r'\1&#160;\3', text)

        def replaceFunc(match):
            if match.group(4) and match.group(4) not in NONBLOCK_NODES:
                return match.group(1) + '&#160;' + match.group(3)
            else:
                return match.group(1) + match.group(3)

        text = bAfterNbExp.sub(replaceFunc, text)

        def replaceFunc2(match):
            if match.group(2) and match.group(2) not in NONBLOCK_NODES and match.group(2) != 'p':
                return match.group(1) + '</p><p>' + match.group(3)
            else:
                return match.group(1) + match.group(3)

        text = nbAfterBExp.sub(replaceFunc2, text)
        text = mathAltExp.sub(quoteAlt, text)

        tfile = NamedTemporaryFile(delete=False)
        tfile.write(text)
        tfile.close()

        ## Remove doctype declaration
        foundHtml = False
        t2file = NamedTemporaryFile(delete=False)
        f = open(tfile.name, "r")
        for line in f:
            ln = line.strip()
            if not foundHtml and ln.lower().startswith('<html'):
                foundHtml = True
            if foundHtml:
                t2file.write(line)

        f.close()
        t2file.close()
        os.remove(tfile.name)

        return t2file.name

    def processText(self, text):
        text = text.replace("\n", " ")
        text = exp.sub(' ', text)
        text = exp.sub(' ', text)
        return text

    def getText(self, nodelist):
        str = ''
        for node in nodelist:
            if node.nodeType == node.TEXT_NODE:
                str += node.data
            elif node.nodeType == node.ELEMENT_NODE and node.localName in TEXT_NONBREAKING_NODE:
                str = '<%s' % node.localName
                if node.hasAttributes():
                    for attr in node.attributes.keys():
                        str += ' %s="%s"' % (attr, node.attributes[attr])
                str += '>'
        return self.processText(str)

    def getProcessableNodes(self):
        inputFile = self.preprocessXHTML()

        allnodes = []
        nodes = []
        reader = Xml.XmlReader.Create(inputFile, self.settings)
        try:
            while reader.Read():
                if reader.NodeType == Xml.XmlNodeType.Element:
                    if nodes:
                        name = nodes[-1]['name'] + '/'
                    else:
                        name = '/'
                    name += reader.Name
                    nodeName = os.path.basename(name)
                    #print "%d Opening Name: %s [%s]" % (len(nodes), name, nodeName)

                    nodes.append({'name': name, 'text': ''})
                    allnodes.append(nodes[-1])
                    if reader.HasAttributes:
                        while reader.MoveToNextAttribute():
                            aname = reader.Name
                            if aname == 'name':
                                aname = '_name'
                            elif aname == 'children':
                                aname = '_children'
                            elif aname == 'text':
                                aname = '_text'
                            nodes[-1][aname] = reader.Value
                            if aname == 'alt':
                                nodes[-1][aname] = unquote(nodes[-1][aname])
                        reader.MoveToElement()
                    if reader.IsEmptyElement:
                        #print "Closed: %s" % (nodes[-1]['name'])
                        n = nodes.pop()
                        newN = {'name': n['name'] + '__end'}
                        if n.get('class'):
                            newN['class'] = n.get('class')
                        allnodes.append(newN)
                elif reader.NodeType == Xml.XmlNodeType.Text or reader.NodeType == Xml.XmlNodeType.CDATA:
                    #print "Text for %s" % nodes[-1]['name']
                    if nodes[-1]['name'] != name:
                        ## Copy node
                        n = copy.deepcopy(nodes.pop())
                        n['text'] = ''
                        nodes.append(n)
                        allnodes.append(n)

                    if name.endswith('/literallayout'):
                        ## Do not remove text formatting
                        nodes[-1]['text'] = reader.Value
                    else:
                        nodes[-1]['text'] = self.processText(reader.Value)
                    #print "Text for %s" % nodes[-1].get('text')
                elif reader.NodeType == Xml.XmlNodeType.Comment:
                    #print "Comment: %s" % reader.Value
                    if not allnodes[-1].has_key('comments'):
                        allnodes[-1]['comments'] = []
                    allnodes[-1]['comments'].append(reader.Value.strip())
                elif reader.NodeType == Xml.XmlNodeType.EndElement:
                    #print "Closed: %s" % (nodes[-1]['name'])
                    closedName = os.path.basename(nodes[-1]['name'])
                    n = nodes.pop()
                    newN = {'name': n['name'] + '__end'}
                    if n.get('class'):
                        newN['class'] = n.get('class')
                    allnodes.append(newN)
        finally:
            reader.Close()
            print inputFile
            os.remove(inputFile)

        ## Figure out the children for all nodes
        ## TODO: The node list may have same child mentioned multiple times
        i = 1
        while i < len(allnodes):
            xpath = allnodes[i]['name']
            mydepth = xpath.count('/') - 1
            if not xpath.endswith('__end'):
                nodeName = os.path.basename(xpath)
                parentName = os.path.dirname(os.path.basename(xpath))
                j = i-1
                while j >= 0:
                    depth = allnodes[j]['name'].count('/') - 1
                    if depth <= mydepth - 1 and allnodes[j]['name'].endswith('__end'):
                        break

                    if depth == mydepth - 1 and allnodes[j]['name'].endswith(parentName):
                        if not allnodes[j].has_key('children'):
                            allnodes[j]['children'] = []
                        allnodes[j]['children'].append(nodeName)
                    j -= 1
            i += 1

        print "\n\n"
        for node in allnodes:
            print node

        return allnodes

if __name__ == '__main__':
    infile = None
    if len(sys.argv) > 1:
        infile = sys.argv[1]
    if not infile:
        infile = "concept.xhtml"

    parser = XHTMLParser(infile)
    nodes = parser.getProcessableNodes()
    print "\n\n"
    for node in nodes:
        print node
