import os

def process(csv, dest, execPath, toExport):
    os.chdir(dest)
    prevEmail = ''
    meta = None
    try:
        line = csv.readline().rstrip()
        nl = ''
        while line:
            #
            #  Get data.
            #
            import re

            items = re.split(r'(?<!\\),', line)
            id = items[0]
            published = items[1]
            updated = items[2]
            email = items[3]
            title = items[4]
            if len(items) == 6:
                lastLogin = items[5]
            else:
                #
                #  Linefeed in title.
                #
                print 'len[%s]' % len(items)
                print 'line[%s]' % line
                print 'items[%s]' % items
                l = 1
                while l == 1:
                    nl = csv.readline().rstrip()
                    print 'nl[%s]' % nl
                    items = re.split(r'(?<!\\),', nl)
                    title = '%s\n%s' % (title, items[0])
                    l = len(items)
                lastLogin = items[1]

            if email != prevEmail:
                #
                #  Next user.
                #
                if meta is not None:
                    meta.close()
                    meta = None
                if prevEmail != '':
                    os.chdir('..')
                os.mkdir(email)
                os.chdir(email)
                ll = open('last-login', 'w')
                try:
                    ll.write('%s\n' % lastLogin)
                finally:
                    ll.close()
                meta = open('meta', 'w')
                prevEmail = email
            #
            #  Write meta data.
            #
            meta.write('%s,%s,%s,%s\n' % (id, published, title, updated))
            #
            #  Export.
            #
            if toExport:
                from subprocess import call

                print "Processing flexbook: %s for %s" % (id, email)
                call('%s/export-1x-fid.sh %s' % (execPath, id), shell=True)
            #
            #  Read the next line.
            #
            line = csv.readline().rstrip()
    except Exception, e:
        print 'Exception[%s]' % e
        print 'line[%s]' % line
        print 'nl[%s]' % nl
        print 'items[%s]' % items
    finally:
        if meta is not None:
            meta.close()

if __name__ == "__main__":
    def setupArgs():
        from optparse import OptionParser

        parser = OptionParser(description='Export 1.x flexbook information')
        parser.add_option('--csv', dest='csvName', type=str, help='Location of csv file containing flexbook information')
        parser.add_option('--dest', dest='dest', type=str, help='Root of exported location')
        parser.add_option('--exec', dest='execPath', type=str, help='Location of executables')
        return parser

    parser = setupArgs()
    (options, args) = parser.parse_args()
    if not options.csvName:
        raise Exception('Location of csv file required')
    if not options.dest:
        raise Exception('Location of destination required')
    if not options.execPath:
        raise Exception('Location of executable required')

    csv = open(options.csvName, 'r')
    process(csv, options.dest, options.execPath, False)
