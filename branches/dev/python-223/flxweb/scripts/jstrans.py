import polib, simplejson, argparse, os, shutil
import sys


class JSI18NExtractor :
    

    @classmethod
    def extract_js_translations(cls,
                                poname,
                                input_i18n_path, 
                                output_i18n_path):
        
        langs = None
        try:        
            langs = [ x for x in os.listdir(input_i18n_path) 
                 if os.path.isdir( os.path.join(input_i18n_path, x) ) and not x.startswith('.') ]
        except Exception, ex:
            print "could not read contents of %s" % input_i18n_path
            raise ex
        
        if len(langs) == 0:
            raise Exception("No language directories found in %s" % input_i18n_path)
        for lang in langs:
            langdir = os.path.join(input_i18n_path, lang)
            pofile_path = os.path.join(langdir, 'LC_MESSAGES', poname+'.po')
            mofile_path = os.path.join(langdir, 'LC_MESSAGES', poname+'.mo')
            if os.path.exists(pofile_path) and os.path.exists(mofile_path):
                #extract translations if both .mo and .po files are present
                po_entries = polib.pofile(pofile_path)
                mo_entries = polib.mofile(mofile_path)
                msgids = []
                translations = {}
                
                for i in po_entries:
                    occurrences = i.occurrences
                    for _file, _pos in occurrences:
                        if _file.endswith('.js'):
                            msgids.append(i.msgid)
                
                for i in mo_entries:
                    if i.msgid in msgids:
                        translations.update({i.msgid:i.msgstr })
                
                trans_js_str = 'var i18n = %s' % simplejson.dumps(translations)
                jsfile_path = os.path.join(output_i18n_path, '%s.js' % lang)
                #write the <lang>.js file
                try:
                    jsfile = open(jsfile_path,'w')
                    jsfile.write(trans_js_str)
                    jsfile.close()
                    print ("File Written: %s" % jsfile_path)
                except:
                    pass
                
                
                


def main (argv=None):
    if argv is None:
        argv = sys.argv[:1]
        
    parser = argparse.ArgumentParser(description="Script to extract JS translation strings from compiled translations")
    parser.add_argument('-i','--input_i18n_path', metavar='<PATH>', dest='input_path', 
                        default='/opt/2.0/flxweb/flxweb/i18n/', 
                        help="location of project's i18n directory. translated strings will be extracted from contents of this directory.")
    parser.add_argument('-o','--output_i18n_path', metavar='<PATH>', dest='output_path', 
                        default = '/opt/2.0/flxweb/flxweb/public/media/js/i18n/',
                        help="location of directory where js i18n files should be stored.")
    parser.add_argument('-p','--pofile_name', metavar="<name>", dest='pofile_name', default='flxweb',
                        help="Name of project's i18n files. Usually as same as project name.")
    args  = parser.parse_args()
    
    input_path = args.input_path
    if not os.path.exists(input_path):
        print "Invalid input path: %s" % input_path
    
    output_path = args.output_path
    if not os.path.exists(output_path):
        try:
            os.makedirs(output_path)
        except:
            print "could not find/create output directory at: %s" % output_path
    
    poname = args.pofile_name
    potpath = os.path.join(input_path, '%s.pot' % poname)
    if not os.path.exists( potpath ):
        print "could not find translation template file at : %s " % potpath
        print "please use correct name for -p argument"
    
    try:
        JSI18NExtractor.extract_js_translations( poname=poname,
                                             input_i18n_path=input_path,
                                             output_i18n_path=output_path )
    except Exception, ex:
        print "Could not extract JS translations."
        print ex.message
    
if __name__ == "__main__":
    main()  