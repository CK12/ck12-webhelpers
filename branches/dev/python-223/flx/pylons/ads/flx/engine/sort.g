options {
	language = Python;
}

/* Parser rules */

class soparser extends Parser;

options {
    buildAST = true;
}
{
class SortOrderParserException(Exception):
    def __init__(self, exc): self.exc = exc
    def __str__(self): return str(self.exc)
def reportError(self, exc): raise Parser.SortOrderParserException(exc)
}

sort_list : field (COMMA field)* ;

field : (NAME^ (AT NAME)? | NUMBER^) ("asc" | "desc" | "ASC" | "DESC")  ;

/* Lexer rules */

class solexer extends Lexer;

options {
	k=2;
}

NAME : ('a' .. 'z' | 'A' .. 'Z' | '_')
       ('a' .. 'z' | 'A' .. 'Z' | '_' | '0' .. '9')* ;

NUMBER: ('1' .. '9') ('0' .. '9')* ;

WHITESPACE : ('\t' | ' ' | '\r' | '\n'| '\u000C')+ { $setType(Token.SKIP); } ;

AT : ':' ;

COMMA : ',' ;
