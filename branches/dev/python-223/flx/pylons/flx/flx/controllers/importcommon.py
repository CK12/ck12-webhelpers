import os

def create_working_location():
    from flx.model.workdir import workdir as WD

    myUtil = WD.WorkDirectoryUtil()
    workdir_prefix = "/opt/2.0/work/"
    if not os.path.exists(workdir_prefix):
        os.mkdir(workdir_prefix)
        
    return workdir_prefix + myUtil.getWorkdir()[1]

def make_content_2_0_compat(xhtml_content):
    #inline math images
    xhtml_content = xhtml_content.replace('localhost:8983/ck12/ucs?math=','localhost/flx/math/inline/')
    xhtml_content = xhtml_content.replace('localhost:8983/ck12/ucs/?math=','localhost/flx/math/inline/')
    xhtml_content = xhtml_content.replace('localhost/ck12/ucs?math=','localhost/flx/math/inline/')
    xhtml_content = xhtml_content.replace('localhost/ck12/ucs/?math=','localhost/flx/math/inline/')
    #block math images
    xhtml_content = xhtml_content.replace('localhost:8983/ck12/ucs?blockmath=','localhost/flx/math/block/')
    xhtml_content = xhtml_content.replace('localhost:8983/ck12/ucs/?blockmath=','localhost/flx/math/block/')
    xhtml_content = xhtml_content.replace('localhost/ck12/ucs?blockmath=','localhost/flx/math/block/')
    xhtml_content = xhtml_content.replace('localhost/ck12/ucs/?blockmath=','localhost/flx/math/block/')

    #renive double http://
    xhtml_content = xhtml_content.replace('http://http://','http://')
    return xhtml_content

def fetch_front_and_backmatter( wiki_content_dir, metadata_xml, translator, rosetta_xhtml):
    from xml.dom import minidom
    from flx.lib.helpers import transform_to_xhtml
    from flx.lib.wiki_importer_lib.wiki_importer import WikiImporter
    importer = WikiImporter()
    book_skeleton_xhtml = importer.get_book_skeleton_xhtml()
    try:
        docElement = minidom.parseString(metadata_xml).documentElement
        frontmatters = docElement.getElementsByTagName('property:FrontMatter')
        backmatters = docElement.getElementsByTagName('property:BackMatter')
        front_matter_text = ""
        if frontmatters:
            front_matter_text = "<h2>Front Matter</h2>"
            for each_front_matter in frontmatters:
                front_matter_text = "%s<h3>%s</h3>" % (front_matter_text, each_front_matter.getElementsByTagName('swivt:value1')[0].childNodes[0].nodeValue.strip())
                front_matter_text_in_doc = each_front_matter.getElementsByTagName('swivt:value2')[0].childNodes[0].nodeValue.strip()
                front_matter_text = "%s%s" % (front_matter_text, rosetta_xhtml.to_rosetta_xhtml(translator.get_rosetta_xhtml(front_matter_text_in_doc)))
                front_matter_text = make_content_2_0_compat(front_matter_text)
            front_matter_text = transform_to_xhtml(front_matter_text)
            front_matter_text = rosetta_xhtml.to_rosetta_xhtml(front_matter_text)
        back_matter_text = ""
        if backmatters:
            back_matter_text = "<h2>Back Matter</h2>"
            for each_back_matter in backmatters:
                back_matter_text = "%s<h3>%s</h3>" % (back_matter_text, each_back_matter.getElementsByTagName('swivt:value1')[0].childNodes[0].nodeValue.strip())
                back_matter_text_in_doc = each_back_matter.getElementsByTagName('swivt:value2')[0].childNodes[0].nodeValue.strip()
                back_matter_text = "%s%s" % (back_matter_text, rosetta_xhtml.to_rosetta_xhtml(translator.get_rosetta_xhtml(back_matter_text_in_doc)))
                back_matter_text = make_content_2_0_compat(back_matter_text)
            back_matter_text = transform_to_xhtml(back_matter_text)
            back_matter_text = rosetta_xhtml.to_rosetta_xhtml(back_matter_text)
        book_xhtml_content = book_skeleton_xhtml.replace('%FRONTMATTER%',front_matter_text).replace('%BACKMATTER%',back_matter_text)
    except Exception as e:
        book_xhtml_content = book_skeleton_xhtml.replace('%FRONTMATTER%','').replace('%BACKMATTER%','')
    wxf = open("%s/%s" % (wiki_content_dir, 'book.xhtml'), "w")
    try:
        wxf.write(book_xhtml_content)
    finally:
        wxf.close()

def transform_1x_to_2x(source_dir, wiki_content_dir):
    from flx.lib.wiki_importer_lib.translator import CK12Translator
    from flx.lib.wiki_importer_lib.rosetta_xhtml import CK12RosettaXHTML

    dir_walker = os.walk(source_dir)
    translator = CK12Translator()
    rosetta_xhtml = CK12RosettaXHTML()
    f = open(source_dir+"/metadata.xml", 'r')
    try:
        metadata_content = f.read()
    except Exception as e:
        metadata_content = ""
    finally:
        f.close()
    fetch_front_and_backmatter(wiki_content_dir, metadata_content, translator, rosetta_xhtml)
    metadata_content = metadata_content.replace('<book>', "<book fileref='%s/book.xhtml'>" % (wiki_content_dir))
    raw_content_paths = dir_walker.next()
    for each_file in raw_content_paths[2]:
        import shutil

        if each_file.startswith('metadata'):
            continue
        number = each_file.replace('chapter_','').replace('.xml','')
        new_chapter_path = 'chapter_%s' % str(int(number))
        os.makedirs("%s/%s" % (wiki_content_dir, new_chapter_path))
        old_image_dir = 'images_%s' % number
        new_image_dir = "%s/%s" % (new_chapter_path, 'chapter_images')
        shutil.copy("%s/%s" % (source_dir, each_file), "%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml'))
        if os.path.exists("%s/%s" % (source_dir, old_image_dir)):
            shutil.copytree("%s/%s" % (source_dir, old_image_dir), "%s/%s" % (wiki_content_dir, new_image_dir))
        metadata_content = metadata_content.replace(each_file, "%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml') )

        rf = open("%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml'), "r")
        try:
            chapter_content = rf.read()
        finally:
            rf.close()
        chapter_xhtml_content = translator.get_rosetta_xhtml(chapter_content)
        chapter_xhtml_content = chapter_xhtml_content.replace(old_image_dir,"%s%s" % (wiki_content_dir, new_image_dir))
        chapter_xhtml_content = rosetta_xhtml.to_rosetta_xhtml(chapter_xhtml_content)
        chapter_xhtml_content = make_content_2_0_compat(chapter_xhtml_content)

        wf = open("%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml'), "w")
        try:
            wf.write(chapter_content)
        finally:
            wf.close()
        wxf = open("%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xhtml'), "w")
        try:
            wxf.write(chapter_xhtml_content)
        finally:
            wxf.close()

    f = open(wiki_content_dir+"/metadata.xml", "w")
    try:
        f.write(metadata_content)
    finally:
        f.close()
    return 
