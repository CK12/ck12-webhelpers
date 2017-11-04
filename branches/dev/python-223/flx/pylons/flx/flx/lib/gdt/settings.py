import logging
import flx.lib.helpers as h


cfg = h.load_pylons_config()

#Host name
FLX_PREFIX = cfg.get('flx_prefix_url')

# GDT library home dir
GDT_LIB_HOME = '/opt/2.0/flx/pylons/flx/flx/lib/gdt/'
 
# Lesson skeleton content
CHAPTER_SKELETON_FILE = '%ssupport_files/chapter_skeleton_content.xhtml'%(GDT_LIB_HOME)
