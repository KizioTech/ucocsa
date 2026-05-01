-- Migration to add the missing updated_at column to the hymns table.
-- This column is required because of the 'update_hymns_updated_at' trigger added in a previous migration.

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hymns' AND column_name='updated_at') THEN
    ALTER TABLE public.hymns ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;
