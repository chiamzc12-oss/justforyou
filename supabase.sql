-- SQL to set up the Supabase database for the Heart Gallery

-- 1. Create the photos table
CREATE TABLE public.photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  caption text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on the table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 3. Create policies to allow operations
CREATE POLICY "Allow public read access" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.photos FOR INSERT WITH CHECK (true);

-- 4. Create a storage bucket for the uploaded image files (if you are using Supabase Storage)
-- Note: Make sure the bucket is set to 'public'
INSERT INTO storage.buckets (id, name, public) VALUES ('pictures', 'pictures', true);

-- 5. Policies for the storage bucket to allow anyone to read and upload
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'pictures' );
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'pictures' );
CREATE POLICY "Public Deletes" ON storage.objects FOR DELETE USING ( bucket_id = 'pictures' );

-- 6. Add Delete Policies for photos table
CREATE POLICY "Allow public delete access" ON public.photos FOR DELETE USING (true);

-- 7. Create letters table for the birthday wish
CREATE TABLE public.letters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Enable RLS and add policies for letters table
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on letters" ON public.letters FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on letters" ON public.letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on letters" ON public.letters FOR UPDATE USING (true);
