// Auto-generated types matching the Phase 0 migration schema.
// Do NOT edit — regenerate from the database schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          subscription_tier: 'free' | 'pro' | 'business' | 'scale' | 'enterprise';
          credits_balance: number;
          credits_monthly_allowance: number;
          credits_reset_date: string;
          first_item_pass_used: boolean;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          subscription_tier?: 'free' | 'pro' | 'business' | 'scale' | 'enterprise';
          credits_balance?: number;
          credits_monthly_allowance?: number;
          credits_reset_date?: string;
          first_item_pass_used?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          optimised_title: string | null;
          description: string | null;
          optimised_description: string | null;
          brand: string | null;
          category: string | null;
          size: string | null;
          condition: 'new_with_tags' | 'new_without_tags' | 'very_good' | 'good' | 'satisfactory' | null;
          colour: string | null;
          original_photos: string[];
          enhanced_photos: string[];
          hashtags: string[];
          suggested_price: number | null;
          price_range_low: number | null;
          price_range_median: number | null;
          price_range_high: number | null;
          chosen_price: number | null;
          source_url: string | null;
          status: 'draft' | 'listed' | 'sold' | 'archived';
          listing_id_external: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          optimised_title?: string | null;
          description?: string | null;
          optimised_description?: string | null;
          brand?: string | null;
          category?: string | null;
          size?: string | null;
          condition?: 'new_with_tags' | 'new_without_tags' | 'very_good' | 'good' | 'satisfactory' | null;
          colour?: string | null;
          original_photos?: string[];
          enhanced_photos?: string[];
          hashtags?: string[];
          suggested_price?: number | null;
          price_range_low?: number | null;
          price_range_median?: number | null;
          price_range_high?: number | null;
          chosen_price?: number | null;
          source_url?: string | null;
          status?: 'draft' | 'listed' | 'sold' | 'archived';
          listing_id_external?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      vintography_jobs: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string | null;
          operation: 'clean_bg' | 'lifestyle_bg' | 'flatlay' | 'mannequin' | 'ghost_mannequin' | 'ai_model' | 'enhance' | 'decrease';
          params: Json;
          original_image_url: string;
          result_image_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          credits_cost: number;
          first_item_free: boolean;
          pipeline_id: string | null;
          pipeline_step: number | null;
          processing_time_ms: number | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id?: string | null;
          operation: 'clean_bg' | 'lifestyle_bg' | 'flatlay' | 'mannequin' | 'ghost_mannequin' | 'ai_model' | 'enhance' | 'decrease';
          params?: Json;
          original_image_url: string;
          result_image_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          credits_cost?: number;
          first_item_free?: boolean;
          pipeline_id?: string | null;
          pipeline_step?: number | null;
          processing_time_ms?: number | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vintography_jobs']['Insert']>;
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          balance_after: number;
          operation: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          balance_after: number;
          operation: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['credit_transactions']['Insert']>;
      };
      price_checks: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string | null;
          item_title: string | null;
          item_brand: string | null;
          item_category: string | null;
          item_condition: string | null;
          suggested_price: number | null;
          price_range_low: number | null;
          price_range_median: number | null;
          price_range_high: number | null;
          confidence_score: number | null;
          comparable_items: Json;
          ai_insights: string | null;
          price_distribution: Json;
          search_query: string | null;
          vinted_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id?: string | null;
          item_title?: string | null;
          item_brand?: string | null;
          item_category?: string | null;
          item_condition?: string | null;
          suggested_price?: number | null;
          price_range_low?: number | null;
          price_range_median?: number | null;
          price_range_high?: number | null;
          confidence_score?: number | null;
          comparable_items?: Json;
          ai_insights?: string | null;
          price_distribution?: Json;
          search_query?: string | null;
          vinted_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['price_checks']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          status: string;
          tier: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          status?: string;
          tier?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_operation: string;
          p_description?: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience entity types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type VintographyJob = Database['public']['Tables']['vintography_jobs']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
export type PriceCheck = Database['public']['Tables']['price_checks']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
