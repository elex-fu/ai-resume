package com.airesume.llm.proxy;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONUtil;

import com.airesume.util.JsonUtil;
import com.airesume.util.StringUtils;
import com.alibaba.fastjson2.JSONObject;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;


/**
 * @Author WuZhou
 * @Date 2024/3/21 16:56
 **/
@Slf4j
public class OneLlmProxy {

    public static final String MODEL_GPT_35 = "gpt-3.5-turbo";
    public static final String MODEL_GPT_4 = "gpt-4";
    public static final String MODEL_MOONSHOT_8K = "moonshot-v1-8k";


    public static InputStream chatStream(String baseUrl, String apiKey, String model, String message) {
        try {
            return onChatStream(baseUrl, apiKey, model, message);
        } catch (Exception e) {
            log.error("chatStream error, message={}", message, e);
            throw new RuntimeException("chatStream error, message=" + message, e);
        }
    }

    private static InputStream onChatStream(String baseUrl, String apiKey, String model, String message) throws Exception {
        URL url = new URL(baseUrl); // 接口地址
        HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
        urlConnection.setRequestMethod("POST");
        urlConnection.setDoOutput(true);
        urlConnection.setDoInput(true);
        urlConnection.setUseCaches(false);
        urlConnection.setRequestProperty("Connection", "Keep-Alive");
        urlConnection.setRequestProperty("Charset", "UTF-8");
        urlConnection.setRequestProperty("Authorization", "Bearer " + apiKey);
        urlConnection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");

        String bodyJson = getChatBody(model, message, true);
        byte[] dataBytes = bodyJson.getBytes();
        urlConnection.setRequestProperty("Content-Length", String.valueOf(dataBytes.length));
        OutputStream os = urlConnection.getOutputStream();
        os.write(dataBytes);
        InputStream in = new BufferedInputStream(urlConnection.getInputStream());
        os.flush();
        os.close();
        return in;
    }


    public static ChatResult chat(String baseUrl, String apiKey, String model, String message) {
        try {
            String result = onChat(baseUrl, apiKey, model, message);
            return new ChatResult(result);
        } catch (Exception e) {
            log.error("chat error, message={}", message, e);
            return ChatResult.createErrorResult();
        }
    }

    /**
     * {
     * "id": "chatcmpl-9598m5lnAWu3b4o7zDV0Ir9RITta8",
     * "object": "chat.completion",
     * "created": 1711013804,
     * "model": "gpt-3.5-turbo-0125",
     * "choices": [
     * {
     * "index": 0,
     * "message": {
     * "role": "assistant",
     * "content": "鲁迅暴打周树人是因为周树人在一次辩论中攻击鲁迅的作品《狂人日记》，认为其内容低俗、荒诞，严重影响了文学的品位和社会风气。鲁迅对此感到愤怒，认为周树人的批评是对他个人和他的文学创作的攻击，因此在一次聚会上当众暴打了周树人。这件事情也引发了当时文坛上的一场轩然大波，成为了中国现代文学史上的一段佳话。"
     * },
     * "logprobs": null,
     * "finish_reason": "stop"
     * }
     * ],
     * "usage": {
     * "prompt_tokens": 23,
     * "completion_tokens": 184,
     * "total_tokens": 207
     * },
     * "system_fingerprint": "fp_fa89f7a861"
     * }
     *
     * @param baseUrl
     * @param apiKey
     * @param model
     * @param message
     * @return
     */
    public static String onChat(String baseUrl, String apiKey, String model, String message) {
        String data = getChatBody(model, message, false);
        String body = HttpRequest.post(baseUrl)
                .header("Authorization", "Bearer " + apiKey)//头信息，多个头信息多次调用此方法即可
                .header("Content-Type", "application/json")
                .body(data)//表单内容
                .timeout(200000)//超时，毫秒
                .execute().body();

        log.debug("onChat:\n message={},\n resp={}\n", message, body);
        return body;
    }



    public static String onChatOkHttp(String baseUrl, String apiKey, String message) throws Exception {
        OkHttpClient client = new OkHttpClient();

        MediaType mediaType = MediaType.parse("application/json");
        RequestBody body = RequestBody.create(mediaType, getChatBody(message, MODEL_GPT_35, false));
        Request request = new Request.Builder()
                .url(baseUrl)
                .post(body)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .build();

        Response response = client.newCall(request).execute();
        String responseBody = response.body().string();

        log.debug("onChat: message={}, body={}", message, responseBody);
        return responseBody;
    }


    /**
     * 处理单独打印的文字
     *
     * @param lingStr {
     *                "id":"chatcmpl-9BDZVDQraOZyyKavu7NrmKieaqLTL","object":"chat.completion.chunk","created":1712460805,
     *                "model":"gpt-3.5-turbo-0125","system_fingerprint":"fp_b28b39ffa8",
     *                "choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]
     *                }
     * @return 返回流式数据结果，一般是一个字符
     */
    public static String catchStreamContent(String lingStr) {
        String choices = JsonUtil.parseMiddleData(lingStr, "choices");
        if (StringUtils.isEmpty(choices)) {
            return "";
        }
        JSONArray jsonArray = JSONUtil.parseArray(choices);
        String delta = jsonArray.getByPath("[0].delta").toString();
        if (StringUtils.isEmpty(delta)) {
            return "";
        }
        return JsonUtil.parseMiddleData(delta, "content");
    }

    private static String getChatBody(String model, String message, boolean stream) {
        // 构建消息对象
        JSONObject messageObj = new JSONObject();
        messageObj.put("role", "user");
        messageObj.put("content", message);  // FastJSON会自动处理字符串转义

        JSONArray messages = new JSONArray();
        messages.add(messageObj);

        // 构建请求体
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("top_p", 1);
        requestBody.put("stream", stream);
        requestBody.put("temperature", 0.5);
        requestBody.put("frequency_penalty", 0);
        requestBody.put("presence_penalty", 0);

        return requestBody.toString();
    }



    @Data
    public static class ChatResult {

        private String errMsg;

        private String type;

        private String code;

        //返回结果
        private String content;

        //表示使用提示词 tokens 的数量。
        private Integer usagePromptTokens;

        //表示使用补完 tokens 的数量。
        private Integer usageCompletionTokens;

        // 表示使用的总 tokens 数量。
        private Integer usageTotalTokens;

        public ChatResult() {

        }


        public ChatResult(String result) {
            if (!checkResult(this, result)) {
                return;
            }
            JSONObject resultJson = JSONObject.parseObject(result);
            this.content = JsonUtil.parseLLMJson( resultJson.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content"));
            JSONObject usage = resultJson.getJSONObject("usage");
            this.usagePromptTokens = usage.getInteger("prompt_tokens");
            this.usageCompletionTokens = usage.getInteger("completion_tokens");
            this.usageTotalTokens = usage.getInteger("total_tokens");
        }

        public static ChatResult createErrorResult() {
            ChatResult chatResult = new ChatResult();
            chatResult.setErrMsg("访问错误");
            chatResult.setType("error");
            chatResult.setCode("error");
            return chatResult;
        }
    }


    private static boolean checkResult(ChatResult chatResult, String body) {
        if (StrUtil.isBlank(body)) {
            throw new RuntimeException("访问错误");
        }
        String error = JsonUtil.parseMiddleData(body, "error");

        if (StrUtil.isBlank(error)) {
            return true;
        }

        //出错类型
        String type = JsonUtil.parseMiddleData(error, "type");
        // 解析错误信息中的code字段
        String code = JsonUtil.parseMiddleData(error, "code");
        // 解析错误信息中的message字段
        String msg = JsonUtil.parseMiddleData(error, "message");
        chatResult.setType(type);
        chatResult.setCode(code);
        chatResult.setErrMsg(msg);

        //次数耗尽
        if (StrUtil.equals(type, "insufficient_quota")) {
            chatResult.setErrMsg("次数耗尽");
        }
        if (StrUtil.contains(body, "invalid_request_error")) {
            if (StrUtil.equals(code, "account_deactivated")) {
                chatResult.setErrMsg("账号失效");
            } else if (StrUtil.equals(code, "invalid_api_key")) {
                chatResult.setErrMsg("出现次数耗尽");
            }
        }
        if (StrUtil.contains(body, "statusCode") && StrUtil.contains(body, "TooManyRequests")) {
            chatResult.setErrMsg("请求过多，超过并发数限制");
        }

        return false;
    }
}
