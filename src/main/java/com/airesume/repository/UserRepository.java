package com.airesume.repository;

import com.airesume.model.UserPO;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository  {

    Optional<UserPO> findByUsername(String username);

    Optional<UserPO> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<UserPO> findById(Long id);

    UserPO save(UserPO userPO);

}