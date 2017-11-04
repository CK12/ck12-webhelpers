export const flexbookInfo = (state = {
  loaded: false,
  error: false
}, action) => {
  if (action.type === 'FLEXBOOK_FETCH_SUCCESS'){
    let newState = {
      ...state,
      loaded: true
    };

    var firstKey;
    for (firstKey in action.payload){
      if (action.payload[firstKey].constructor === Array) {
        break;
      }
    }

    newState.books = action.payload[firstKey];

    var collectionHandle = firstKey,
      levelBasic = [],
      levelAtGrade = [],
      levelAdvanced = [],
      languageEnglish = [],
      languageSpanish = [],
      middleSchool = [],
      highSchool = [],
      subject = subject = ( ()=> {
        let bookWithDomain = newState.books.find((book)=> ('domain' in book && book.domain));
        if (bookWithDomain && 'encodedID' in bookWithDomain.domain){
          return bookWithDomain.domain.encodedID;
        } else {
          if (bookWithDomain && 'encodedID' in bookWithDomain){
            return bookWithDomain.encodedID.substring(3,6);
          } else{
            return '';
          }
        }
      })(),
      showLanguages = true,
      showLevels = (subject == 'MAT') ? true : false,
      showSchoolTabs = (subject == 'MAT') ? true : false;
    for (var i in newState.books) {
      var book = newState.books[i];

      if (book.artifactID === 2321544){
        //Bug 54845, Bug 56749 Special case for HealthCorps FlexBook.
        let {tebook:[tebookObj]} = book.extendedArtifacts || {tebook:[null]};
        if (tebookObj){
          book = tebookObj;
          newState.books[i] = book;
        }
      }
      if (book.level == 'basic') levelBasic.push(book);
      else if (book.level == 'at grade') levelAtGrade.push(book);
      else if (book.level == 'advanced') levelAdvanced.push(book);

      var language = '';
      if (!book.encodedID){
        language = book.language;
      } else {
        var encodedIDComponants = book.encodedID.split('.');
        if (encodedIDComponants.length >= 3) language = encodedIDComponants[2];
      }
      if (language == 'ESP' || language == 'SPA' || language == 'Spanish') {
        languageSpanish.push(book);
      } else if (language == 'ENG' || language == 'English') {
        languageEnglish.push(book);
      }

      var gradeGridMin = 10;
      var gradeGridMax = 0;
      for (var j in book.gradeGrid)
      {
        if (Number(book.gradeGrid[j][1]) < gradeGridMin) {
          gradeGridMin = Number(book.gradeGrid[j][1]);
        }
        if (Number(book.gradeGrid[j][1]) > gradeGridMax) {
          gradeGridMax = Number(book.gradeGrid[j][1]);
        }
      }
      if (gradeGridMin <= 8 || book.gradeGrid.length == 0) {
        middleSchool.push(book);
      }
      if (gradeGridMax > 8 || book.gradeGrid.length == 0) {
        highSchool.push(book);
      }
    }
    // if (middleSchool.length == 0 || highSchool.length == 0) showSchoolTabs = false;
    if (languageEnglish.length == 0 || languageSpanish.length == 0) {
      showLanguages = false;
    }
    if (
      (levelBasic.length == 0 && levelAtGrade.length == 0) ||
      (levelAtGrade.length == 0 && levelAdvanced.length == 0) ||
      (levelBasic.length == 0 && levelAdvanced.length == 0)
    ) {
      showLevels = false;
    }

    newState.collectionHandle = collectionHandle;
    newState.levelBasic = levelBasic;
    newState.levelAtGrade = levelAtGrade;
    newState.levelAdvanced = levelAdvanced;
    newState.languageSpanish = languageSpanish;
    newState.languageEnglish = languageEnglish;
    newState.middleSchool = middleSchool;
    newState.highSchool = highSchool;
    newState.showLanguages = showLanguages;
    newState.showLevels = showLevels;
    newState.showSchoolTabs = showSchoolTabs;
    return newState;
  }
  if (action.type === 'FLEXBOOK_FETCH_ERROR'){
    let newState = {
      ...state,
      loaded: true,
      error:true
    };
    newState.books = {};
    return newState;
  }
  return state;
};
