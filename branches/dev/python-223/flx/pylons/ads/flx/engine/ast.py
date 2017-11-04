#!/usr/bin/python

import sys, StringIO
import ftlexer, ftparser, solexer, soparser

def walk(ast, level=0):
    if not ast: return
    print '(%d:%.2d)\t%s ' % (level, ast.getType(), ast.getText())
    walk(ast.getFirstChild(), level+1)
    walk(ast.getNextSibling(), level)

def parse(s):
    if _use_ft:
        lexer = ftlexer.Lexer(StringIO.StringIO(s))
        parser = ftparser.Parser(lexer)
        parser.filter_list()
    else:
        lexer = solexer.Lexer(StringIO.StringIO(s))
        parser = soparser.Parser(lexer)
        parser.sort_list()
    ast = parser.getAST()
    print 'AST Tree ->', ast.toStringTree()
    walk(ast)

_use_ft = True

if __name__ == '__main__':
    if len(sys.argv) == 3:
        if sys.argv[1] == 'ft':
            _use_ft = True 
        elif sys.argv[1] == 'so':
            _use_ft = False 
        else:
            print >>sys.stdout, "Invalid parameter: %s" % sys.argv[1]
            sys.exit(1)
    
        parse(sys.argv[2])

