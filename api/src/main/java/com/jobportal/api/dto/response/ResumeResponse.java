package com.jobportal.api.dto.response;

import com.jobportal.api.entity.Resume;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {

    private UUID id;
    private String fileUrl;
    private String fileName;
    private Integer fileSize;
    private Boolean isPrimary;
    private LocalDateTime createdAt;

    public static ResumeResponse fromEntity(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileUrl(resume.getFileUrl())
                .fileName(resume.getFileName())
                .fileSize(resume.getFileSize())
                .isPrimary(resume.getIsPrimary())
                .createdAt(resume.getCreatedAt())
                .build();
    }
}
