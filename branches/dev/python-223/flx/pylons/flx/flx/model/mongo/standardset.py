from flx.model.mongo.validationwrapper import ValidationWrapper

class StandardSet(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['name', 'country', 'longName', 'sequence']
        self.field_dependencies = { }

    def getByName(self,name, country):
        return self.db.StandardSets.find_one({'name': name, 'country': country})
