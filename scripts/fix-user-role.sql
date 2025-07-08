-- Fix user 6926658281 role to owner
-- Run this in Supabase SQL Editor

-- First, check if user exists
SELECT * FROM users WHERE id = 6926658281;

-- If user doesn't exist, create them as owner
INSERT INTO users (id, name, role) 
VALUES (6926658281, 'Platform Owner', 'owner')
ON CONFLICT (id) 
DO UPDATE SET role = 'owner';

-- Verify the update
SELECT * FROM users WHERE id = 6926658281;

-- Also check if there are any other owners
SELECT * FROM users WHERE role = 'owner';
