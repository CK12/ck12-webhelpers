db.Standards.ensureIndex({"grades": 1}, {'background': true});
db.Standards.ensureIndex({"subjects": 1}, {'background': true});
db.Standards.ensureIndex({"conceptEids": 1}, {'background': true});
db.Standards.ensureIndex({"ancestorSIDs": 1}, {'background': true});
db.Standards.ensureIndex({"label": 1}, {"background": true});
print("Finished indexes on Standards");

db.StandardSets.ensureIndex({"name": 1, "country": 1}, {unique: true});
print("Finished indexes on StandardSets");

db.ConceptNodes.ensureIndex({"encodedID": 1}, {unique: true});
db.ConceptNodes.ensureIndex({"handle": 1}, {'background': true});
db.ConceptNodes.ensureIndex({"branch": 1}, {'background': true});
db.ConceptNodes.ensureIndex({"parentID": 1}, {'background': true});
db.ConceptNodes.ensureIndex({"subject": 1}, {'background': true});
db.ConceptNodes.ensureIndex({"subject.shortname": 1, "branch.shortname": 1, "rank": 1}, {"background": true});
print("Finished indexes on ConceptNodes");

db.LMSUserData.ensureIndex({"memberID": 1, "lmsAppName": 1}, {'unique': true});
db.RelatedArtifacts.ensureIndex({"encodedID": 1}, {"background": true});
db.RelatedArtifacts.ensureIndex({'encodedID': 1, 'conceptCollectionHandle': 1, 'collectionCreatorID': 1}, {'background': true});
// db.RecommendationRequests.ensureIndex({"_id": 1, "pageNum": 1, "pageSize": 1, "instanceID": 1, "creationTime": 1, "memberID": 1, "encodedID": 1, "modalityTypes": 1, "scoreLevel": 1}, {"background": true, "name": "RecommendationRequests_Idx_1"});

db.AppUserData.ensureIndex({"memberID": 1, "appName": 1}, {'unique': true});

db.Standards.ensureIndex({"sid": 1}, {unique: true});
db.Standards.ensureIndex({"standardSet": 1}, {'background': true});

db.UrlMappings.ensureIndex({'oldUrl': 1}, {'unique': true});

// SpecialSearchEntries
db.SpecialSearchEntries.ensureIndex({'term': 1}, {'unique': true});
db.SpecialSearchEntries.ensureIndex({'termTxt': "text"}, {'background': true, 'default_language': 'en'});

db.UserDevices.ensureIndex({"loggedInUserID": 1, 'appCode': 1}, {"background": true});
db.UserDevices.ensureIndex({"appCode": 1}, {"background": true});
db.UserDevices.ensureIndex({"platform": 1, "pushIdentifier": 1}, {"background": true});

// ArtifactSimilarity
db.ArtifactSimilarity.ensureIndex({'artifactID': 1}, {'background': true});
db.ArtifactSimilarity.ensureIndex({'artifactRevisionID': 1}, {'background': true});

//ForumsSequence
db.ForumsSequence.ensureIndex({'forum_id':1}, {name:"forum_id-unique-index", background:true, unique:true});
db.ForumsSequence.ensureIndex({'sequence':1}, {name: "sequence-unique-index", background:true, unique:true});

db.FlxadminUserRoleAcl.ensureIndex({ 'user_role': 1}, {name: "user_role-unique-index", background: true, unique: true});

db.ArtifactVisits.ensureIndex({"memberID": 1}, {background: true})
db.ArtifactVisits.ensureIndex({"memberID": 1, "artifactID": 1}, {background: true})
db.ArtifactVisits.ensureIndex({"memberID" : 1, "modalityType" : 1, "isModality" : 1, "branch" : 1, "subject" : 1, "withEID" : 1, "lastReadAt" : -1}, {background: true})
db.ArtifactVisits.ensureIndex({"visitorID": 1}, {background: true})
db.ArtifactVisits.ensureIndex({"visitorID": 1, "artifactID": 1}, {background: true})
db.ArtifactVisits.ensureIndex({"visitorID" : 1, "modalityType" : 1, "isModality" : 1, "branch" : 1, "subject" : 1, "withEID" : 1, "lastReadAt" : -1}, {background: true})
db.ArtifactVisits.ensureIndex({'artifactID': 1}, {'background': true});
print("Finished ArtifactVisits indexes");

//CollectionNodes
db.CollectionNodes.ensureIndex({'absoluteHandle': 1, 'collection.handle': 1, 'collection.creatorID': 1}, {'unique': true});
db.CollectionNodes.ensureIndex({'descendantIdentifier': 1, 'collection.handle': 1, 'collection.creatorID': 1}, {'unique': true});
db.CollectionNodes.ensureIndex({'rank': 1, 'collection.handle': 1, 'collection.creatorID': 1}, {'unique': true});
db.CollectionNodes.ensureIndex({'encodedID': 1}, {'background': true});
print("Finished CollectionNodes indexes");

db.ModalityAggregate.ensureIndex({ "time_bucket" : 1, "modality_type" : 1,"country" : 1,"state" : 1 }, {'background':true})
db.ModalityAggregate.ensureIndex({ "collection_handle" : 1, "time_bucket" : 1, "modality_type" : 1,"country" : 1,"state" : 1 }, {'background':true})

print("Finished all indexes");
