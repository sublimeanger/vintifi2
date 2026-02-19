import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (params: {
      type: 'subscription' | 'credit_pack';
      tier?: string;
      pack?: string;
      annual?: boolean;
      price_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: params,
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { url: string };
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function useManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {},
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { url: string };
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
