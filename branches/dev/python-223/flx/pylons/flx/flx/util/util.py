import re

ENCODED_ID_PATTERN = re.compile("^[A-Z]{3}\.[A-Z|1-9]{3}\.[0-9|.]+$")

#SO - 7204805 - Merges b into a
def mergeDictionariesRecursively(a, b, path=None):
    if path is None: path = []
    for key in b:
        if key in a:
            if isinstance(a[key], dict) and isinstance(b[key], dict):
                mergeDictionariesRecursively(a[key], b[key], path + [str(key)])
            elif a[key] == b[key]:
                pass # same leaf value
            else:
                raise Exception('Conflict occured while trying to recursively merge the given dictionaries at %s' % '.'.join(path + [str(key)]))
        else:
            a[key] = b[key]
    return a

def processEncodedID(encodedID):
    if encodedID and ENCODED_ID_PATTERN.match(encodedID):
        encodedID = re.sub(r'(\.)\1+', r'\1', encodedID)

        numberOfCharsToSkip = 0
        for c in reversed(encodedID):
            if c in ('0', '.'):
                numberOfCharsToSkip = numberOfCharsToSkip+1
            else:
                break
        if numberOfCharsToSkip:
            encodedID = encodedID[:-numberOfCharsToSkip]
        if len(encodedID) < 11:
            encodedID = encodedID + '0'*(11-len(encodedID))
    return encodedID