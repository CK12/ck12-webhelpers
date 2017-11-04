// SpecialSearchEntries
db.SpecialSearchEntries.ensureIndex({'term': 1}, {'unique': true});
db.SpecialSearchEntries.ensureIndex({'termTxt': "text"}, {'background': true, 'default_language': 'en'});
