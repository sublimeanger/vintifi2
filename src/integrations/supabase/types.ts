export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          operation: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          operation: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          operation?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          brand: string | null
          category: string | null
          chosen_price: number | null
          colour: string | null
          condition: string | null
          created_at: string
          description: string | null
          enhanced_photos: string[] | null
          hashtags: string[] | null
          id: string
          listing_id_external: string | null
          optimised_description: string | null
          optimised_title: string | null
          original_photos: string[] | null
          price_range_high: number | null
          price_range_low: number | null
          price_range_median: number | null
          size: string | null
          source_url: string | null
          status: string
          suggested_price: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          chosen_price?: number | null
          colour?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          enhanced_photos?: string[] | null
          hashtags?: string[] | null
          id?: string
          listing_id_external?: string | null
          optimised_description?: string | null
          optimised_title?: string | null
          original_photos?: string[] | null
          price_range_high?: number | null
          price_range_low?: number | null
          price_range_median?: number | null
          size?: string | null
          source_url?: string | null
          status?: string
          suggested_price?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          chosen_price?: number | null
          colour?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          enhanced_photos?: string[] | null
          hashtags?: string[] | null
          id?: string
          listing_id_external?: string | null
          optimised_description?: string | null
          optimised_title?: string | null
          original_photos?: string[] | null
          price_range_high?: number | null
          price_range_low?: number | null
          price_range_median?: number | null
          size?: string | null
          source_url?: string | null
          status?: string
          suggested_price?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_checks: {
        Row: {
          ai_insights: string | null
          comparable_items: Json | null
          confidence_score: number | null
          created_at: string
          id: string
          item_brand: string | null
          item_category: string | null
          item_condition: string | null
          item_title: string | null
          listing_id: string | null
          price_distribution: Json | null
          price_range_high: number | null
          price_range_low: number | null
          price_range_median: number | null
          search_query: string | null
          suggested_price: number | null
          user_id: string
          vinted_url: string | null
        }
        Insert: {
          ai_insights?: string | null
          comparable_items?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          item_brand?: string | null
          item_category?: string | null
          item_condition?: string | null
          item_title?: string | null
          listing_id?: string | null
          price_distribution?: Json | null
          price_range_high?: number | null
          price_range_low?: number | null
          price_range_median?: number | null
          search_query?: string | null
          suggested_price?: number | null
          user_id: string
          vinted_url?: string | null
        }
        Update: {
          ai_insights?: string | null
          comparable_items?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          item_brand?: string | null
          item_category?: string | null
          item_condition?: string | null
          item_title?: string | null
          listing_id?: string | null
          price_distribution?: Json | null
          price_range_high?: number | null
          price_range_low?: number | null
          price_range_median?: number | null
          search_query?: string | null
          suggested_price?: number | null
          user_id?: string
          vinted_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_checks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          credits_balance: number
          credits_monthly_allowance: number
          credits_reset_date: string
          display_name: string | null
          first_item_pass_used: boolean
          id: string
          stripe_customer_id: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          credits_monthly_allowance?: number
          credits_reset_date?: string
          display_name?: string | null
          first_item_pass_used?: boolean
          id: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          credits_monthly_allowance?: number
          credits_reset_date?: string
          display_name?: string | null
          first_item_pass_used?: boolean
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vintography_jobs: {
        Row: {
          created_at: string
          credits_cost: number
          error_message: string | null
          first_item_free: boolean
          id: string
          listing_id: string | null
          operation: string
          original_image_url: string
          params: Json | null
          pipeline_id: string | null
          pipeline_step: number | null
          processing_time_ms: number | null
          result_image_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_cost?: number
          error_message?: string | null
          first_item_free?: boolean
          id?: string
          listing_id?: string | null
          operation: string
          original_image_url: string
          params?: Json | null
          pipeline_id?: string | null
          pipeline_step?: number | null
          processing_time_ms?: number | null
          result_image_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_cost?: number
          error_message?: string | null
          first_item_free?: boolean
          id?: string
          listing_id?: string | null
          operation?: string
          original_image_url?: string
          params?: Json | null
          pipeline_id?: string | null
          pipeline_step?: number | null
          processing_time_ms?: number | null
          result_image_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vintography_jobs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vintography_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_operation: string
          p_user_id: string
        }
        Returns: Json
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_operation: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
