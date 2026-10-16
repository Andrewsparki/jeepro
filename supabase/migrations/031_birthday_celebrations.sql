-- Migration: 031_birthday_celebrations.sql
-- Adds birthday date and birthday_last_claimed_year columns to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS birthday_last_claimed_year INTEGER;

-- Ensure RLS policies allow users to read and update their own birthday columns
COMMENT ON COLUMN public.profiles.birthday IS 'User birth date (YYYY-MM-DD) for yearly birthday celebrations';
COMMENT ON COLUMN public.profiles.birthday_last_claimed_year IS 'The calendar year when user last claimed their birthday reward';
