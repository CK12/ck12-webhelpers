import zipfile
import sys, os, traceback
from shutil import copyfile

repo_prefix = "/opt/2.0"
common_prefix = "flxweb/flxweb/public/media/common/"

#unzip the font file
def unzip_font_file(path_to_zip_file, directory_to_extract_to='/tmp'):
    try:
      zip_ref = zipfile.ZipFile(path_to_zip_file, 'r')
      ret = zip_ref.extractall(directory_to_extract_to)
      zip_ref.close()
      path_parts = path_to_zip_file.split(os.sep)
      #print "path_parts: %s" % path_parts
      name = path_parts[-1].split('.')[0]
      fontdir_path = os.path.join(directory_to_extract_to, name)
      #print "Fontdir_path: %s" % fontdir_path
      if os.path.exists(fontdir_path):
          return fontdir_path
      else:
          return '/tmp/'
    except Exception as e:
        print "Failed to unzip: %s" % e
        traceback.print_exc()
        return ''

def copy_font_files(fontdir_path, destination_prefix):

    # 1. copy font files
    ck12_fontdir_prefix = os.path.join(destination_prefix, 'font/ck12/')
    #print "fontdir_path %s, ck12_fontdir_path: %s" %(fontdir_path, ck12_fontdir_prefix)
    copyfile(os.path.join(fontdir_path, 'fonts/ck12.svg'), os.path.join(ck12_fontdir_prefix, 'ck12.svg'))
    copyfile(os.path.join(fontdir_path, 'fonts/ck12.ttf'), os.path.join(ck12_fontdir_prefix, 'ck12.ttf'))
    copyfile(os.path.join(fontdir_path, 'fonts/ck12.woff'), os.path.join(ck12_fontdir_prefix, 'ck12.woff'))
    copyfile(os.path.join(fontdir_path, 'selection.json'), os.path.join(ck12_fontdir_prefix, 'selection.json'))
    
    # 2. edited and copy the css file
    ck12_css_prefix = os.path.join(destination_prefix, 'css/')
    source_css = os.path.join(fontdir_path, 'style.css')
    fontck12_css = os.path.join(ck12_css_prefix, 'fontck12.css')
    with open(source_css, 'r') as f:
        with open(fontck12_css, 'w') as d:
            content = f.read()
            content = content.replace("url('fonts/", "url('../font/ck12/")
            content = content.replace("  color: #56544d;\n", "")
            d.write(content)
    
def help():
    print "Usage: %s path_to_font_zip_file [prefix_to_repo_root, default='/opt/2.0']"

if __name__ == '__main__':
   if len(sys.argv) < 2:
       help()
       sys.exit(1)
   else:    
       try:
           print "Argv len: %s" % len(sys.argv)
           path_to_zip_file = sys.argv[1]
           source_path = unzip_font_file(path_to_zip_file)
           if len(sys.argv) >= 3:
               repo_prefix = sys.argv[2]
           destination_prefix = os.path.join(repo_prefix, common_prefix) 
           #print 'destination_prefix: %s %s %s' % (repo_prefix, common_prefix, destination_prefix)
           copy_font_files(source_path, destination_prefix)
           print "Font files have been copied to %s. Please perform 'svn diff' to verify the changes and then commit them." \
                 % destination_prefix
       except Exception as e:
           print "Error in reloading CK12 font file: %s" % e
           traceback.print_exc()
