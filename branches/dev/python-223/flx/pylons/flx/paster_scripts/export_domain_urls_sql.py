from flx.model import api

def safeNull(val):
    if not val:
        return "''"
    else:
        return "'%s'" % val

def run():
    filename = "/tmp/insert_update_domain_urls.sql"
    outFile = open(filename, "w")
    pageSize = 256
    pageNum = 1
    cnt = 0
    while True:
        print "pageNum=%d, pageSize=%d" % (pageNum, pageSize)
        domains = api.getBrowseTermsByType(termTypeID=4, pageNum=pageNum, pageSize=pageSize)
        if not domains:
            break
        for domain in domains:
            domainUrl = api.getDomainUrlsForDomainID(domainID=domain.id)
            if domainUrl:
                line = "INSERT INTO `DomainUrls` (`domainID`, `url`, `iconUrl`) SELECT `id`, %s, %s FROM `BrowseTerms` WHERE `termTypeID` = 4 AND `encodedID` = %s ON DUPLICATE KEY UPDATE `url`=%s, `iconUrl`=%s;" \
                    % (safeNull(domainUrl.url), safeNull(domainUrl.iconUrl), safeNull(domain.encodedID), safeNull(domainUrl.url), safeNull(domainUrl.iconUrl))
                outFile.write('%s\n' % line)
                cnt += 1
        pageNum += 1

    outFile.close()
    print "Wrote %d lines to %s" % (cnt, filename)
