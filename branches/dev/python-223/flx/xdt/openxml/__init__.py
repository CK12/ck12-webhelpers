import logging, logging.config
import os, os.path

mydir = os.path.dirname(__file__)
configFile = os.path.abspath(os.path.join(mydir, 'logging.ini'))
#print "Loading ", configFile
logging.config.fileConfig(configFile)

