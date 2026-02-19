import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an image file to a Supabase Storage bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(
  file: File,
  bucket: 'listing-images' | 'vintography-results' | 'user-uploads',
  userId: string
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${filename}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
