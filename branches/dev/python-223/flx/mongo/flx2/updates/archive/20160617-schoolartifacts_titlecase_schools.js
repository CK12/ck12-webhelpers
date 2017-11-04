//Function to convert given string to title case.
toProperCase = function(title) {
  var words = title.split(' ');
  var results = [];
  for (var i=0; i < words.length; i++) {
      var letter = words[i].charAt(0).toUpperCase();
      results.push(letter + words[i].slice(1));
  }
  return results.join(' ');
};  
// Update all the school names with title case.
db.SchoolArtifacts.find().forEach(
 function(e) {
 e.schoolName = toProperCase(e.schoolName);
 db.SchoolArtifacts.save(e);
 }
)
