package com.airesume.util;

import com.airesume.bo.OptimizeResult;
import com.airesume.model.ResumePO;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;


public class JsonUtil {
    /**
     * 处理{}这种类型的数据
     *
     * @param json
     * @return
     */
    public static String parseMiddleData(String json, String parse) {
        JSONObject jsonObject = JSONUtil.parseObj(json);
        String str = jsonObject.getStr(parse);
        return str;
    }

    public static String toJsonString(Object obj) {
        return JSONUtil.toJsonStr(obj);
    }

    public static  <T> T parseObj(String str, Class<T> class1) {
        return JSONUtil.toBean(str, class1);
    }

    /**
     * 需要去除大模型返回的json数据中有```json{data}```这种数据
     * 去除后返回data
     * @param string
     * @return
     */
    public static String parseLLMJson(String string) {
            if (string == null || string.isEmpty()) {
            return null;
        }
        // 去除```json{data}```这种数据
        string = string.replace("```json", "").replace("```", "");
        return string;
    }
}
