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

def splitEncodedID(encodedID):
    subject = None
    branch = None
    numbers = None

    if encodedID:
        parts = encodedID.split('.')
        if len(parts) > 0:
            subject = parts[0]
        if len(parts) > 1:
            branch = parts[1]
        if len(parts) > 2:
            numbers = '.'.join(parts[:2])

    return (subject, branch, numbers)
