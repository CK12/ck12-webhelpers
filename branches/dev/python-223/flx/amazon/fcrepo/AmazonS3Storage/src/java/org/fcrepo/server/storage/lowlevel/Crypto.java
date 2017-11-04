package org.fcrepo.server.storage.lowlevel;

import java.security.Security;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import com.amazon.s3.Base64;

public class Crypto {

    // 128-bit - DO NOT CHANGE the key
    // If you need to change the key, please generate the encrypted string using the new key and update
    // the fedora.fcfg file
    private byte[] keyBytes = new byte[] { 0x04, 0x01, 0x00, 0x07, 0x01, 0x09, 0x07, 0x08, 0x0a, 0x0d,
                    0x0f, 0x0b, 0x0d, 0x0c, 0x0e, 0x0a};
    private SecretKeySpec key = null;
    private Cipher cipher = null;

    public Crypto() {
        try {
            Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());    
            //byte[] keyBytes = new byte[] { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
            //    0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17 };

            this.key = new SecretKeySpec(keyBytes, "AES");
    
            this.cipher = Cipher.getInstance("AES/ECB/PKCS7Padding", "BC");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String decrypt(String arg) {
        try {
            byte[] input = Base64.decode(arg);
            int ctLength = input.length;

            // decryption pass
            cipher.init(Cipher.DECRYPT_MODE, this.key);
            byte[] plainText = new byte[cipher.getOutputSize(ctLength)];
            int ptLength = cipher.update(input, 0, ctLength, plainText, 0);
            ptLength += cipher.doFinal(plainText, ptLength);
            // System.out.println("ptLength: " + ptLength);
            String output = new String(plainText, 0, ptLength);
            // System.out.println("[" + output + "] " + output.length());
            return output;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String encrypt(String arg) {
        try {
            System.out.println("Input: " + arg);
            byte[] input = arg.getBytes();
            // encryption pass
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] cipherText = new byte[cipher.getOutputSize(input.length)];
            int ctLength = cipher.update(input, 0, input.length, cipherText, 0);
            ctLength += cipher.doFinal(cipherText, ctLength);
            String encText = new String(cipherText);
            System.out.println("encText: " + encText);
            String b64 = Base64.encodeBytes(cipherText);
            System.out.println("Base64 encode: " + b64);
            System.out.println("Base64 decode: " + new String(Base64.decode(b64)));
            System.out.println("Cipher text len: " + ctLength);
            System.out.println("Cipher text len: " + b64.length());
            return b64;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String args[]) throws Exception {
        Crypto crypto = new Crypto();
        String encrypted = crypto.encrypt(args[0]);
        System.out.println("Encrypted: [" + encrypted + "]");

        String decrypted = crypto.decrypt(encrypted);
        System.out.println("Decrypted: [" + decrypted + "]");


    }

}
