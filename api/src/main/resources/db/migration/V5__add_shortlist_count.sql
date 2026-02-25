-- ============================================
-- V5: Add shortlist_count to jobs table
-- Allows companies to set how many top candidates
-- to auto-shortlist when the job is closed
-- ============================================

ALTER TABLE jobs ADD COLUMN shortlist_count INTEGER;
