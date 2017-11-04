from flx.model import api

def run():
    f = open('/tmp/update_resources.sql', 'w')
    f.write("LOCK TABLES `Resources` WRITE, `ResourceRevisions` WRITE;\n")
    f.write("/*!40000 ALTER TABLE `Resources` DISABLE KEYS */;\n")
    f.write("/*!40000 ALTER TABLE `ResourceRevisions` DISABLE KEYS */;\n")

    pageSize = 128
    pageNum = 1
    while True:
        r = api.getResources(pageNum=pageNum, pageSize=pageSize)
        if not r:
            break
        for resource in r:
            try:
                if resource.isExternal or resource.type.versionable or resource.type.streamable:
                    continue
                if not resource.satelliteUrl:
                    continue

                f.write("UPDATE `Resources` SET `satelliteUrl` = '%s', `checksum` = '%s' WHERE `id` = %d;\n" % (resource.satelliteUrl, resource.checksum, resource.id))
                f.write("UPDATE `ResourceRevisions` SET `filesize` = %d WHERE `id` = %d;\n" % (resource.revisions[0].filesize, resource.revisions[0].id))
            except Exception, e:
                print e
            
        pageNum += 1

    f.write("/*!40000 ALTER TABLE `ResourceRevisions` ENABLE KEYS */;\n")
    f.write("/*!40000 ALTER TABLE `Resources` ENABLE KEYS */;\n")
    f.write("UNLOCK TABLES;\n")
    f.close()

