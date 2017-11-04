var results = db.Standards.aggregate([ {$unwind:"$conceptEids"}, {$group:{_id:"$conceptEids", sids:{$addToSet: {sid:"$sid", description:"$description"} } }  }  ]);
var results = results.result;
for (var i = 0; i < results.length; i++) {
        encoded_id = results[i]['_id'];
        if (encoded_id.indexOf('SCI.PHY') != 0) {
            continue;
        }
        concept_node = db.ConceptNodes.findOne({'encodedID':encoded_id})
        for (var j = 0; j < results[i]['sids'].length; j++) {
            var output = '"' + encoded_id + '"' + "," +
                         '"' + concept_node['name'] + '"' + "," +
                         '"' +results[i]['sids'][j]['sid'] + '"' + "," +
                         '"' + results[i]['sids'][j]['description'] + '"';
            print(output);
        }
}
