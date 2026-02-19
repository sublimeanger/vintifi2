import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/database';

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listings', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Listing;
    },
  });
}

export function useUpsertListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listing: Partial<Listing> & { id?: string }) => {
      const { data, error } = await supabase
        .from('listings')
        .upsert(listing as any)
        .select()
        .single();
      if (error) throw error;
      return data as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
