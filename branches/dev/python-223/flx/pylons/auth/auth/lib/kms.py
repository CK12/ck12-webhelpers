import boto3
import logging

from auth.lib import helpers as h

log = logging.getLogger(__name__)


class KMS:

    def __init__(self):
        config = h.load_pylons_config()
        self.enabled = config.get('kms.enabled', 'false').lower().strip() == 'true'
        if self.enabled:
            self.client = boto3.client('kms')
            self.keyID = config.get('kms.key.id')

    def getEncryptedKey(self):
        return self.client.generate_data_key(KeyId=self.keyID, KeySpec='AES_256')

    def encrypt(self, data):
        return self.client.encrypt(KeyId=self.keyID, Plaintext=data)

    def decrypt(self, data):
        return self.client.decrypt(CiphertextBlob=data)

kms = KMS()


def getKey(eekey):
    log.debug('getKey: kms enabled[%s]' % kms.enabled)
    if not kms.enabled:
        key = eekey
    else:
        from base64 import b64decode

        ekey = b64decode(eekey)
        log.debug('getKey: ekey[%s]' % ekey)
        keyDict = kms.decrypt(ekey)
        log.debug('getKey: keyDict[%s]' % keyDict)
        key = keyDict.get('Plaintext')
        #log.debug('getKey: key[%s]' % key)
    return key


def encryptKey(key):
    #
    #  Should only be run once during boot strapping.
    #
    if not kms.enabled:
        return key

    from base64 import b64encode

    ekeyDict = kms.encrypt(key)
    log.debug('encryptKey: ekeyDict[%s]' % ekeyDict)
    ekey = ekeyDict.get('CiphertextBlob')
    log.debug('encryptKey: ekey[%s]' % ekey)
    eekey = b64encode(ekey)
    log.debug('encryptKey: eekey[%s]' % eekey)
    return eekey
