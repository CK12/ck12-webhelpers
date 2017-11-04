import re

ENCODED_ID_PATTERN = re.compile("^[A-Z]{3}\.[A-Z|1-9]{3}\.[0-9|.]+$")

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