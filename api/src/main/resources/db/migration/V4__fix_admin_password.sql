-- ============================================
-- V4: Fix admin password hash
-- Password: Admin@123 (BCrypt encoded correctly)
-- ============================================

UPDATE users
SET password_hash = '$2b$12$qvFs26LSAjkhN5nxY1gXqeMP4o1B3G.ogbkVPryDDF9LwvTObvW7i'
WHERE email = 'admin@jobportal.com';
