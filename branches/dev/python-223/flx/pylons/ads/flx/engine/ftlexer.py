### $ANTLR 2.7.7 (20110618): "filter.g" -> "ftlexer.py"$
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
### preamble action >>> 

### preamble action <<< 
### >>>The Literals<<<
literals = {}
literals[u"or"] = 5
literals[u"and"] = 4


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

class Lexer(antlr.CharScanner) :
    ### user action >>>
    ### user action <<<
    def __init__(self, *argv, **kwargs) :
        antlr.CharScanner.__init__(self, *argv, **kwargs)
        self.caseSensitiveLiterals = True
        self.setCaseSensitive(True)
        self.literals = literals
    
    def nextToken(self):
        while True:
            try: ### try again ..
                while True:
                    _token = None
                    _ttype = INVALID_TYPE
                    self.resetText()
                    try: ## for char stream error handling
                        try: ##for lexical error handling
                            la1 = self.LA(1)
                            if False:
                                pass
                            elif la1 and la1 in u'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz':
                                pass
                                self.mNAME(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'0123456789':
                                pass
                                self.mID(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'"\'':
                                pass
                                self.mLITERAL(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'\t\n\u000c\r ':
                                pass
                                self.mWHITESPACE(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u',':
                                pass
                                self.mCOMMA(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'(':
                                pass
                                self.mLEFT_PAREN(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u')':
                                pass
                                self.mRIGHT_PAREN(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u':':
                                pass
                                self.mAT(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'.':
                                pass
                                self.mDOT(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'-':
                                pass
                                self.mDASH(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'!':
                                pass
                                self.mNOT(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'=':
                                pass
                                self.mEQ(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'~':
                                pass
                                self.mIN(True)
                                theRetToken = self._returnToken
                            else:
                                if (self.LA(1)==u'>') and (self.LA(2)==u'='):
                                    pass
                                    self.mGE(True)
                                    theRetToken = self._returnToken
                                elif (self.LA(1)==u'<') and (self.LA(2)==u'='):
                                    pass
                                    self.mLE(True)
                                    theRetToken = self._returnToken
                                elif (self.LA(1)==u'>') and (True):
                                    pass
                                    self.mGT(True)
                                    theRetToken = self._returnToken
                                elif (self.LA(1)==u'<') and (True):
                                    pass
                                    self.mLT(True)
                                    theRetToken = self._returnToken
                                else:
                                    self.default(self.LA(1))
                                
                            if not self._returnToken:
                                raise antlr.TryAgain ### found SKIP token
                            ### option { testLiterals=true } 
                            self.testForLiteral(self._returnToken)
                            ### return token to caller
                            return self._returnToken
                        ### handle lexical errors ....
                        except antlr.RecognitionException, e:
                            raise antlr.TokenStreamRecognitionException(e)
                    ### handle char stream errors ...
                    except antlr.CharStreamException,cse:
                        if isinstance(cse, antlr.CharStreamIOException):
                            raise antlr.TokenStreamIOException(cse.io)
                        else:
                            raise antlr.TokenStreamException(str(cse))
            except antlr.TryAgain:
                pass
        
    def mNAME(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = NAME
        _saveIndex = 0
        pass
        la1 = self.LA(1)
        if False:
            pass
        elif la1 and la1 in u'abcdefghijklmnopqrstuvwxyz':
            pass
            self.matchRange(u'a', u'z')
        elif la1 and la1 in u'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
            pass
            self.matchRange(u'A', u'Z')
        elif la1 and la1 in u'_':
            pass
            self.match('_')
        else:
                self.raise_NoViableAlt(self.LA(1))
            
        while True:
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in u'abcdefghijklmnopqrstuvwxyz':
                pass
                self.matchRange(u'a', u'z')
            elif la1 and la1 in u'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
                pass
                self.matchRange(u'A', u'Z')
            elif la1 and la1 in u'_':
                pass
                self.match('_')
            elif la1 and la1 in u'0123456789':
                pass
                self.matchRange(u'0', u'9')
            else:
                    break
                
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mID(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = ID
        _saveIndex = 0
        pass
        _cnt28= 0
        while True:
            if ((self.LA(1) >= u'0' and self.LA(1) <= u'9')):
                pass
                self.matchRange(u'0', u'9')
            else:
                break
            
            _cnt28 += 1
        if _cnt28 < 1:
            self.raise_NoViableAlt(self.LA(1))
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mLITERAL(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = LITERAL
        _saveIndex = 0
        pass
        la1 = self.LA(1)
        if False:
            pass
        elif la1 and la1 in u'\'':
            pass
            self.match('\'')
        elif la1 and la1 in u'"':
            pass
            self.match('"')
        else:
                self.raise_NoViableAlt(self.LA(1))
            
        while True:
            if (_tokenSet_0.member(self.LA(1))) and (_tokenSet_1.member(self.LA(2))):
                pass
                self.match(_tokenSet_0)
            else:
                break
            
        la1 = self.LA(1)
        if False:
            pass
        elif la1 and la1 in u'\'':
            pass
            self.match('\'')
        elif la1 and la1 in u'"':
            pass
            self.match('"')
        else:
                self.raise_NoViableAlt(self.LA(1))
            
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mWHITESPACE(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = WHITESPACE
        _saveIndex = 0
        pass
        _cnt37= 0
        while True:
            la1 = self.LA(1)
            if False:
                pass
            elif la1 and la1 in u'\t':
                pass
                self.match('\t')
            elif la1 and la1 in u' ':
                pass
                self.match(' ')
            elif la1 and la1 in u'\r':
                pass
                self.match('\r')
            elif la1 and la1 in u'\n':
                pass
                self.match('\n')
            elif la1 and la1 in u'\u000c':
                pass
                self.match('\u000C')
            else:
                    break
                
            _cnt37 += 1
        if _cnt37 < 1:
            self.raise_NoViableAlt(self.LA(1))
        _ttype = Token.SKIP;
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mCOMMA(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = COMMA
        _saveIndex = 0
        pass
        self.match(',')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mLEFT_PAREN(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = LEFT_PAREN
        _saveIndex = 0
        pass
        self.match('(')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mRIGHT_PAREN(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = RIGHT_PAREN
        _saveIndex = 0
        pass
        self.match(')')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mAT(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = AT
        _saveIndex = 0
        pass
        self.match(':')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mDOT(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = DOT
        _saveIndex = 0
        pass
        self.match('.')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mDASH(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = DASH
        _saveIndex = 0
        pass
        self.match('-')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mNOT(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = NOT
        _saveIndex = 0
        pass
        self.match('!')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mEQ(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = EQ
        _saveIndex = 0
        pass
        self.match('=')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mGT(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = GT
        _saveIndex = 0
        pass
        self.match('>')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mGE(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = GE
        _saveIndex = 0
        pass
        self.match(">=")
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mLT(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = LT
        _saveIndex = 0
        pass
        self.match('<')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mLE(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = LE
        _saveIndex = 0
        pass
        self.match("<=")
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mIN(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = IN
        _saveIndex = 0
        pass
        self.match("~=")
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    

### generate bit set
def mk_tokenSet_0(): 
    ### var1
    data = [ -549755823617L, -1L, 0L, 0L]
    return data
_tokenSet_0 = antlr.BitSet(mk_tokenSet_0())

### generate bit set
def mk_tokenSet_1(): 
    ### var1
    data = [ -9729L, -1L, 0L, 0L]
    return data
_tokenSet_1 = antlr.BitSet(mk_tokenSet_1())
    
### __main__ header action >>> 
if __name__ == '__main__' :
    import sys
    import antlr
    import ftlexer
    
    ### create lexer - shall read from stdin
    try:
        for token in ftlexer.Lexer():
            print token
            
    except antlr.TokenStreamException, e:
        print "error: exception caught while lexing: ", e
### __main__ header action <<< 
