package com.mathtutor.services;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.*;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.PBEParameterSpec;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.AlgorithmParameterSpec;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;

/**
 * Created by venkatesh on 14-12-2017.
 *
 */
@Component
public class PasswordUtil {

    static Logger logger = LoggerFactory.getLogger(PasswordUtil.class);

    private static Cipher ecipher;
    private static Cipher dcipher;
    // 8-byte Salt
    private static byte[] salt = {
            (byte) 0xB6, (byte) 0x2C, (byte) 0xB7, (byte) 0xA3,
            (byte) 0xB6, (byte) 0x4D, (byte) 0x7B, (byte) 0x6B
    };
    // Iteration count
    private static int iterationCount = 18;

    /**
     * secretKey Key used to encrypt/decrypt data
     * */
    private static String secretKey="Crazyshitman!lolyo";

    public PasswordUtil() {

    }

    /**
     *
     * @param plainText Text input to be encrypted
     * @return Returns encrypted text
     *
     */
    public static String cook(String plainText) {
        String encStr = null;
        try{
            //Key generation for enc and desc
            KeySpec keySpec = new PBEKeySpec(secretKey.toCharArray(), salt, iterationCount);
            SecretKey key = SecretKeyFactory.getInstance("PBEWithMD5AndDES").generateSecret(keySpec);
            // Prepare the parameter to the ciphers
            AlgorithmParameterSpec paramSpec = new PBEParameterSpec(salt, iterationCount);

            //Enc process
            ecipher = Cipher.getInstance(key.getAlgorithm());
            ecipher.init(Cipher.ENCRYPT_MODE, key, paramSpec);
            String charSet="UTF-8";
            byte[] in = plainText.getBytes(charSet);
            byte[] out = ecipher.doFinal(in);
            byte[] encoded = new org.apache.commons.codec.binary.Base64().encode(out);
            encStr = new String(encoded);
        } catch (NoSuchPaddingException e) {
            logger.error("{}",e);
        } catch (BadPaddingException e) {
            logger.error("{}",e);
        } catch (InvalidAlgorithmParameterException e) {
            logger.error("{}",e);
        } catch (NoSuchAlgorithmException e) {
            logger.error("{}",e);
        } catch (IllegalBlockSizeException e) {
            logger.error("{}",e);
        } catch (UnsupportedEncodingException e) {
            logger.error("{}",e);
        } catch (InvalidKeyException e) {
            logger.error("{}",e);
        } catch (InvalidKeySpecException e) {
            logger.error("{}",e);
        }

        return encStr;
    }

    /**
     * @param encryptedText encrypted text input to decrypt
     * @return Returns plain text after decryption
     */
    public static String uncook(String encryptedText) {
        String plainStr = null;
        try{
            //Key generation for enc and desc
            KeySpec keySpec = new PBEKeySpec(secretKey.toCharArray(), salt, iterationCount);
            SecretKey key = SecretKeyFactory.getInstance("PBEWithMD5AndDES").generateSecret(keySpec);
            // Prepare the parameter to the ciphers
            AlgorithmParameterSpec paramSpec = new PBEParameterSpec(salt, iterationCount);
            //Decryption process; same key will be used for decr
            dcipher=Cipher.getInstance(key.getAlgorithm());
            dcipher.init(Cipher.DECRYPT_MODE, key,paramSpec);
            byte[] b = encryptedText.getBytes();
            byte[] enc = new org.apache.commons.codec.binary.Base64().decode(b);
            byte[] utf8 = dcipher.doFinal(enc);
            String charSet="UTF-8";
            plainStr = new String(utf8, charSet);
        } catch (IOException e) {
            logger.error("{}",e);
        } catch (NoSuchAlgorithmException e) {
            logger.error("{}",e);
        } catch (InvalidKeyException e) {
            logger.error("{}",e);
        } catch (InvalidAlgorithmParameterException e) {
            logger.error("{}",e);
        } catch (NoSuchPaddingException e) {
            logger.error("{}",e);
        } catch (BadPaddingException e) {
            logger.error("{}",e);
        } catch (InvalidKeySpecException e) {
            logger.error("{}",e);
        } catch (IllegalBlockSizeException e) {
            logger.error("{}",e);
        }

        return plainStr;
    }

    public static void main(String[] args) {
        System.out.println(cook("123456"));
    }
}