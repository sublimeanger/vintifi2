import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OptimiseInput {
  title?: string;
  description?: string;
  brand?: string;
  category?: string;
  size?: string;
  condition?: string;
  colour?: string;
  photoUrls?: string[];
  sell_wizard?: boolean;
  seller_notes?: string;
}

export function useOptimiseListing() {
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (input: OptimiseInput) => {
      const { data, error } = await supabase.functions.invoke('optimize-listing', {
        body: input,
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as {
        optimised_title: string;
        optimised_description: string;
        hashtags: string[];
        health_score: Record<string, number | string>;
      };
    },
    onSuccess: () => {
      refreshProfile();
    },
  });
}
