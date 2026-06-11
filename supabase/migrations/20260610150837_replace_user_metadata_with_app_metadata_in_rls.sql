
-- Replace all RLS policies that use user_metadata with app_metadata
-- app_metadata can only be set via service_role key, not by end users

-- =============================================================
-- public."user" table
-- =============================================================
DROP POLICY "select_own_user" ON public."user";
DROP POLICY "insert_user_admin" ON public."user";
DROP POLICY "update_user_admin" ON public."user";
DROP POLICY "delete_user_admin" ON public."user";

CREATE POLICY "select_own_user" ON public."user" FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "insert_user_admin" ON public."user" FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "update_user_admin" ON public."user" FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "delete_user_admin" ON public."user" FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- public."verification" table
-- =============================================================
DROP POLICY "select_verification_admin" ON public."verification";
DROP POLICY "insert_verification_admin" ON public."verification";
DROP POLICY "update_verification_admin" ON public."verification";
DROP POLICY "delete_verification_admin" ON public."verification";

CREATE POLICY "select_verification_admin" ON public."verification" FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "insert_verification_admin" ON public."verification" FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "update_verification_admin" ON public."verification" FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "delete_verification_admin" ON public."verification" FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- public.clients table
-- =============================================================
DROP POLICY "insert_clients" ON public.clients;
DROP POLICY "update_clients" ON public.clients;
DROP POLICY "delete_clients" ON public.clients;

CREATE POLICY "insert_clients" ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "update_clients" ON public.clients FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "delete_clients" ON public.clients FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- public.drones table
-- =============================================================
DROP POLICY "insert_drones" ON public.drones;
DROP POLICY "update_drones" ON public.drones;
DROP POLICY "delete_drones" ON public.drones;

CREATE POLICY "insert_drones" ON public.drones FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "update_drones" ON public.drones FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "delete_drones" ON public.drones FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- public.service_requests table
-- =============================================================
DROP POLICY "insert_service_requests" ON public.service_requests;
DROP POLICY "update_service_requests" ON public.service_requests;
DROP POLICY "delete_service_requests" ON public.service_requests;

CREATE POLICY "insert_service_requests" ON public.service_requests FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "update_service_requests" ON public.service_requests FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "delete_service_requests" ON public.service_requests FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- public.service_types table
-- =============================================================
DROP POLICY "insert_service_types" ON public.service_types;
DROP POLICY "update_service_types" ON public.service_types;
DROP POLICY "delete_service_types" ON public.service_types;

CREATE POLICY "insert_service_types" ON public.service_types FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "update_service_types" ON public.service_types FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "delete_service_types" ON public.service_types FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
