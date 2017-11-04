#!/usr/bin/env python
# Credits: [https://gist.github.com/marcoslin/8026990]

import binascii
#from Crypto import Random
import random
from Crypto.Cipher import AES

class Cryptor(object):
    '''
    Provide encryption and decryption function that works with crypto-js.
    https://code.google.com/p/crypto-js/
    
    Padding implemented as per RFC 2315: PKCS#7 page 21
    http://www.ietf.org/rfc/rfc2315.txt
    
    The key to make pycrypto work with crypto-js are:
    1. Use MODE_CFB.  For some reason, crypto-js decrypted result from MODE_CBC
       gets truncated
    2. Use Pkcs7 padding as per RFC 2315, the default padding used by CryptoJS
    3. On the JS side, make sure to wrap ciphertext with CryptoJS.lib.CipherParams.create()
    '''
    def __init__(self, key, block_size=16):    
        # AES-256 key (32 bytes)
        self.KEY = "01ab38d5e05c92aa098921d9d4626107133c7e2ab0e4849558921ebcc242bcb0"
        self.BLOCK_SIZE = block_size
    
    def _pad_string(self, in_string):
        '''Pad an input string according to PKCS#7'''
        in_len = len(in_string)
        pad_size = self.BLOCK_SIZE - (in_len % self.BLOCK_SIZE)
        return in_string.ljust(in_len + pad_size, chr(pad_size))
    
    def _unpad_string(self, in_string):
        '''Remove the PKCS#7 padding from a text string'''
        in_len = len(in_string)
        pad_size = ord(in_string[-1])
        if pad_size > self.BLOCK_SIZE:
            raise ValueError('Input is not padded or padding is corrupt')
        return in_string[:in_len - pad_size]
    
    def generate_iv(self, size=16):
        return str(randomBytes(size))

    def encrypt(self, in_string, in_key, in_iv=None):
        '''
        Return encrypted string.
        @in_string: Simple str to be encrypted
        @key: hexified key
        @iv: hexified iv
        '''
        key = binascii.a2b_hex(in_key)
        
        if in_iv is None:
            iv = self.generate_iv()
            in_iv = binascii.b2a_hex(iv)
        else:
            iv = binascii.a2b_hex(in_iv)
        
        aes = AES.new(key, AES.MODE_CFB, iv, segment_size=128)
        return in_iv, aes.encrypt(self._pad_string(in_string))
    
    def decrypt(self, in_encrypted, in_key, in_iv):
        '''
        Return encrypted string.
        @in_encrypted: Base64 encoded 
        @key: hexified key
        @iv: hexified iv
        '''
        key = binascii.a2b_hex(in_key)
        iv = binascii.a2b_hex(in_iv)
        aes = AES.new(key, AES.MODE_CFB, iv, segment_size=128)        
        
        decrypted = aes.decrypt(binascii.a2b_base64(in_encrypted).rstrip())
        return self._unpad_string(decrypted)

def randomBytes(n):
    return bytearray(random.getrandbits(8) for i in range(n))
