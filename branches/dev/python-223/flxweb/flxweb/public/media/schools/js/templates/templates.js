define([
    'text!schools/templates/main.html',
    'text!schools/templates/school.html',
    'text!schools/templates/book.html',
    'text!schools/templates/banner.html',
    'text!schools/templates/schoolbanner.html',
    'text!schools/templates/stateselector.html',
    'text!schools/templates/statelink.html'
], function(MAIN, SCHOOL, BOOK, BANNER, SCHOOLBANNER, STATESELECTOR, STATELINK){
    return {
        "MAIN" : MAIN,
        "SCHOOL": SCHOOL,
        "BOOK": BOOK,
        "BANNER": BANNER,
        "SCHOOLBANNER": SCHOOLBANNER,
        "STATESELECTOR": STATESELECTOR,
        "STATELINK":STATELINK
    };
});