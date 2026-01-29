-- Journal Entries Table
-- Run this in Supabase SQL Editor

-- Journal entries table for trading diary
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(date);

-- Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for journal images
-- Note: Run this separately in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: journal-images
-- Public: false (private bucket)

-- Storage RLS policies (run after creating the bucket)
-- CREATE POLICY "Users can upload journal images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'journal-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can view own journal images"
-- ON storage.objects FOR SELECT
-- USING (
--     bucket_id = 'journal-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can delete own journal images"
-- ON storage.objects FOR DELETE
-- USING (
--     bucket_id = 'journal-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );
