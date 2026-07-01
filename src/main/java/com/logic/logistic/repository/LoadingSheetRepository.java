package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.LoadingSheetDTO;

@Repository
public interface LoadingSheetRepository extends JpaRepository<LoadingSheetDTO, Long> {

    @Query("""
                SELECT l
                FROM LoadingSheetDTO l
                WHERE (
                    l.destinationBranch = :destinationBranch
                    OR l.destinationBranch LIKE CONCAT('%(', :destinationBranch, ')')
                )
                AND (
                        l.status IS NULL
                        OR l.status NOT IN ('COMPLETED','RECEIVED')
                    )
            """)
    List<LoadingSheetDTO> findByDestinationBranchAndStatusNotOrNull(
            @Param("destinationBranch") String destinationBranch, @Param("status") String status);

    @Query("""
                SELECT l
                FROM LoadingSheetDTO l
                WHERE (
                    l.destinationBranch = :destinationBranch
                    OR l.destinationBranch LIKE CONCAT('%(', :destinationBranch, ')')
                )
                AND (
                    l.fromBranch = :fromBranch
                    OR l.fromBranch LIKE CONCAT('%(', :fromBranch, ')')
                )
                AND (
                    l.status IS NULL
                    OR l.status NOT IN ('COMPLETED', 'RECEIVED')
                )
            """)
    List<LoadingSheetDTO> findByDestinationBranchAndFromBranchAndStatusNotOrNull(
            @Param("destinationBranch") String destinationBranch,
            @Param("fromBranch") String fromBranch);
}