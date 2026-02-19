import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { VintographyJob } from '@/types/database';
import type { Operation, OperationParams } from '@/lib/vintography-state';

export function useVintographyJobs() {
  return useQuery({
    queryKey: ['vintography_jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vintography_jobs')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as VintographyJob[];
    },
  });
}

export function useProcessImage() {
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({
      imageUrl,
      operation,
      params,
    }: {
      imageUrl: string;
      operation: Operation;
      params: OperationParams;
    }) => {
      const { data, error } = await supabase.functions.invoke('vintography', {
        body: { imageUrl, operation, params },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? 'Processing failed');
      return data as { success: true; resultUrl: string; jobId: string; creditsUsed: number };
    },
    onSuccess: () => {
      refreshProfile();
    },
  });
}
