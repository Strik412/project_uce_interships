-- Migration: Add dual approval columns to hour_logs table
-- Date: 2026-01-10
-- Description: Add columns to track separate teacher and company approvals

-- Add new columns for teacher approval
ALTER TABLE hour_logs
ADD COLUMN IF NOT EXISTS teacher_approved_by UUID,
ADD COLUMN IF NOT EXISTS teacher_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS teacher_approval_comments TEXT;

-- Add new columns for company approval
ALTER TABLE hour_logs
ADD COLUMN IF NOT EXISTS company_approved_by UUID,
ADD COLUMN IF NOT EXISTS company_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS company_approval_comments TEXT;

-- Add foreign key constraints
ALTER TABLE hour_logs
ADD CONSTRAINT fk_hour_logs_teacher_approved_by
FOREIGN KEY (teacher_approved_by) REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE hour_logs
ADD CONSTRAINT fk_hour_logs_company_approved_by
FOREIGN KEY (company_approved_by) REFERENCES users(id)
ON DELETE SET NULL;

-- Migrate existing approved/rejected logs to use teacher approval fields
-- (Assuming existing reviews were done by teachers)
UPDATE hour_logs
SET 
  teacher_approved_by = "reviewedBy",
  teacher_approved_at = "reviewedAt",
  teacher_approval_comments = "reviewerComments"
WHERE "reviewedBy" IS NOT NULL AND status != 'PENDING';

-- Add comment to the table
COMMENT ON COLUMN hour_logs.teacher_approved_by IS 'ID of the teacher/professor who approved';
COMMENT ON COLUMN hour_logs.teacher_approved_at IS 'Timestamp when teacher approved';
COMMENT ON COLUMN hour_logs.teacher_approval_comments IS 'Comments from teacher';
COMMENT ON COLUMN hour_logs.company_approved_by IS 'ID of the company supervisor who approved';
COMMENT ON COLUMN hour_logs.company_approved_at IS 'Timestamp when company approved';
COMMENT ON COLUMN hour_logs.company_approval_comments IS 'Comments from company';

COMMENT ON TABLE hour_logs IS 'Hour logs require dual approval from both teacher and company before being marked as APPROVED';
