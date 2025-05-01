package com.airesume.util;

import java.util.Random;
//1
public class GenerateId {
    public static Long getId() {
        String millis = String.valueOf(System.currentTimeMillis());
        StringBuilder stringBuffer = new StringBuilder(millis);
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            int randomNum = random.nextInt(10);
            stringBuffer.append(randomNum);
        }
        return Long.parseLong(stringBuffer.toString());
    }
}
