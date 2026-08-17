-- ====================================================================
-- CIVICCONNECT AI - COMPLETE DATABASE SCHEMA (100% IDEMPOTENT)
-- PostgreSQL / Supabase Migration Script
-- Safe to run and re-run in Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'worker', 'corporation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_status AS ENUM ('reported', 'reviewed', 'assigned', 'inspection', 'in_progress', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE duration_type AS ENUM ('less_than_month', '1_to_6_months', 'more_than_6_months', 'not_sure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    preferred_language TEXT NOT NULL DEFAULT 'English',
    area TEXT,
    department TEXT,
    phone TEXT,
    worker_status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure profiles id foreign key constraint doesn't block direct profile operations
DO $$ BEGIN
    ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
    WHEN others THEN null;
END $$;


-- 4. CIVIC ISSUES TABLE (Consolidated Public Civic Problems)
CREATE TABLE IF NOT EXISTS public.civic_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    area TEXT NOT NULL,
    landmark TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    priority_score INTEGER NOT NULL DEFAULT 1,
    priority_level priority_level NOT NULL DEFAULT 'medium',
    status issue_status NOT NULL DEFAULT 'reported',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COMPLAINTS TABLE (Individual Submissions by Citizens)
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    civic_issue_id UUID REFERENCES public.civic_issues(id) ON DELETE SET NULL,
    original_text TEXT NOT NULL,
    normalized_text TEXT,
    language TEXT NOT NULL DEFAULT 'English',
    category TEXT,
    area TEXT NOT NULL,
    landmark TEXT,
    duration duration_type DEFAULT 'not_sure',
    accident_reported BOOLEAN NOT NULL DEFAULT FALSE,
    accident_description TEXT,
    injuries_count INTEGER NOT NULL DEFAULT 0,
    status issue_status NOT NULL DEFAULT 'reported',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ISSUE SUPPORT TABLE (Community Upvotes / Backing)
CREATE TABLE IF NOT EXISTS public.issue_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_issue_citizen_support UNIQUE (issue_id, citizen_id)
);

-- 7. EVIDENCE TABLE (Uploaded Photos / Media)
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'image/jpeg',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ACCIDENT REPORTS TABLE (Citizen-reported accident & consequence intelligence)
CREATE TABLE IF NOT EXISTS public.accident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    civic_issue_id UUID NOT NULL REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    injuries INTEGER NOT NULL DEFAULT 0,
    severity TEXT NOT NULL DEFAULT 'minor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ISSUE UPDATES TABLE (Official Timeline Progress)
CREATE TABLE IF NOT EXISTS public.issue_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status issue_status NOT NULL,
    description TEXT NOT NULL,
    update_type TEXT,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ASSIGNMENTS TABLE (Worker Allocations)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    instructions TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'assigned'
);

-- 11. RESPONSES TABLE (Corporation Official & AI-Simplified Statements)
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    corporation_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    official_response TEXT NOT NULL,
    simplified_response TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE (Citizen Alerts & System Updates)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 13. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_area ON public.profiles(area);

CREATE INDEX IF NOT EXISTS idx_civic_issues_area ON public.civic_issues(area);
CREATE INDEX IF NOT EXISTS idx_civic_issues_category ON public.civic_issues(category);
CREATE INDEX IF NOT EXISTS idx_civic_issues_status ON public.civic_issues(status);
CREATE INDEX IF NOT EXISTS idx_civic_issues_priority ON public.civic_issues(priority_level);
CREATE INDEX IF NOT EXISTS idx_civic_issues_score ON public.civic_issues(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_civic_issues_created ON public.civic_issues(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_issue ON public.complaints(civic_issue_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_area ON public.complaints(area);

CREATE INDEX IF NOT EXISTS idx_issue_support_issue ON public.issue_support(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_support_citizen ON public.issue_support(citizen_id);

CREATE INDEX IF NOT EXISTS idx_evidence_issue ON public.evidence(issue_id);
CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON public.evidence(complaint_id);

CREATE INDEX IF NOT EXISTS idx_accident_reports_issue ON public.accident_reports(civic_issue_id);

CREATE INDEX IF NOT EXISTS idx_issue_updates_issue ON public.issue_updates(issue_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_responses_issue ON public.responses(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- ====================================================================
-- 14. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_civic_issues_modtime ON public.civic_issues;
CREATE TRIGGER update_civic_issues_modtime
    BEFORE UPDATE ON public.civic_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_modtime ON public.complaints;
CREATE TRIGGER update_complaints_modtime
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 15. AUTH HOOK: AUTOMATIC PROFILE CREATION ON SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        preferred_language,
        area,
        department
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'English'),
        NEW.raw_user_meta_data->>'area',
        NEW.raw_user_meta_data->>'department'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        preferred_language = EXCLUDED.preferred_language,
        area = EXCLUDED.area,
        department = EXCLUDED.department,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 16.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Anyone can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Anyone can update profiles"
    ON public.profiles FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 16.2 CIVIC ISSUES POLICIES
DROP POLICY IF EXISTS "Civic issues are readable by everyone" ON public.civic_issues;
CREATE POLICY "Civic issues are readable by everyone"
    ON public.civic_issues FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can create civic issues" ON public.civic_issues;
DROP POLICY IF EXISTS "Authenticated users can create civic issues" ON public.civic_issues;
CREATE POLICY "Anyone can create civic issues"
    ON public.civic_issues FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update civic issues" ON public.civic_issues;
DROP POLICY IF EXISTS "Only corporations and admins can update civic issues" ON public.civic_issues;
CREATE POLICY "Anyone can update civic issues"
    ON public.civic_issues FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 16.3 COMPLAINTS POLICIES
DROP POLICY IF EXISTS "Complaints are readable by everyone" ON public.complaints;
DROP POLICY IF EXISTS "Citizens can view their own complaints or public issue complaints" ON public.complaints;
CREATE POLICY "Complaints are readable by everyone"
    ON public.complaints FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Citizens can insert their own complaints" ON public.complaints;
CREATE POLICY "Anyone can insert complaints"
    ON public.complaints FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Citizens can update their own pending complaints" ON public.complaints;
CREATE POLICY "Anyone can update complaints"
    ON public.complaints FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 16.4 ISSUE SUPPORT POLICIES
DROP POLICY IF EXISTS "Issue support is readable by all" ON public.issue_support;
CREATE POLICY "Issue support is readable by all"
    ON public.issue_support FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can add support" ON public.issue_support;
DROP POLICY IF EXISTS "Citizens can add their own support" ON public.issue_support;
CREATE POLICY "Anyone can add support"
    ON public.issue_support FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can remove support" ON public.issue_support;
DROP POLICY IF EXISTS "Citizens can remove their own support" ON public.issue_support;
CREATE POLICY "Anyone can remove support"
    ON public.issue_support FOR DELETE
    TO authenticated, anon
    USING (true);

-- 16.5 EVIDENCE POLICIES
DROP POLICY IF EXISTS "Evidence is readable by all" ON public.evidence;
CREATE POLICY "Evidence is readable by all"
    ON public.evidence FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can upload evidence" ON public.evidence;
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON public.evidence;
CREATE POLICY "Anyone can upload evidence"
    ON public.evidence FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can delete their own uploaded evidence" ON public.evidence;
CREATE POLICY "Anyone can delete evidence"
    ON public.evidence FOR DELETE
    TO authenticated, anon
    USING (true);

-- 16.6 ACCIDENT REPORTS POLICIES
DROP POLICY IF EXISTS "Accident reports are readable by all" ON public.accident_reports;
CREATE POLICY "Accident reports are readable by all"
    ON public.accident_reports FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert accident reports" ON public.accident_reports;
DROP POLICY IF EXISTS "Authenticated users can insert accident reports" ON public.accident_reports;
CREATE POLICY "Anyone can insert accident reports"
    ON public.accident_reports FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 16.7 ISSUE UPDATES POLICIES
DROP POLICY IF EXISTS "Issue updates are publicly readable" ON public.issue_updates;
CREATE POLICY "Issue updates are publicly readable"
    ON public.issue_updates FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can create updates" ON public.issue_updates;
DROP POLICY IF EXISTS "Corporations and workers can create updates" ON public.issue_updates;
CREATE POLICY "Anyone can create updates"
    ON public.issue_updates FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 16.8 ASSIGNMENTS POLICIES
DROP POLICY IF EXISTS "Assignments readable by all" ON public.assignments;
DROP POLICY IF EXISTS "Assignments readable by authenticated users" ON public.assignments;
CREATE POLICY "Assignments readable by all"
    ON public.assignments FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Corporations can create and manage assignments" ON public.assignments;
CREATE POLICY "Anyone can manage assignments"
    ON public.assignments FOR ALL
    TO authenticated, anon
    USING (true);

-- 16.9 RESPONSES POLICIES
DROP POLICY IF EXISTS "Corporation responses are publicly readable" ON public.responses;
DROP POLICY IF EXISTS "Public corporation responses are readable by everyone" ON public.responses;
CREATE POLICY "Corporation responses are publicly readable"
    ON public.responses FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert responses" ON public.responses;
DROP POLICY IF EXISTS "Corporation users can insert responses" ON public.responses;
CREATE POLICY "Anyone can insert responses"
    ON public.responses FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 16.10 NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Notifications are readable by all" ON public.notifications;
DROP POLICY IF EXISTS "Users can view only their own notifications" ON public.notifications;
CREATE POLICY "Notifications are readable by all"
    ON public.notifications FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update read status of notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update read status of their own notifications" ON public.notifications;
CREATE POLICY "Anyone can update read status of notifications"
    ON public.notifications FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- ====================================================================
-- 17. STORAGE BUCKET SETUP & POLICIES (evidence-files)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidence-files',
    'evidence-files',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Public Read on evidence-files" ON storage.objects;
CREATE POLICY "Public Read on evidence-files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'evidence-files');

DROP POLICY IF EXISTS "Authenticated users can upload to evidence-files" ON storage.objects;
CREATE POLICY "Authenticated users can upload to evidence-files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'evidence-files');

DROP POLICY IF EXISTS "Users can delete their own uploaded files in evidence-files" ON storage.objects;
CREATE POLICY "Users can delete their own uploaded files in evidence-files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'evidence-files' AND (storage.foldername(name))[1] = auth.uid()::text);
