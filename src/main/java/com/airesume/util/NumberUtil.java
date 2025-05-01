package com.airesume.util;

import java.util.List;
import java.util.stream.Collectors;

public class NumberUtil {


    public static List<Float> convert2Float(List<Double> list) {
        return list.stream().map(Double::floatValue).collect(Collectors.toList());
    }


    public static float[] convert2FloatArray(List<Float> vector) {
        if (vector == null || vector.isEmpty()) {
            return new float[0];
        }
        float[] result = new float[vector.size()];
        for (int i = 0; i < vector.size(); i++) {
            result[i] = vector.get(i);
        }
        return result;
    }
}
