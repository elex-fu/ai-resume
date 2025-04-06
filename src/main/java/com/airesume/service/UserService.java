package com.airesume.service;

import com.airesume.model.UserPO;
import com.airesume.repository.UserRepository;
import com.airesume.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserPO userPO = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));
        return UserPrincipal.create(userPO);
    }

    public UserDetails loadUserById(Long id) {
        UserPO userPO = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + id));
        return UserPrincipal.create(userPO);
    }

    public UserPO registerUser(UserPO userPO) {
        if (userRepository.existsByUsername(userPO.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.existsByEmail(userPO.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        userPO.setPassword(passwordEncoder.encode(userPO.getPassword()));
        return userRepository.save(userPO);
    }

    public UserPO getCurrentUser(UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
    }
} 