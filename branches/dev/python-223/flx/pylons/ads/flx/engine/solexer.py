### $ANTLR 2.7.7 (20110618): "sort.g" -> "solexer.py"$
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
literals[u"ASC"] = 10
literals[u"desc"] = 9
literals[u"DESC"] = 11
literals[u"asc"] = 8


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
                            elif la1 and la1 in u'123456789':
                                pass
                                self.mNUMBER(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u'\t\n\u000c\r ':
                                pass
                                self.mWHITESPACE(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u':':
                                pass
                                self.mAT(True)
                                theRetToken = self._returnToken
                            elif la1 and la1 in u',':
                                pass
                                self.mCOMMA(True)
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
    
    def mNUMBER(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = NUMBER
        _saveIndex = 0
        pass
        pass
        self.matchRange(u'1', u'9')
        while True:
            if ((self.LA(1) >= u'0' and self.LA(1) <= u'9')):
                pass
                self.matchRange(u'0', u'9')
            else:
                break
            
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    def mWHITESPACE(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = WHITESPACE
        _saveIndex = 0
        pass
        _cnt18= 0
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
                
            _cnt18 += 1
        if _cnt18 < 1:
            self.raise_NoViableAlt(self.LA(1))
        _ttype = Token.SKIP;
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
    
    def mCOMMA(self, _createToken):    
        _ttype = 0
        _token = None
        _begin = self.text.length()
        _ttype = COMMA
        _saveIndex = 0
        pass
        self.match(',')
        self.set_return_token(_createToken, _token, _ttype, _begin)
    
    
    
### __main__ header action >>> 
if __name__ == '__main__' :
    import sys
    import antlr
    import solexer
    
    ### create lexer - shall read from stdin
    try:
        for token in solexer.Lexer():
            print token
            
    except antlr.TokenStreamException, e:
        print "error: exception caught while lexing: ", e
### __main__ header action <<< 
