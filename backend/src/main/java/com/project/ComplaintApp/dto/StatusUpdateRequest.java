package com.project.ComplaintApp.dto;

import com.project.ComplaintApp.Enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {
    private ComplaintStatus status;
}
