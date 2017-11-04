import os
from subprocess import PIPE, Popen
import sys

from flx.lib.wiki_importer_lib.rosetta_xhtml import CK12RosettaXHTML

def fix_rosetta_compliance(dir):
    basedir = dir
    print "Files in ", os.path.abspath(dir), ": "
    subdirlist = []
    for item in os.listdir(dir):
        if os.path.isfile(os.path.join(basedir, item)) and item.endswith('.xhtml'):
            print item
            f = open('invalid.log', 'a')
            convert_to_rosetta(os.path.join(basedir, item))
            cmd = "python flx/lib/rosetta.py -c %s"%os.path.join(basedir, item)
            p = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE, shell=True)
            content = p.communicate()
            if content[0]:
                print content[0]
                f.write('\n'+os.path.join(basedir, item))
                f.write('\n---------------------------------\n')
                f.write(content[0]+'\n')
            f.close()
        else:
            subdirlist.append(os.path.join(basedir, item))
    for subdir in subdirlist:
        fix_rosetta_compliance(subdir)

def convert_to_rosetta(file_path):
    f = open(file_path,'r')
    content = f.read()
    f.close()
    f = open(file_path,'w')
    #f = open('test_output.xhtml','w')
    rosetta_driver = CK12RosettaXHTML()
    content = rosetta_driver.to_rosetta_xhtml(content)
    f.write(content)
    f.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        fix_rosetta_compliance(sys.argv[1])
    else:
        print "\nPlease give dir path containing xhtml files to be fixed.\n"
