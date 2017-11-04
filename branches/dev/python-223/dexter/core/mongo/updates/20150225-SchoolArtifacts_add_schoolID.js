var records = db.SchoolArtifacts.find();
var schoolID, id;
for (var i=0; i < records.count(); i++) {
id = records[i]['_id'];
schoolID = '' + records[i]['zipcode'] + records[i]['schoolName'];
schoolID = hex_md5(schoolID);
db.SchoolArtifacts.update({'_id':id}, {'$set':{'schoolID':schoolID}})
}
