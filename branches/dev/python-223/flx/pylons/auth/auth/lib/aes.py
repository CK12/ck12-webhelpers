import sys

reload(sys)
sys.setdefaultencoding('utf-8')

from Crypto.Cipher import AES
import binascii
import logging
import base64

log = logging.getLogger(__name__)

def encrypt(data, key):
    if not data:
        return data

    try:
        data = data.decode('utf-8').encode('utf-8')
    except Exception, e:
        raise e

    cipher = AES.new(key)
    data = data + (' ' * ((16 - (len(data) % 16)) % 16))
    value = binascii.hexlify(cipher.encrypt(data))
    return value

def decrypt(data, key):
    from auth.lib.helpers import safe_decode
    if not data:
        return data

    cipher = AES.new(key)
    try:
        value = cipher.decrypt(binascii.unhexlify(data)).rstrip()
    except (TypeError, ValueError, binascii.Error):
        value = data
    try:
        safe_decode(value)
    except UnicodeDecodeError, ude:
        log.warn("cannot decode to unicode.")
        value = base64.urlsafe_b64encode(value)
    return value
