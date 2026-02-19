import type { Operation, OperationParams } from './vintography-state';

export interface ProcessImageResult {
  success: boolean;
  imageUrl: string;
  error?: string;
}

/**
 * Phase 3 stub: simulates a 2-second processing delay and returns
 * the original image URL as the result.
 * 
 * This signature is identical to what will be wired to a real
 * Edge Function in a later phase.
 */
export async function processImage(
  imageUrl: string,
  operation: Operation,
  params: OperationParams
): Promise<ProcessImageResult> {
  console.log('[vintography-api] processImage (stub)', { operation, params });
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, imageUrl };
}
