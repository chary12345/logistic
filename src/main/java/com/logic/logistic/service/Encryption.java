package com.logic.logistic.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Base64.Decoder;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;


public class Encryption {
	
//	public static void main(String[] args) {
//		String str = "hi how are you";
//		System.out.println("sample: "+ str);
//		
//		String encodeToString = Base64.getEncoder().encodeToString(str.getBytes());
//		System.out.println("encrypt: "+encodeToString);
//		
//		byte[] decode = Base64.getDecoder().decode(encodeToString);
//		String actualString = new String(decode);
//		System.out.println("actual str:"+actualString);
//	}
	
	private static String planeText;

	public Encryption() {
		
	}
	public static String URLEncryption(String str) throws Exception{
		try {
			if(str == null) {
				throw new Exception("NO PARAMETER FOUND");
			}
			int strcount = str.length()/2;
			String str1 = strreverse(str.substring(0, strcount));
			String str2 = strreverse(str.substring(strcount, str.length()));
			str = (new StringBuilder(String.valueOf(str1))).append(str2).toString();
			char carr[] = str.toCharArray();
			if(str.length()>0) {
				int carrlength = carr.length;
				for(int i=0; i<carrlength; i++) {
					int j = carr[i] + 128;
					carr[i] = (char)j;
				}
			}
			str= String.valueOf(carr);
		} catch (Exception e) {
			throw new Exception(e.getMessage());
		}
		return str;
	}
	
	public static String URLDecryption(String str) throws Exception {
		
		try {
			if(str == null) {
				throw new Exception("NO PARAMETER FOUND"); 
			}
			char[] carr = str.toCharArray();
			if(str.length() > 0) {
				int carrlength = carr.length;
				for(int  i=0; i<carrlength; i++) {
					int j = carr[i] - 128;
					carr[i] = (char)j;
				}
			}
			str = String.valueOf(carr);
			int strcount = str.length()/2;
			String str1 = strreverse(str.substring(0, strcount));
			String str2 = strreverse(str.substring(strcount, str.length()));
			str = (new StringBuilder(String.valueOf(str1))).append(str2).toString();
			
		}catch (Throwable e) {
			throw new Exception(e.getMessage());
		}
		return str;
	}
	
	private static String strreverse(String str) {
		
		StringBuilder sb = new StringBuilder(str);
		str = sb.reverse().toString();
		return str;
	}
	
	public static String PasswordEncrypt(String str) {
		
		char carr[] = str.toCharArray();
		int j = 0;
		int carrlength = carr.length;
		for(int i=0; i<carrlength; i++) {
//			 int j;
			if(i % 2 == 0) {
				j = carr[i] - 5;
			} else {
				j = carr[i] - 4;
				carr[i] = (char)j;
			}
		}
		str = String.valueOf(carr);
		return str;
		
	}
	
	public static String PasswordDecrypt(String str) {
		
		char[] carr = str.toCharArray();
		int j = 0;
		int carrlength = carr.length;
		for(int i=0; i<carrlength; i++) {
//			 int j;
			if(i%2 == 0) {
				j =carr[i]+5;
			}else {
				j= carr[i]+4;
				carr[i] = (char)j;
			}
		}
		str = String.valueOf(carr);
		return str;
	}
	
//	public static String Encrypt(String key, String iv, String data) throws Exception {
//	    try {
//	        // Decode base64 key and IV
//	        byte[] keyBytes = Base64.getDecoder().decode(key);
//	        byte[] ivBytes = Base64.getDecoder().decode(iv);
//
//	        // Create AES cipher in CBC mode with PKCS5 padding
//	        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
//	        SecretKeySpec keySpec = new SecretKeySpec(new String(keyBytes).getBytes(), "AES");
//	        IvParameterSpec ivspec = new IvParameterSpec(new String(ivBytes).getBytes());
//
//	        // Initialize for encryption
//	        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivspec);
//
//	        // Perform encryption
//	        byte[] encrypted = cipher.doFinal(data.getBytes("UTF-8"));
//
//	        // Encode encrypted bytes to base64 string
//	        String base64Encrypted = Base64.getEncoder().encodeToString(encrypted);
//
//	        // Wrap it one more time (to match your decryption process)
//	        return Base64.getEncoder().encodeToString(base64Encrypted.getBytes("UTF-8"));
//	    } catch (Exception e) {
//	        throw new Exception("Encryption failed: " + e.getMessage());
//	    }
//	}
//
//	
//	public static String Decrypt(String key, String iv, String data) throws Exception {
//		
//		String planText = "";
//		try {
//			Decoder decoder = Base64.getDecoder();
//			byte[] keyBytes = decoder.decode(key);
//			String keyString = new String(keyBytes);
//			
//			byte[] ivBytes = decoder.decode(iv);
//			String ivString = new String(ivBytes);
//			
//			byte[] decodedBytes = decoder.decode(data);
//			String decodedString = new String(decodedBytes);
//			byte[] encrypted = decoder.decode(decodedString);
//			
//			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
//			SecretKeySpec keySpec = new SecretKeySpec(keyString.getBytes(), "AES");
//			IvParameterSpec ivspec = new IvParameterSpec(ivString.getBytes());
//			
//			cipher.init(Cipher.DECRYPT_MODE, keySpec, ivspec);
//			byte[] original = cipher.doFinal(encrypted);
//			String originalString = new String(original);
//			planeText = originalString.trim();
//		}catch (Exception e) {
//			throw new Exception(e.getMessage());
//		}
//		
//		return planText;
//	}

	public static String Encrypt(String base64Key, String base64Iv, String data) throws Exception {
	    try {
	        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
	        byte[] ivBytes = Base64.getDecoder().decode(base64Iv);

	        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
	        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
	        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

	        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
	        byte[] encrypted = cipher.doFinal(data.getBytes("UTF-8"));

	        return Base64.getEncoder().encodeToString(encrypted); // One-layer Base64
	    } catch (Exception e) {
	        throw new Exception("Encryption failed: " + e.getMessage());
	    }
	}

	public static String Decrypt(String base64Key, String base64Iv, String base64Encrypted) throws Exception {
	    try {
	        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
	        byte[] ivBytes = Base64.getDecoder().decode(base64Iv);
	        byte[] encryptedBytes = Base64.getDecoder().decode(base64Encrypted);

	        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
	        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
	        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

	        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
	        byte[] original = cipher.doFinal(encryptedBytes);

	  //      return new String(original).trim();
	        return new String(original, StandardCharsets.UTF_8).trim();
	    } catch (Exception e) {
	        throw new Exception("Decryption failed: " + e.getMessage());
	    }
	}

	
	public static void main(String[] args) throws Exception {
		// Test Password Encrypt/Decrypt
        String password = "mySecret123";
        String encryptedPass = PasswordEncrypt(password);
        String decryptedPass = PasswordDecrypt(encryptedPass);
        System.out.println("Original Password: " + password);
        System.out.println("Encrypted Password: " + encryptedPass);
        System.out.println("Decrypted Password: " + decryptedPass);

        // Test AES Encrypt/Decrypt
        String key = Base64.getEncoder().encodeToString("1234567890123456".getBytes()); // 16 bytes = 128-bit
        String iv = Base64.getEncoder().encodeToString("abcdefghijklmnop".getBytes());  // 16 bytes IV
        String message = "Confidential Data";

        String aesEncrypted = Encrypt(key, iv, message);
        String aesDecrypted = Decrypt(key, iv, aesEncrypted);

        System.out.println("\nOriginal Message: " + message);
        System.out.println("AES Encrypted: " + aesEncrypted);
        System.out.println("AES Decrypted: " + aesDecrypted);
	}
}
