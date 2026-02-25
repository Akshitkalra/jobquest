package com.jobportal.api.service;

import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.Job;
import com.jobportal.api.entity.SavedJob;
import com.jobportal.api.exception.BadRequestException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.CandidateProfileRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobRepository jobRepository;

    public void saveJob(UUID userId, UUID jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (savedJobRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId)) {
            throw new BadRequestException("Job is already saved");
        }

        SavedJob savedJob = SavedJob.builder()
                .candidateProfile(profile)
                .job(job)
                .build();

        savedJobRepository.save(savedJob);
    }

    public void unsaveJob(UUID userId, UUID jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        if (!savedJobRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId)) {
            throw new ResourceNotFoundException("SavedJob", "jobId", jobId);
        }

        savedJobRepository.deleteByCandidateProfileIdAndJobId(profile.getId(), jobId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> getSavedJobs(UUID userId, Pageable pageable) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Page<SavedJob> savedJobsPage = savedJobRepository.findByCandidateProfileId(profile.getId(), pageable);
        Page<JobResponse> responsePage = savedJobsPage.map(savedJob -> JobResponse.fromEntity(savedJob.getJob()));
        return PagedResponse.fromPage(responsePage);
    }

    @Transactional(readOnly = true)
    public boolean isJobSaved(UUID userId, UUID jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        return savedJobRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId);
    }
}
