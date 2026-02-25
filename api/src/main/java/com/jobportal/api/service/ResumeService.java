package com.jobportal.api.service;

import com.jobportal.api.dto.response.ResumeResponse;
import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.Resume;
import com.jobportal.api.exception.BadRequestException;
import com.jobportal.api.exception.ForbiddenException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.CandidateProfileRepository;
import com.jobportal.api.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CloudinaryService cloudinaryService;
    private final MlServiceClient mlServiceClient;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String ALLOWED_CONTENT_TYPE = "application/pdf";

    public ResumeResponse uploadResume(UUID userId, MultipartFile file) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        // Validate file type
        if (file.getContentType() == null || !file.getContentType().equals(ALLOWED_CONTENT_TYPE)) {
            throw new BadRequestException("Only PDF files are allowed");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size must be less than 5MB");
        }

        // Check if this is the first resume (set as primary)
        List<Resume> existingResumes = resumeRepository.findByCandidateProfileId(profile.getId());
        boolean isFirst = existingResumes.isEmpty();

        // Upload to Cloudinary
        CloudinaryService.UploadResult uploadResult = cloudinaryService.uploadFile(file, "resumes");

        // Extract text from PDF
        String parsedText = extractTextFromPdf(file);

        Resume resume = Resume.builder()
                .candidateProfile(profile)
                .fileUrl(uploadResult.getUrl())
                .fileName(file.getOriginalFilename())
                .fileSize((int) file.getSize())
                .cloudinaryPublicId(uploadResult.getPublicId())
                .parsedText(parsedText)
                .isPrimary(isFirst)
                .build();

        Resume savedResume = resumeRepository.save(resume);

        // Vectorize the resume in Pinecone
        vectorizeResumeAsync(savedResume, profile);

        return ResumeResponse.fromEntity(savedResume);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getResumes(UUID userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        return resumeRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(ResumeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ResumeResponse setPrimaryResume(UUID userId, UUID resumeId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getCandidateProfile().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to modify this resume");
        }

        // Unset current primary resume
        resumeRepository.findByCandidateProfileIdAndIsPrimaryTrue(profile.getId())
                .ifPresent(currentPrimary -> {
                    currentPrimary.setIsPrimary(false);
                    resumeRepository.save(currentPrimary);
                });

        resume.setIsPrimary(true);
        Resume updatedResume = resumeRepository.save(resume);
        return ResumeResponse.fromEntity(updatedResume);
    }

    public void deleteResume(UUID userId, UUID resumeId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getCandidateProfile().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to delete this resume");
        }

        // Delete from Cloudinary
        if (resume.getCloudinaryPublicId() != null) {
            try {
                cloudinaryService.deleteFile(resume.getCloudinaryPublicId());
            } catch (Exception e) {
                log.error("Failed to delete resume from Cloudinary: {}", e.getMessage());
            }
        }

        // Delete vector from Pinecone
        if (resume.getPineconeVectorId() != null) {
            mlServiceClient.deleteVector(resume.getPineconeVectorId(), "resumes");
        }

        resumeRepository.delete(resume);

        // If deleted resume was primary, set the next available as primary
        if (Boolean.TRUE.equals(resume.getIsPrimary())) {
            List<Resume> remaining = resumeRepository.findByCandidateProfileId(profile.getId());
            if (!remaining.isEmpty()) {
                Resume newPrimary = remaining.get(0);
                newPrimary.setIsPrimary(true);
                resumeRepository.save(newPrimary);
            }
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
        try {
            var document = Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();
            // Clean up the text
            text = text.replaceAll("\\s+", " ").trim();
            if (text.length() > 50000) {
                text = text.substring(0, 50000);
            }
            return text.isBlank() ? null : text;
        } catch (Exception e) {
            log.error("Failed to extract text from PDF: {}", e.getMessage());
            return null;
        }
    }

    private void vectorizeResumeAsync(Resume resume, CandidateProfile profile) {
        try {
            if (resume.getParsedText() == null || resume.getParsedText().isBlank()) {
                log.info("No parsed text for resume {}, skipping vectorization", resume.getId());
                return;
            }

            List<String> skillNames = profile.getSkills() != null
                    ? profile.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.toList())
                    : Collections.emptyList();

            Map<String, String> metadata = new HashMap<>();
            metadata.put("candidate_id", profile.getId().toString());
            metadata.put("location", profile.getLocation() != null ? profile.getLocation() : "");
            metadata.put("preferred_work_mode", profile.getPreferredWorkMode() != null ? profile.getPreferredWorkMode().name() : "");

            String vectorId = mlServiceClient.vectorizeResume(
                    profile.getId(),
                    resume.getId(),
                    resume.getParsedText(),
                    profile.getHeadline(),
                    skillNames,
                    metadata
            );

            resume.setPineconeVectorId(vectorId);
            resumeRepository.save(resume);
            log.info("Resume {} vectorized successfully with vector_id: {}", resume.getId(), vectorId);
        } catch (Exception e) {
            log.error("Failed to vectorize resume {}: {}", resume.getId(), e.getMessage());
            // Don't fail the main upload flow
        }
    }
}
