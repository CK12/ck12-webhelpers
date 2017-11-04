import re
import os,sys


book_dirs = []
book_dirs.extend(sys.argv)
if len(book_dirs) <= 1:
    print "Usage: python get_duplicate_titles <One or more 1.x book_dir_path(s) holding chapter xmls>"

if len(book_dirs) >= 1:
    del book_dirs[0]

subtitles = {}

for each in book_dirs:
    subtitles[each] = []
    for each_file in os.listdir(each):
      if each_file.startswith('chapter_') and each_file.endswith('.xml'):
        f = open('%s/%s'%(each,each_file))
        content = f.read()
        f.close()
        title_re = re.compile('<sect1><title>(.*?)</title>',re.DOTALL)
        titles = title_re.findall(content)
        titles = [k.strip() for k in titles]
        subtitles[each].extend(titles)

combinations = []

for i in range(0,len(book_dirs)):
    for j in range(0,len(book_dirs)):
      if not combinations.__contains__([book_dirs[i],book_dirs[j]]) and not combinations.__contains__([book_dirs[j],book_dirs[i]]):
          if i != j:
            if set(subtitles[book_dirs[i]]) & set(subtitles[book_dirs[j]]) != set([]):
              print "Comparing: %s and %s" % (book_dirs[i],book_dirs[j])
              print set(subtitles[book_dirs[i]]) & set(subtitles[book_dirs[j]])
              print 2*'\n'
          else:
            test = []
            test.extend(subtitles[book_dirs[i]])
            while test != []:
                k = test.pop()
                if test.__contains__(k):
                  print "'%s' found in the same book '%s', duplicated." % (k,book_dirs[i])
                  print 2*'\n'
          combinations.append([book_dirs[i],book_dirs[j]])

