
-- Run this in your Supabase SQL Editor to set up the database

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  pib TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT,
  role TEXT NOT NULL,
  session_token TEXT
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_pib TEXT,
  user_phone TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  file_name TEXT,
  file_url TEXT
);

-- Chats Table
CREATE TABLE IF NOT EXISTS chats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  user_pib TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  messages JSONB DEFAULT '[]',
  has_unread_admin BOOLEAN DEFAULT FALSE,
  has_unread_user BOOLEAN DEFAULT FALSE
);

-- Insert Default Admin (if not exists)
INSERT INTO users (id, pib, login, password, email, phone, gender, role)
VALUES ('admin-id', 'Адміністратор Системи', 'admin', 'dfmrtduit2023', 'admin@diwt.edu.ua', '+380000000000', 'male', 'admin')
ON CONFLICT (id) DO NOTHING;
