db.ForumsSequence.ensureIndex({'forum_id':1}, {name:"forum_id-unique-index", background:true, unique:true});
db.ForumsSequence.ensureIndex({'sequence':1}, {name: "sequence-unique-index", background:true, unique:true});
