define([], function(){
    /////////////
    // Helpers //
    /////////////

    function contains(arr, item){
        return arr.indexOf(item) > -1;
    }

    function lowerCase(str){
        if(typeof str !== 'string'){ return str; }
        return str.toLowerCase();
    }

    function escapeSpecialCharacters(text){
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    function isArrowKey(key){
        return key >= 37 && key <= 40;
    }

    function getConcept(concept) {
        // Incase this was selected from the autocomplete dropdown
        if(concept.item){
            concept = concept.item;
        }
        return concept;
    }

    function getConceptTitle(concept) {
        if(!concept){ return concept; }
        return getConcept(concept).title;
    }

    function syncApiData(concept){
        // We have to manually set the current data when we click on nodes
        // Since the data is not 1-to-1 we have to manually set it to match
        if(concept.EID){ concept.encodedID = concept.EID; }
        if(concept.name){ concept.title = concept.name; }
        return concept;
    }

    function capitalize(str){
        return str.charAt(0).toUpperCase() +  str.slice(1);
    }

    return {
        contains: contains,
        lowerCase: lowerCase,
        escapeSpecialCharacters: escapeSpecialCharacters,
        isArrowKey: isArrowKey,
        getConcept: getConcept,
        getConceptTitle: getConceptTitle,
        syncApiData: syncApiData,
        capitalize: capitalize
    };
});