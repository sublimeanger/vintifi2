import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PriceCheckInput {
  brand: string;
  category: string;
  title?: string;
  condition: string;
  size?: string;
  listingId?: string;
  url?: string;
  sell_wizard?: boolean;
}

export function usePriceCheck() {
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (input: PriceCheckInput) => {
      const { data, error } = await supabase.functions.invoke('price-check', {
        body: input,
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      refreshProfile();
    },
  });
}
