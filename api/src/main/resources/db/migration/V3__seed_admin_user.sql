-- ============================================
-- V3: Seed default super admin user
-- Password: Admin@123 (BCrypt encoded)
-- ============================================

INSERT INTO users (id, email, password_hash, user_type, first_name, last_name, is_active, is_verified, email_verified_at)
VALUES (
    gen_random_uuid(),
    'admin@jobportal.com',
    '$2a$12$LJ3a6JBGC4VPqYCEhKFOqu6XFGcfPmhIQmDHwOXnDE4JVnioKJjHi',
    'ADMIN',
    'Super',
    'Admin',
    TRUE,
    TRUE,
    NOW()
);

-- Assign SUPER_ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@jobportal.com' AND r.name = 'SUPER_ADMIN';
