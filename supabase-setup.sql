-- ============================================================
-- CleverCrack - Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Client Profiles table
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  name            TEXT NOT NULL,
  company         TEXT,
  requirement_title TEXT,
  story           TEXT,
  required_skills TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Freelancer Profiles table
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT,
  name             TEXT NOT NULL,
  skills           TEXT[] DEFAULT '{}',
  experience_years INT  DEFAULT 0,
  about            TEXT,
  monthly_rate     TEXT,
  is_available     BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: clients can read/write their own profile
CREATE POLICY "client_profile_self" ON public.client_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: freelancers can read/write their own profile
CREATE POLICY "freelancer_profile_self" ON public.freelancer_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Clients can read ALL freelancer profiles (for talent browse)
CREATE POLICY "clients_read_freelancers" ON public.freelancer_profiles
  FOR SELECT USING (true);

-- Freelancers can read client profiles they are matched with (simplified: any authenticated user)
CREATE POLICY "freelancers_read_clients" ON public.client_profiles
  FOR SELECT USING (auth.role() = 'authenticated');
