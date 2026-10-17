package com.project.ComplaintApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.ComplaintApp.Enums.ComplaintStatus;
import com.project.ComplaintApp.entities.Complaint;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long user_id);

    long countByStatus(ComplaintStatus status);

    List<Complaint> findTop5ByOrderByCreatedAtDesc();

    @Query(

        """
           SELECT c from Complaint c where c.user.id = :userId Order by c.createdAt desc, 
           case c.status
                when "submitted" then 4
                when "assigned" then 3
                when "in_progress" then 2
                when "resolved" then 1
            else 5
        End Asc     
                """)
    List<Complaint> findbyUserIdOrederByCreatedAtAndStatus(@Param("userId") Long userId);

}
