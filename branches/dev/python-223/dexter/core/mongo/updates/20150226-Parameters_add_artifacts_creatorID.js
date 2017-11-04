db.Parameters.update({'tableName':'Artifacts'}, {'$set':{ "attributesField" : [
                "response.artifact.artifactType",
                "response.artifact.level",
                "response.artifact.creator",
                "response.artifact.creatorID",
                "response.artifact.isModality"
        ]}})
