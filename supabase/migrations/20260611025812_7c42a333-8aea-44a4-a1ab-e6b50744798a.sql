
CREATE POLICY "Public can read gallery via signed url" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public can read blog via signed url" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');
