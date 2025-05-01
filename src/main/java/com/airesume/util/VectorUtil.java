package com.airesume.util;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.TypeReference;
import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class VectorUtil {

    public static final String VECTOR_DOC_SPLIT = ",";

    public static final Float VECTOR_SAME_SCORE = 0.00001f;


    public static String vectorToStr(List<Float> vectorIndex) {
        StringBuilder sb = new StringBuilder();
        vectorIndex.forEach(index -> sb.append(index).append(VECTOR_DOC_SPLIT));
        return sb.toString();
    }

    /**
     * 逗号（，）分割的字符串转Float数组
     *
     * @param str
     * @return
     */
    public static Float[] strToVector(String str) {
        if (StringUtils.isEmpty(str)) {
            return null;
        }
        String[] vectorItems = str.split(VECTOR_DOC_SPLIT);
        return Arrays.stream(vectorItems)
                .map(Float::valueOf)
                .collect(Collectors.toList())
                .toArray(new Float[vectorItems.length]);
    }

    /**
     * json 数组string转Float[]
     *
     * @param jsonStr json string
     * @return Float[]
     */
    public static Float[] jsonToVector(String jsonStr) {
        List<Float> list = JSON.parseObject(jsonStr, new TypeReference<List<Float>>() {
        });
        return list.toArray(new Float[list.size()]);
    }

    /**
     * 根据向量距离判断是否相等，
     *
     * @param score 向量距离
     * @return boolean 是否相似
     */
    public static boolean isScoreSame(Float score) {
        return score.compareTo(VECTOR_SAME_SCORE) <= 0;
    }
}
