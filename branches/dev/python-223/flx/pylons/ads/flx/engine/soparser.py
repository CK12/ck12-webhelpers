### $ANTLR 2.7.7 (20110618): "sort.g" -> "soparser.py"$
### import antlr and other modules ..
import sys
import antlr

version = sys.version.split()[0]
if version < '2.2.1':
    False = 0
if version < '2.3':
    True = not False
### header action >>> 

### header action <<< 
### preamble action>>>

### preamble action <<<

### import antlr.Token 
from antlr import Token
### >>>The Known Token Types <<<
SKIP                = antlr.SKIP
INVALID_TYPE        = antlr.INVALID_TYPE
EOF_TYPE            = antlr.EOF_TYPE
EOF                 = antlr.EOF
NULL_TREE_LOOKAHEAD = antlr.NULL_TREE_LOOKAHEAD
MIN_USER_TYPE       = antlr.MIN_USER_TYPE
COMMA = 4
NAME = 5
AT = 6
NUMBER = 7
LITERAL_asc = 8
LITERAL_desc = 9
LITERAL_ASC = 10
LITERAL_DESC = 11
WHITESPACE = 12

class Parser(antlr.LLkParser):
    ### user action >>>
    class SortOrderParserException(Exception):
       def __init__(self, exc): self.exc = exc
       def __str__(self): return str(self.exc)
    def reportError(self, exc): raise Parser.SortOrderParserException(exc)
    ### user action <<<
    
    def __init__(self, *args, **kwargs):
        antlr.LLkParser.__init__(self, *args, **kwargs)
        self.tokenNames = _tokenNames
        self.buildTokenTypeASTClassMap()
        self.astFactory = antlr.ASTFactory(self.getTokenTypeToASTClassMap())
        self.astFactory.setASTNodeClass()
        
    def sort_list(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        sort_list_AST = None
        try:      ## for error handling
            pass
            self.field()
            self.addASTChild(currentAST, self.returnAST)
            while True:
                if (self.LA(1)==COMMA):
                    pass
                    tmp1_AST = None
                    tmp1_AST = self.astFactory.create(self.LT(1))
                    self.addASTChild(currentAST, tmp1_AST)
                    self.match(COMMA)
                    self.field()
                    self.addASTChild(currentAST, self.returnAST)
                else:
                    break
                
            sort_list_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_0)
        
        self.returnAST = sort_list_AST
    
    def field(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        field_AST = None
        try:      ## for error handling
            pass
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [NAME]:
                pass
                tmp2_AST = None
                tmp2_AST = self.astFactory.create(self.LT(1))
                self.makeASTRoot(currentAST, tmp2_AST)
                self.match(NAME)
                la1 = self.LA(1)
                if False:
                    pass
                elif la1 and la1 in [AT]:
                    pass
                    tmp3_AST = None
                    tmp3_AST = self.astFactory.create(self.LT(1))
                    self.addASTChild(currentAST, tmp3_AST)
                    self.match(AT)
                    tmp4_AST = None
                    tmp4_AST = self.astFactory.create(self.LT(1))
                    self.addASTChild(currentAST, tmp4_AST)
                    self.match(NAME)
                elif la1 and la1 in [LITERAL_asc,LITERAL_desc,LITERAL_ASC,LITERAL_DESC]:
                    pass
                else:
                        raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                    
            elif la1 and la1 in [NUMBER]:
                pass
                tmp5_AST = None
                tmp5_AST = self.astFactory.create(self.LT(1))
                self.makeASTRoot(currentAST, tmp5_AST)
                self.match(NUMBER)
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [LITERAL_asc]:
                pass
                tmp6_AST = None
                tmp6_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp6_AST)
                self.match(LITERAL_asc)
            elif la1 and la1 in [LITERAL_desc]:
                pass
                tmp7_AST = None
                tmp7_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp7_AST)
                self.match(LITERAL_desc)
            elif la1 and la1 in [LITERAL_ASC]:
                pass
                tmp8_AST = None
                tmp8_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp8_AST)
                self.match(LITERAL_ASC)
            elif la1 and la1 in [LITERAL_DESC]:
                pass
                tmp9_AST = None
                tmp9_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp9_AST)
                self.match(LITERAL_DESC)
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
            field_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_1)
        
        self.returnAST = field_AST
    
    
    def buildTokenTypeASTClassMap(self):
        self.tokenTypeToASTClassMap = None

_tokenNames = [
    "<0>", 
    "EOF", 
    "<2>", 
    "NULL_TREE_LOOKAHEAD", 
    "COMMA", 
    "NAME", 
    "AT", 
    "NUMBER", 
    "\"asc\"", 
    "\"desc\"", 
    "\"ASC\"", 
    "\"DESC\"", 
    "WHITESPACE"
]
    

### generate bit set
def mk_tokenSet_0(): 
    ### var1
    data = [ 2L, 0L]
    return data
_tokenSet_0 = antlr.BitSet(mk_tokenSet_0())

### generate bit set
def mk_tokenSet_1(): 
    ### var1
    data = [ 18L, 0L]
    return data
_tokenSet_1 = antlr.BitSet(mk_tokenSet_1())
    
