package com.logic.logistic.service;

import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class EncryptionUtil {

   
    // 🧪 Test everything here
    public static void main(String[] args) throws Exception {
        // Test password encrypt/decrypt
    	String encryptPassword="12345";
        String decryptpassword = "OhVazx8xLIpYmiCghYpePQ==";//add here password frpm db to decrypt
		
        System.out.println("encryptPassword : "+Encrypt(encryptPassword));
       System.out.println("decryptpassword : "+Decrypt(decryptpassword)); ;
    }
    private static final String base64Key = Base64.getEncoder().encodeToString("1234567890123456".getBytes());
    private static final String base64Iv = Base64.getEncoder().encodeToString("abcdefghijklmnop".getBytes());
    public static String Decrypt(String encryptedText) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        byte[] ivBytes = Base64.getDecoder().decode(base64Iv);
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedText);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] original = cipher.doFinal(encryptedBytes);

        return new String(original).trim();
    }
    public static String Encrypt(String plainText) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        byte[] ivBytes = Base64.getDecoder().decode(base64Iv);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes("UTF-8"));

        return Base64.getEncoder().encodeToString(encrypted);
    }
}
