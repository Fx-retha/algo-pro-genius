-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number text;

-- Make phone_number required for new profiles by adding a check
-- We'll handle this in the application layer since existing profiles don't have it