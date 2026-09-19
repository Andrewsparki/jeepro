-- Migration 027: Allow Admins to Delete Audit Logs

-- Add RLS policy on public.audit_logs allowing admins to delete audit log entries
DROP POLICY IF EXISTS "Admins can delete audit logs" ON public.audit_logs;

CREATE POLICY "Admins can delete audit logs"
  ON public.audit_logs
  FOR DELETE
  USING (public.is_admin());
