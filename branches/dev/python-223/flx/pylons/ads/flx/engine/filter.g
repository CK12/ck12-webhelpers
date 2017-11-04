options {
	language = Python;
}

/* Parser rules */

class ftparser extends Parser;

options {
    buildAST = true;
}
{
class ParserException(Exception):
    def __init__(self, exc): self.exc = exc
    def __str__(self): return str(self.exc)
def reportError(self, exc): raise Parser.ParserException(exc)
}

filter_list : comparison (and_or (comparison))* ;

and_or : ("and"|"or")? ;

comparison : (NOT^)? coordinate (comp_op comp_value)? ;

comp_op : EQ
    | GT
    | GE
    | LT
    | LE
    | IN
    ;

comp_value : LITERAL
	| LEFT_PAREN LITERAL (COMMA LITERAL)* RIGHT_PAREN
	;
	
coordinate : NAME^ (AT path)? ;

path : DOT 
    | ID (DOT ID)*
    | identifier (DOT identifier)* ;

identifier : NAME ;

/* Lexer rules */

class ftlexer extends Lexer;

options {
	k=2;
}

NAME : ('a' .. 'z' | 'A' .. 'Z' | '_')
       ('a' .. 'z' | 'A' .. 'Z' | '_' | '0' .. '9')* ;

ID : ('0'..'9')+ ;

LITERAL : ('\'' | '"') (~('\'' | '\t' | '\r' | '\n'))* ('\'' | '"') ;

WHITESPACE : ('\t' | ' ' | '\r' | '\n'| '\u000C')+ { $setType(Token.SKIP); } ;

COMMA : ',' ;

LEFT_PAREN : '(' ;

RIGHT_PAREN : ')' ;

AT : ':' ;

DOT : '.' ;

DASH : '-' ;

NOT : '!' ;

EQ : '=' ;

GT : '>' ;

GE : ">=" ;

LT : '<' ;

LE : "<=" ;

IN : "~=" ;

