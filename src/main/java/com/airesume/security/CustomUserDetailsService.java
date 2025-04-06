package com.airesume.security;

import com.airesume.model.UserPO;
import com.airesume.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserPO userPO = userRepository.findByEmail(email)
                .orElseThrow(() -> 
                    new UsernameNotFoundException("未找到用户，邮箱: " + email)
                );

        return UserPrincipal.create(userPO);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        UserPO userPO = userRepository.findById(id)
                .orElseThrow(() -> 
                    new UsernameNotFoundException("未找到用户，ID: " + id)
                );

        return UserPrincipal.create(userPO);
    }
} 