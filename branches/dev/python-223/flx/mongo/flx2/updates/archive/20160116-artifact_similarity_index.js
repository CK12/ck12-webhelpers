db.ArtifactSimilarity.ensureIndex({'artifactID':-1}, {name:"artifactID-index", background:true});
db.ArtifactSimilarity.ensureIndex({'artifactID':-1, 'artifactRevisionID':-1}, {name: "artifactID_artifactRevisionID-unique-index", background:true, unique:true});
