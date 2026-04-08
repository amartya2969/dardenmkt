-- ============================================================
-- DardenMkt Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PROFILES TABLE
-- Auto-populated from auth.users on signup
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL CHECK (email LIKE '%@virginia.edu'),
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LISTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 150),
  description   TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  price         NUMERIC(10, 2),
  price_label   TEXT,
  category      TEXT NOT NULL,
  subcategory   TEXT,
  images        TEXT[] DEFAULT '{}',
  contact_email TEXT NOT NULL,
  location      TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'sold', 'expired', 'removed')),
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ DEFAULT (now() + INTERVAL '60 days')
);

-- Full-text search
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS listings_search_idx  ON listings USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category);
CREATE INDEX IF NOT EXISTS listings_status_idx   ON listings (status);
CREATE INDEX IF NOT EXISTS listings_user_idx     ON listings (user_id);
CREATE INDEX IF NOT EXISTS listings_created_idx  ON listings (created_at DESC);

-- ============================================================
-- SAVED LISTINGS TABLE (bookmarks)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_listings (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on listings
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- LISTINGS: public can read active; owners can read all their own
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view all their own listings"
  ON listings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE USING (auth.uid() = user_id);

-- SAVED LISTINGS
CREATE POLICY "Users can manage their own saved listings"
  ON saved_listings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET (run this separately or via dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('listing-images', 'listing-images', true);

-- Storage RLS: authenticated users can upload to their own folder
-- CREATE POLICY "Users can upload listing images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Listing images are publicly readable"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'listing-images');
