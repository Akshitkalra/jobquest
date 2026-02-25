package com.jobportal.api.service;

import com.jobportal.api.exception.MlServiceException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class MlServiceClient {

    private final RestClient restClient;

    public MlServiceClient(
            @Value("${ml-service.base-url}") String baseUrl,
            @Value("${ml-service.api-key:}") String apiKey,
            RestClient.Builder restClientBuilder) {

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("X-Service-Key", apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Vectorize a job posting and store in Pinecone.
     *
     * @return vector_id from the ML service
     */
    public String vectorizeJob(UUID jobId, String title, String description,
                               String requirements, List<String> skills,
                               Map<String, String> metadata) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("job_id", jobId.toString());
            body.put("title", title);
            body.put("description", description);
            body.put("requirements", requirements);
            body.put("skills", skills != null ? skills : Collections.emptyList());
            body.put("metadata", metadata != null ? metadata : Collections.emptyMap());

            Map<String, Object> response = restClient.post()
                    .uri("/api/v1/embeddings/job")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.containsKey("vector_id")) {
                return (String) response.get("vector_id");
            }

            throw new MlServiceException("ML service returned no vector_id for job: " + jobId);
        } catch (MlServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to vectorize job {}: {}", jobId, e.getMessage(), e);
            throw new MlServiceException("Failed to vectorize job: " + jobId, e);
        }
    }

    /**
     * Vectorize a resume and store in Pinecone.
     *
     * @return vector_id from the ML service
     */
    public String vectorizeResume(UUID candidateId, UUID resumeId, String parsedText,
                                  String headline, List<String> skills,
                                  Map<String, String> metadata) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("candidate_id", candidateId.toString());
            body.put("resume_id", resumeId.toString());
            body.put("parsed_text", parsedText);
            body.put("headline", headline);
            body.put("skills", skills != null ? skills : Collections.emptyList());
            body.put("metadata", metadata != null ? metadata : Collections.emptyMap());

            Map<String, Object> response = restClient.post()
                    .uri("/api/v1/embeddings/resume")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.containsKey("vector_id")) {
                return (String) response.get("vector_id");
            }

            throw new MlServiceException("ML service returned no vector_id for resume: " + resumeId);
        } catch (MlServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to vectorize resume {}: {}", resumeId, e.getMessage(), e);
            throw new MlServiceException("Failed to vectorize resume: " + resumeId, e);
        }
    }

    /**
     * Delete a vector from Pinecone.
     */
    public void deleteVector(String vectorId, String namespace) {
        try {
            restClient.delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/embeddings/{vectorId}")
                            .queryParam("namespace", namespace)
                            .build(vectorId))
                    .retrieve()
                    .toBodilessEntity();

            log.info("Deleted vector {} from namespace {}", vectorId, namespace);
        } catch (Exception e) {
            log.error("Failed to delete vector {} from namespace {}: {}", vectorId, namespace, e.getMessage(), e);
            // Don't throw - deletion failures should not crash the main flow
        }
    }

    /**
     * Search for jobs matching a resume/query text using semantic search.
     *
     * @return list of SearchResult with job IDs and similarity scores
     */
    public List<SearchResult> searchJobsByResume(String queryText, int topK,
                                                  Map<String, Object> filter) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("query_text", queryText);
            body.put("top_k", topK);
            if (filter != null && !filter.isEmpty()) {
                body.put("filter", filter);
            }

            Map<String, Object> response = restClient.post()
                    .uri("/api/v1/search/jobs-by-resume")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            return extractSearchResults(response);
        } catch (Exception e) {
            log.error("Failed to search jobs by resume: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Search for candidates matching a job description using semantic search.
     *
     * @return list of SearchResult with candidate IDs and similarity scores
     */
    public List<SearchResult> searchCandidatesByJob(String queryText, int topK,
                                                     Map<String, Object> filter) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("query_text", queryText);
            body.put("top_k", topK);
            if (filter != null && !filter.isEmpty()) {
                body.put("filter", filter);
            }

            Map<String, Object> response = restClient.post()
                    .uri("/api/v1/search/candidates-by-job")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            return extractSearchResults(response);
        } catch (Exception e) {
            log.error("Failed to search candidates by job: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Compute similarity between a resume text and a specific job.
     * Uses searchJobsByResume with topK=1 and a filter for the specific job ID.
     *
     * @return similarity score between 0.0 and 1.0, or 0.0 if no match
     */
    public double computeSimilarity(String resumeText, String jobId) {
        try {
            Map<String, Object> filter = new HashMap<>();
            filter.put("job_id", jobId);

            List<SearchResult> results = searchJobsByResume(resumeText, 1, filter);

            if (results != null && !results.isEmpty()) {
                return results.getFirst().getScore();
            }

            return 0.0;
        } catch (Exception e) {
            log.error("Failed to compute similarity for job {}: {}", jobId, e.getMessage(), e);
            return 0.0;
        }
    }

    @SuppressWarnings("unchecked")
    private List<SearchResult> extractSearchResults(Map<String, Object> response) {
        if (response == null) {
            return Collections.emptyList();
        }

        Object resultsObj = response.get("results");
        if (resultsObj == null) {
            resultsObj = response.get("matches");
        }

        if (resultsObj instanceof List<?> resultsList) {
            return resultsList.stream()
                    .filter(item -> item instanceof Map)
                    .map(item -> {
                        Map<String, Object> map = (Map<String, Object>) item;
                        return SearchResult.builder()
                                .id(String.valueOf(map.get("id")))
                                .score(map.get("score") instanceof Number num ? num.doubleValue() : 0.0)
                                .metadata(map.get("metadata") instanceof Map
                                        ? (Map<String, Object>) map.get("metadata")
                                        : Collections.emptyMap())
                                .build();
                    })
                    .toList();
        }

        return Collections.emptyList();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResult {
        private String id;
        private double score;
        private Map<String, Object> metadata;
    }
}
