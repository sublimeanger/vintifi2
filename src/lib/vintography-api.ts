import { supabase } from '@/integrations/supabase/client';
import type { Operation, OperationParams } from './vintography-state';

export interface ProcessImageResult {
  success: boolean;
  imageUrl: string;
  error?: string;
}

/**
 * Calls the real `vintography` Edge Function.
 * Preserves the exact same interface so all Phase 3/4 components work unchanged.
 */
export async function processImage(
  imageUrl: string,
  operation: Operation,
  params: OperationParams
): Promise<ProcessImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('vintography', {
      body: { imageUrl, operation, params },
    });

    if (error) {
      return { success: false, imageUrl, error: error.message };
    }

    if (!data?.success) {
      return { success: false, imageUrl, error: data?.error ?? 'Processing failed' };
    }

    return { success: true, imageUrl: data.resultUrl ?? imageUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, imageUrl, error: msg };
  }
}
