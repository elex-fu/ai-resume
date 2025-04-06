package com.airesume.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UserPO {
    private Long id;

    private String username;

    private String password;

    private String email;

    private String fullName;

    private List<ResumePO> resumePOS = new ArrayList<>();
} 