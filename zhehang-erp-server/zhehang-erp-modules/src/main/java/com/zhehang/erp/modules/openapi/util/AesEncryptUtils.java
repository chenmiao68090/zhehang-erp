package com.zhehang.erp.modules.openapi.util;

import cn.hutool.crypto.symmetric.AES;
import cn.hutool.crypto.symmetric.SymmetricAlgorithm;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * AES 加解密工具类
 * 用于 openapi_app.app_secret / sys_oauth_config.app_secret 的加密存储
 */
public class AesEncryptUtils {

    /**
     * 加密密钥（生产环境应从配置中心/环境变量读取）
     * 16字节 = AES-128
     */
    private static final String SECRET_KEY = "ZhQf@Erp2024#Key";

    private static final AES AES_INSTANCE;

    static {
        byte[] key = SECRET_KEY.substring(0, 16).getBytes(StandardCharsets.UTF_8);
        AES_INSTANCE = new AES(key);
    }

    /**
     * 加密
     */
    public static String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        return AES_INSTANCE.encryptBase64(plainText);
    }

    /**
     * 解密
     */
    public static String decrypt(String cipherText) {
        if (cipherText == null || cipherText.isEmpty()) {
            return cipherText;
        }
        return AES_INSTANCE.decryptStr(cipherText);
    }
}
