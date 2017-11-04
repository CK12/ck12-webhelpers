from translation import Translation

class Artifacts(Translation):
    def default(self, translation, node):
        return []

    def article(self, node):
        return node.full_target

    translation = {'ArticleLink': article}

    def __init__(self, translation=translation):
        super(Artifacts, self).__init__(translation)

