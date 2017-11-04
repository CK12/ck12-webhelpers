import csv, os, sys, shutil

file = sys.argv[1]
inf = csv.DictReader(open(file, 'rb'))
f = open("new.csv", "wb")
outf = csv.writer(f)
outf.writerow(["subject","branch","book","chapter","Encode ID","Level 1","Level 2","Level 3", "Level 4"])

lastChapter = ""
for row in inf:
    chapter = row['chapter']
    if chapter != lastChapter:
        outf.writerow([row['subject'], row['branch'], row['book'], row['chapter'], row['Encode ID'], row['chapter'], '', '', ''])
    row['Level 4'] = row['Level 3']
    row["Level 3"] = row["Level 2"]
    row["Level 2"] = row["Level 1"]
    row["Level 1"] = ""
    outf.writerow([row['subject'], row['branch'], row['book'], row['chapter'], row['Encode ID'], row['Level 1'], row['Level 2'], row['Level 3'], row['Level 4']])
    lastChapter = chapter

f.close()

shutil.move("new.csv", file)
print "Moved to %s" % file
