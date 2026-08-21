package com.project.ComplaintApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.ComplaintApp.entities.Complaint;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long user_id);
}
