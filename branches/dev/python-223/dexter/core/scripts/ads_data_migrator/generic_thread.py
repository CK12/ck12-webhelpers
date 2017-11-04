#!/usr/bin/python

import threading

class GenericThread (threading.Thread):
    def __init__(self, func_name, *args):
        threading.Thread.__init__(self)
        self.func_name = func_name
        self.args = args

    def run(self):
        self.func_name(self.args)

