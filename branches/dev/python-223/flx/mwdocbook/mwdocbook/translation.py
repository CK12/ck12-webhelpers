from mwlib.parser import Node, Text

class BlankArticle(Node):
    caption = 'Untitled Chapter'
    children = []

    def __init__(self, caption=caption):
        super(Node, self).__init__(caption)

class Translation(object):
    translation = {}

    def default(self, node):
        pass

    def __init__(self, translation=translation):
        self.translation = translation
