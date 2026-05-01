DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_preferences'
      AND policyname = 'Users can view own preferences'
  ) THEN
    CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_preferences'
      AND policyname = 'Users can insert own preferences'
  ) THEN
    CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_preferences'
      AND policyname = 'Users can update own preferences'
  ) THEN
    CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_preferences'
      AND policyname = 'Users can delete own preferences'
  ) THEN
    CREATE POLICY "Users can delete own preferences"
    ON public.user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.users
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_preferences
TO authenticated;
