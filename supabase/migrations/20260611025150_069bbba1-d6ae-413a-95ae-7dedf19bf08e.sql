
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_html TEXT,
  pdf_path TEXT,
  cover_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies
-- branding (public bucket for logo)
CREATE POLICY "Public can read branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');
CREATE POLICY "Admins can upload branding" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update branding" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete branding" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

-- gallery (private bucket, signed URL access)
CREATE POLICY "Admins can read gallery objects" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload gallery" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- blog (private bucket for PDFs)
CREATE POLICY "Admins can read blog objects" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'blog' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload blog" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blog" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'blog' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blog" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'blog' AND public.has_role(auth.uid(), 'admin'));
