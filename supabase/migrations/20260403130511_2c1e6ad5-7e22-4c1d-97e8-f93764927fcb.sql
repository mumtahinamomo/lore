
-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create reading_entries table
CREATE TABLE public.reading_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pages_read INTEGER NOT NULL DEFAULT 0,
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reading_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading entries" ON public.reading_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reading entries" ON public.reading_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading entries" ON public.reading_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading entries" ON public.reading_entries FOR DELETE USING (auth.uid() = user_id);

-- Create daily_notes table
CREATE TABLE public.daily_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.daily_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.daily_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.daily_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.daily_notes FOR DELETE USING (auth.uid() = user_id);

-- Create note_images table
CREATE TABLE public.note_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.daily_notes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.note_images ENABLE ROW LEVEL SECURITY;

-- Helper function to check note ownership
CREATE OR REPLACE FUNCTION public.is_owner_of_note(p_note_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.daily_notes WHERE id = p_note_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can view own note images" ON public.note_images FOR SELECT USING (public.is_owner_of_note(note_id));
CREATE POLICY "Users can create own note images" ON public.note_images FOR INSERT WITH CHECK (public.is_owner_of_note(note_id));
CREATE POLICY "Users can delete own note images" ON public.note_images FOR DELETE USING (public.is_owner_of_note(note_id));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_daily_notes_updated_at
  BEFORE UPDATE ON public.daily_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for note images
INSERT INTO storage.buckets (id, name, public) VALUES ('note-images', 'note-images', true);

CREATE POLICY "Users can upload note images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'note-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view note images" ON storage.objects FOR SELECT
  USING (bucket_id = 'note-images');

CREATE POLICY "Users can delete own note images" ON storage.objects FOR DELETE
  USING (bucket_id = 'note-images' AND auth.uid()::text = (storage.foldername(name))[1]);
