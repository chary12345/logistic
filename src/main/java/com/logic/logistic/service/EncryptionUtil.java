package com.logic.logistic.service;

import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class EncryptionUtil {

    // ✅ Lightweight password obfuscation
    public static String PasswordEncrypt(String str) {
        char[] carr = str.toCharArray();
        for (int i = 0; i < carr.length; i++) {
            int j;
            if (i % 2 == 0) {
                j = carr[i] - 5;
            } else {
                j = carr[i] - 4;
            }
            carr[i] = (char) j;
        }
        return String.valueOf(carr);
    }

    public static String PasswordDecrypt(String str) {
        char[] carr = str.toCharArray();
        for (int i = 0; i < carr.length; i++) {
            int j;
            if (i % 2 == 0) {
                j = carr[i] + 5;
            } else {
                j = carr[i] + 4;
            }
            carr[i] = (char) j;
        }
        return String.valueOf(carr);
    }

    // ✅ AES Encrypt (1-layer Base64 only)
    public static String Encrypt(String base64Key, String base64Iv, String data) throws Exception {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            byte[] ivBytes = Base64.getDecoder().decode(base64Iv);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
            byte[] encrypted = cipher.doFinal(data.getBytes("UTF-8"));

            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new Exception("Encryption failed: " + e.getMessage());
        }
    }

    // ✅ AES Decrypt (1-layer Base64 only)
    public static String Decrypt(String base64Key, String base64Iv, String base64Encrypted) throws Exception {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            byte[] ivBytes = Base64.getDecoder().decode(base64Iv);
            byte[] encryptedBytes = Base64.getDecoder().decode(base64Encrypted);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
            byte[] original = cipher.doFinal(encryptedBytes);

            return new String(original).trim();
        } catch (Exception e) {
            throw new Exception("Decryption failed: " + e.getMessage());
        }
    }

    // 🧪 Test everything here
    public static void main(String[] args) throws Exception {
        // Test password encrypt/decrypt
        String password = "mySecret123";
        String encryptedPass = PasswordEncrypt(password);
        String decryptedPass = PasswordDecrypt(encryptedPass);

        System.out.println("Original Password: " + password);
        System.out.println("Encrypted Password: " + encryptedPass);
        System.out.println("Decrypted Password: " + decryptedPass);

        // AES key and IV (16 bytes each for AES-128)
        String key = Base64.getEncoder().encodeToString("1234567890123456".getBytes()); // 128-bit
        String iv = Base64.getEncoder().encodeToString("abcdefghijklmnop".getBytes());  // 16-byte IV

        String message = "Confidential Data";
        String aesEncrypted = Encrypt(key, iv, message);
        String aesDecrypted = Decrypt(key, iv, aesEncrypted);

        System.out.println("\nOriginal Message: " + message);
        System.out.println("AES Encrypted: " + aesEncrypted);
        System.out.println("AES Decrypted: " + aesDecrypted);
    }
}
