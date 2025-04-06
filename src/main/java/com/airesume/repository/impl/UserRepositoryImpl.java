package com.airesume.repository.impl;

import com.airesume.model.UserPO;
import com.airesume.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserRepositoryImpl implements UserRepository {

    @Override
    public Optional<UserPO> findByUsername(String username) {
        return Optional.empty();
    }

    @Override
    public Optional<UserPO> findByEmail(String email) {
        return Optional.empty();
    }

    @Override
    public Boolean existsByUsername(String username) {
        return null;
    }

    @Override
    public Boolean existsByEmail(String email) {
        return null;
    }

    @Override
    public Optional<UserPO> findById(Long id) {
        return Optional.empty();
    }

    @Override
    public UserPO save(UserPO userPO) {
        return null;
    }
}
