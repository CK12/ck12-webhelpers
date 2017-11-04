### $ANTLR 2.7.7 (20110618): "filter.g" -> "ftparser.py"$
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
LITERAL_and = 4
LITERAL_or = 5
NOT = 6
EQ = 7
GT = 8
GE = 9
LT = 10
LE = 11
IN = 12
LITERAL = 13
LEFT_PAREN = 14
COMMA = 15
RIGHT_PAREN = 16
NAME = 17
AT = 18
DOT = 19
ID = 20
WHITESPACE = 21
DASH = 22

class Parser(antlr.LLkParser):
    ### user action >>>
    class ParserException(Exception):
       def __init__(self, exc): self.exc = exc
       def __str__(self): return str(self.exc)
    def reportError(self, exc): raise Parser.ParserException(exc)
    ### user action <<<
    
    def __init__(self, *args, **kwargs):
        antlr.LLkParser.__init__(self, *args, **kwargs)
        self.tokenNames = _tokenNames
        self.buildTokenTypeASTClassMap()
        self.astFactory = antlr.ASTFactory(self.getTokenTypeToASTClassMap())
        self.astFactory.setASTNodeClass()
        
    def filter_list(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        filter_list_AST = None
        try:      ## for error handling
            pass
            self.comparison()
            self.addASTChild(currentAST, self.returnAST)
            while True:
                if (_tokenSet_0.member(self.LA(1))):
                    pass
                    self.and_or()
                    self.addASTChild(currentAST, self.returnAST)
                    pass
                    self.comparison()
                    self.addASTChild(currentAST, self.returnAST)
                else:
                    break
                
            filter_list_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_1)
        
        self.returnAST = filter_list_AST
    
    def comparison(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        comparison_AST = None
        try:      ## for error handling
            pass
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [NOT]:
                pass
                tmp1_AST = None
                tmp1_AST = self.astFactory.create(self.LT(1))
                self.makeASTRoot(currentAST, tmp1_AST)
                self.match(NOT)
            elif la1 and la1 in [NAME]:
                pass
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
            self.coordinate()
            self.addASTChild(currentAST, self.returnAST)
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [EQ,GT,GE,LT,LE,IN]:
                pass
                self.comp_op()
                self.addASTChild(currentAST, self.returnAST)
                self.comp_value()
                self.addASTChild(currentAST, self.returnAST)
            elif la1 and la1 in [EOF,LITERAL_and,LITERAL_or,NOT,NAME]:
                pass
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
            comparison_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_2)
        
        self.returnAST = comparison_AST
    
    def and_or(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        and_or_AST = None
        try:      ## for error handling
            pass
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [LITERAL_and]:
                pass
                tmp2_AST = None
                tmp2_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp2_AST)
                self.match(LITERAL_and)
            elif la1 and la1 in [LITERAL_or]:
                pass
                tmp3_AST = None
                tmp3_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp3_AST)
                self.match(LITERAL_or)
            elif la1 and la1 in [NOT,NAME]:
                pass
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
            and_or_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_3)
        
        self.returnAST = and_or_AST
    
    def coordinate(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        coordinate_AST = None
        try:      ## for error handling
            pass
            tmp4_AST = None
            tmp4_AST = self.astFactory.create(self.LT(1))
            self.makeASTRoot(currentAST, tmp4_AST)
            self.match(NAME)
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [AT]:
                pass
                tmp5_AST = None
                tmp5_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp5_AST)
                self.match(AT)
                self.path()
                self.addASTChild(currentAST, self.returnAST)
            elif la1 and la1 in [EOF,LITERAL_and,LITERAL_or,NOT,EQ,GT,GE,LT,LE,IN,NAME]:
                pass
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
            coordinate_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_4)
        
        self.returnAST = coordinate_AST
    
    def comp_op(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        comp_op_AST = None
        try:      ## for error handling
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [EQ]:
                pass
                tmp6_AST = None
                tmp6_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp6_AST)
                self.match(EQ)
                comp_op_AST = currentAST.root
            elif la1 and la1 in [GT]:
                pass
                tmp7_AST = None
                tmp7_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp7_AST)
                self.match(GT)
                comp_op_AST = currentAST.root
            elif la1 and la1 in [GE]:
                pass
                tmp8_AST = None
                tmp8_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp8_AST)
                self.match(GE)
                comp_op_AST = currentAST.root
            elif la1 and la1 in [LT]:
                pass
                tmp9_AST = None
                tmp9_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp9_AST)
                self.match(LT)
                comp_op_AST = currentAST.root
            elif la1 and la1 in [LE]:
                pass
                tmp10_AST = None
                tmp10_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp10_AST)
                self.match(LE)
                comp_op_AST = currentAST.root
            elif la1 and la1 in [IN]:
                pass
                tmp11_AST = None
                tmp11_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp11_AST)
                self.match(IN)
                comp_op_AST = currentAST.root
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_5)
        
        self.returnAST = comp_op_AST
    
    def comp_value(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        comp_value_AST = None
        try:      ## for error handling
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [LITERAL]:
                pass
                tmp12_AST = None
                tmp12_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp12_AST)
                self.match(LITERAL)
                comp_value_AST = currentAST.root
            elif la1 and la1 in [LEFT_PAREN]:
                pass
                tmp13_AST = None
                tmp13_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp13_AST)
                self.match(LEFT_PAREN)
                tmp14_AST = None
                tmp14_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp14_AST)
                self.match(LITERAL)
                while True:
                    if (self.LA(1)==COMMA):
                        pass
                        tmp15_AST = None
                        tmp15_AST = self.astFactory.create(self.LT(1))
                        self.addASTChild(currentAST, tmp15_AST)
                        self.match(COMMA)
                        tmp16_AST = None
                        tmp16_AST = self.astFactory.create(self.LT(1))
                        self.addASTChild(currentAST, tmp16_AST)
                        self.match(LITERAL)
                    else:
                        break
                    
                tmp17_AST = None
                tmp17_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp17_AST)
                self.match(RIGHT_PAREN)
                comp_value_AST = currentAST.root
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_2)
        
        self.returnAST = comp_value_AST
    
    def path(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        path_AST = None
        try:      ## for error handling
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in [DOT]:
                pass
                tmp18_AST = None
                tmp18_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp18_AST)
                self.match(DOT)
                path_AST = currentAST.root
            elif la1 and la1 in [ID]:
                pass
                tmp19_AST = None
                tmp19_AST = self.astFactory.create(self.LT(1))
                self.addASTChild(currentAST, tmp19_AST)
                self.match(ID)
                while True:
                    if (self.LA(1)==DOT):
                        pass
                        tmp20_AST = None
                        tmp20_AST = self.astFactory.create(self.LT(1))
                        self.addASTChild(currentAST, tmp20_AST)
                        self.match(DOT)
                        tmp21_AST = None
                        tmp21_AST = self.astFactory.create(self.LT(1))
                        self.addASTChild(currentAST, tmp21_AST)
                        self.match(ID)
                    else:
                        break
                    
                path_AST = currentAST.root
            elif la1 and la1 in [NAME]:
                pass
                self.identifier()
                self.addASTChild(currentAST, self.returnAST)
                while True:
                    if (self.LA(1)==DOT):
                        pass
                        tmp22_AST = None
                        tmp22_AST = self.astFactory.create(self.LT(1))
                        self.addASTChild(currentAST, tmp22_AST)
                        self.match(DOT)
                        self.identifier()
                        self.addASTChild(currentAST, self.returnAST)
                    else:
                        break
                    
                path_AST = currentAST.root
            else:
                    raise antlr.NoViableAltException(self.LT(1), self.getFilename())
                
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_4)
        
        self.returnAST = path_AST
    
    def identifier(self):    
        
        self.returnAST = None
        currentAST = antlr.ASTPair()
        identifier_AST = None
        try:      ## for error handling
            pass
            tmp23_AST = None
            tmp23_AST = self.astFactory.create(self.LT(1))
            self.addASTChild(currentAST, tmp23_AST)
            self.match(NAME)
            identifier_AST = currentAST.root
        
        except antlr.RecognitionException, ex:
            self.reportError(ex)
            self.consume()
            self.consumeUntil(_tokenSet_6)
        
        self.returnAST = identifier_AST
    
    
    def buildTokenTypeASTClassMap(self):
        self.tokenTypeToASTClassMap = None

_tokenNames = [
    "<0>", 
    "EOF", 
    "<2>", 
    "NULL_TREE_LOOKAHEAD", 
    "\"and\"", 
    "\"or\"", 
    "NOT", 
    "EQ", 
    "GT", 
    "GE", 
    "LT", 
    "LE", 
    "IN", 
    "LITERAL", 
    "LEFT_PAREN", 
    "COMMA", 
    "RIGHT_PAREN", 
    "NAME", 
    "AT", 
    "DOT", 
    "ID", 
    "WHITESPACE", 
    "DASH"
]
    

### generate bit set
def mk_tokenSet_0(): 
    ### var1
    data = [ 131184L, 0L]
    return data
_tokenSet_0 = antlr.BitSet(mk_tokenSet_0())

### generate bit set
def mk_tokenSet_1(): 
    ### var1
    data = [ 2L, 0L]
    return data
_tokenSet_1 = antlr.BitSet(mk_tokenSet_1())

### generate bit set
def mk_tokenSet_2(): 
    ### var1
    data = [ 131186L, 0L]
    return data
_tokenSet_2 = antlr.BitSet(mk_tokenSet_2())

### generate bit set
def mk_tokenSet_3(): 
    ### var1
    data = [ 131136L, 0L]
    return data
_tokenSet_3 = antlr.BitSet(mk_tokenSet_3())

### generate bit set
def mk_tokenSet_4(): 
    ### var1
    data = [ 139250L, 0L]
    return data
_tokenSet_4 = antlr.BitSet(mk_tokenSet_4())

### generate bit set
def mk_tokenSet_5(): 
    ### var1
    data = [ 24576L, 0L]
    return data
_tokenSet_5 = antlr.BitSet(mk_tokenSet_5())

### generate bit set
def mk_tokenSet_6(): 
    ### var1
    data = [ 663538L, 0L]
    return data
_tokenSet_6 = antlr.BitSet(mk_tokenSet_6())
    
