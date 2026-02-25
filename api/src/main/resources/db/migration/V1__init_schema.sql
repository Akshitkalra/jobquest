-- ============================================
-- V1: Initial database schema for Job Portal
-- ============================================

-- Users table (all user types)
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    user_type         VARCHAR(20) NOT NULL CHECK (user_type IN ('CANDIDATE', 'COMPANY', 'ADMIN')),
    first_name        VARCHAR(100),
    last_name         VARCHAR(100),
    phone             VARCHAR(20),
    avatar_url        VARCHAR(500),
    is_active         BOOLEAN DEFAULT TRUE,
    is_verified       BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at     TIMESTAMP,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Roles table
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    module      VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- User-Role join table
CREATE TABLE user_roles (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Role-Permission join table
CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Companies table
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    industry        VARCHAR(100),
    company_size    VARCHAR(50),
    website         VARCHAR(500),
    logo_url        VARCHAR(500),
    cover_image_url VARCHAR(500),
    headquarters    VARCHAR(255),
    founded_year    INTEGER,
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- Candidate profiles
CREATE TABLE candidate_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline            VARCHAR(255),
    summary             TEXT,
    experience_years    INTEGER DEFAULT 0,
    current_title       VARCHAR(255),
    current_company     VARCHAR(255),
    location            VARCHAR(255),
    preferred_work_mode VARCHAR(20),
    expected_salary_min DECIMAL(12,2),
    expected_salary_max DECIMAL(12,2),
    salary_currency     VARCHAR(3) DEFAULT 'USD',
    is_open_to_work     BOOLEAN DEFAULT TRUE,
    linkedin_url        VARCHAR(500),
    github_url          VARCHAR(500),
    portfolio_url       VARCHAR(500),
    pinecone_vector_id  VARCHAR(255),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);

-- Skills master table
CREATE TABLE skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(50),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skills_name ON skills(name);

-- Candidate skills
CREATE TABLE candidate_skills (
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id             UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level    VARCHAR(20),
    years_experience     INTEGER,
    PRIMARY KEY (candidate_profile_id, skill_id)
);

-- Resumes
CREATE TABLE resumes (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    file_url             VARCHAR(500) NOT NULL,
    file_name            VARCHAR(255) NOT NULL,
    file_size            INTEGER,
    cloudinary_public_id VARCHAR(255),
    parsed_text          TEXT,
    pinecone_vector_id   VARCHAR(255),
    is_primary           BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resumes_candidate ON resumes(candidate_profile_id);

-- Jobs
CREATE TABLE jobs (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id           UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title                VARCHAR(255) NOT NULL,
    slug                 VARCHAR(300) NOT NULL UNIQUE,
    description          TEXT NOT NULL,
    requirements         TEXT,
    responsibilities     TEXT,
    benefits             TEXT,
    job_type             VARCHAR(20) NOT NULL,
    experience_level     VARCHAR(20) NOT NULL,
    work_mode            VARCHAR(20) NOT NULL,
    location             VARCHAR(255),
    salary_min           DECIMAL(12,2),
    salary_max           DECIMAL(12,2),
    salary_currency      VARCHAR(3) DEFAULT 'USD',
    is_salary_visible    BOOLEAN DEFAULT TRUE,
    application_deadline TIMESTAMP,
    status               VARCHAR(20) DEFAULT 'ACTIVE',
    views_count          INTEGER DEFAULT 0,
    applications_count   INTEGER DEFAULT 0,
    pinecone_vector_id   VARCHAR(255),
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- Job skills
CREATE TABLE job_skills (
    job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id    UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

-- Applications
CREATE TABLE applications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id           UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id     UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    resume_id        UUID REFERENCES resumes(id),
    cover_letter     TEXT,
    status           VARCHAR(30) DEFAULT 'PENDING',
    similarity_score DECIMAL(5,4),
    company_notes    TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW(),

    UNIQUE(job_id, candidate_id)
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_score ON applications(similarity_score DESC);

-- Application status history
CREATE TABLE application_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status      VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    changed_by      UUID REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_app_history_application ON application_status_history(application_id);

-- Saved jobs (bookmarks)
CREATE TABLE saved_jobs (
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id               UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at           TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (candidate_profile_id, job_id)
);

-- Notifications
CREATE TABLE notifications (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    message        TEXT NOT NULL,
    type           VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id   UUID,
    is_read        BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
