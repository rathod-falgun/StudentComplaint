package com.project.ComplaintApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.project.ComplaintApp.entities.EmailOtp;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM EmailOtp e WHERE LOWER(e.email) = LOWER(:email)")
    int deleteByEmail(@Param("email") String email);
}
