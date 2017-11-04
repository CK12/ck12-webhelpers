var records = db.SchoolArtifactsReal.find();
var artifactID, artifactTitle;
for (var i=0; i < records.count(); i++) {
artifactID = records[i]['artifactID'];
artifactTitle = records[i]['artifactTitle'];
db.SchoolArtifacts.update({'artifactID':artifactID}, {'$set':{'artifactTitle':artifactTitle}})
}
