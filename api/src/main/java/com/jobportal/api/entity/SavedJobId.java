package com.jobportal.api.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class SavedJobId implements Serializable {

    private UUID candidateProfile;
    private UUID job;

    public SavedJobId() {
    }

    public SavedJobId(UUID candidateProfile, UUID job) {
        this.candidateProfile = candidateProfile;
        this.job = job;
    }

    public UUID getCandidateProfile() {
        return candidateProfile;
    }

    public void setCandidateProfile(UUID candidateProfile) {
        this.candidateProfile = candidateProfile;
    }

    public UUID getJob() {
        return job;
    }

    public void setJob(UUID job) {
        this.job = job;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SavedJobId that = (SavedJobId) o;
        return Objects.equals(candidateProfile, that.candidateProfile) &&
                Objects.equals(job, that.job);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidateProfile, job);
    }
}
