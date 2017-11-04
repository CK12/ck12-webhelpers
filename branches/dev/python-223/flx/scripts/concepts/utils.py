def formatEncodedID(encodedID):
    if encodedID:
        newID = ''
        parts = encodedID.split('.')
        if not parts:
            return encodedID
        cnt = 0
        for part in parts:
            if newID:
                newID += '.'
            if part.isdigit():
                if cnt == 2:
                    ## The main concept identifier
                    newID += '%03d' % int(part)
                else:
                    newID += part
            else:
                newID += part.upper()
            cnt += 1
        return newID
    return encodedID
