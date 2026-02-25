-- ============================================
-- V2: Seed roles and permissions
-- ============================================

-- Roles
INSERT INTO roles (id, name, description, is_system) VALUES
    (gen_random_uuid(), 'SUPER_ADMIN', 'Full platform control', TRUE),
    (gen_random_uuid(), 'ADMIN', 'Platform administration', TRUE),
    (gen_random_uuid(), 'MODERATOR', 'Content moderation', TRUE),
    (gen_random_uuid(), 'COMPANY_OWNER', 'Company account holder', TRUE),
    (gen_random_uuid(), 'CANDIDATE', 'Job seeker', TRUE);

-- Permissions
-- User module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'user:read', 'View user details', 'user'),
    (gen_random_uuid(), 'user:update', 'Update user details', 'user'),
    (gen_random_uuid(), 'user:delete', 'Delete users', 'user'),
    (gen_random_uuid(), 'user:list', 'List all users', 'user'),
    (gen_random_uuid(), 'user:manage_roles', 'Manage user roles', 'user');

-- Company module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'company:create', 'Create company', 'company'),
    (gen_random_uuid(), 'company:read', 'View company details', 'company'),
    (gen_random_uuid(), 'company:update', 'Update company details', 'company'),
    (gen_random_uuid(), 'company:delete', 'Delete company', 'company'),
    (gen_random_uuid(), 'company:verify', 'Verify company', 'company');

-- Job module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'job:create', 'Create job posting', 'job'),
    (gen_random_uuid(), 'job:read', 'View job details', 'job'),
    (gen_random_uuid(), 'job:update', 'Update job posting', 'job'),
    (gen_random_uuid(), 'job:delete', 'Delete job posting', 'job'),
    (gen_random_uuid(), 'job:moderate', 'Moderate job postings', 'job');

-- Application module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'application:create', 'Apply to jobs', 'application'),
    (gen_random_uuid(), 'application:read', 'View applications', 'application'),
    (gen_random_uuid(), 'application:update_status', 'Update application status', 'application'),
    (gen_random_uuid(), 'application:delete', 'Delete applications', 'application');

-- Resume module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'resume:upload', 'Upload resume', 'resume'),
    (gen_random_uuid(), 'resume:read', 'View resume', 'resume'),
    (gen_random_uuid(), 'resume:delete', 'Delete resume', 'resume');

-- Admin module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'admin:dashboard', 'Access admin dashboard', 'admin'),
    (gen_random_uuid(), 'admin:manage_roles', 'Manage roles', 'admin'),
    (gen_random_uuid(), 'admin:manage_permissions', 'Manage permissions', 'admin'),
    (gen_random_uuid(), 'admin:analytics', 'View analytics', 'admin'),
    (gen_random_uuid(), 'admin:settings', 'Manage platform settings', 'admin');

-- Search module
INSERT INTO permissions (id, name, description, module) VALUES
    (gen_random_uuid(), 'search:jobs', 'Search for jobs', 'search'),
    (gen_random_uuid(), 'search:candidates', 'Search for candidates', 'search');

-- Assign permissions to roles

-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- ADMIN gets all except manage_permissions and settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.name NOT IN ('admin:manage_permissions', 'admin:settings');

-- MODERATOR gets moderation-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'MODERATOR' AND p.name IN (
    'user:read', 'user:list', 'company:read', 'company:verify',
    'job:read', 'job:moderate', 'application:read', 'admin:dashboard'
);

-- COMPANY_OWNER gets company and job management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'COMPANY_OWNER' AND p.name IN (
    'company:create', 'company:read', 'company:update',
    'job:create', 'job:read', 'job:update', 'job:delete',
    'application:read', 'application:update_status',
    'resume:read', 'search:candidates'
);

-- CANDIDATE gets job seeking permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'CANDIDATE' AND p.name IN (
    'job:read', 'application:create', 'application:read',
    'resume:upload', 'resume:read', 'resume:delete',
    'search:jobs', 'company:read'
);
