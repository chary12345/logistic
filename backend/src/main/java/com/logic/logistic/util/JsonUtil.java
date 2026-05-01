package com.logic.logistic.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

public class JsonUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static List<String> parseJson(String json) {
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public static <T> List<T> parseJsonList(String json, Class<T> clazz) {
        try {
            JavaType type = mapper.getTypeFactory()
                    .constructCollectionType(List.class, clazz);
            return mapper.readValue(json, type);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public static String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("JSON conversion error");
        }
    }
}
