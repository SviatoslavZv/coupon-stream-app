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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      coupons: {
        Row: {
          affiliate_link: string | null
          asin: string | null
          brand: string | null
          category: string | null
          click_count: number
          code: string | null
          created_at: string | null
          description: string
          discount_label: string
          expires_at: string
          gender: string | null
          id: string
          image_url: string | null
          last_verified_at: string | null
          store_id: string
          subcategory: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          asin?: string | null
          brand?: string | null
          category?: string | null
          click_count?: number
          code?: string | null
          created_at?: string | null
          description: string
          discount_label: string
          expires_at: string
          gender?: string | null
          id?: string
          image_url?: string | null
          last_verified_at?: string | null
          store_id: string
          subcategory?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          asin?: string | null
          brand?: string | null
          category?: string | null
          click_count?: number
          code?: string | null
          created_at?: string | null
          description?: string
          discount_label?: string
          expires_at?: string
          gender?: string | null
          id?: string
          image_url?: string | null
          last_verified_at?: string | null
          store_id?: string
          subcategory?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_items: {
        Row: {
          comment: string
          coupon_id: string | null
          created_at: string
          guide_id: string
          id: string
          shop_link_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          comment: string
          coupon_id?: string | null
          created_at?: string
          guide_id: string
          id?: string
          shop_link_id?: string | null
          sort_order: number
          updated_at?: string
        }
        Update: {
          comment?: string
          coupon_id?: string | null
          created_at?: string
          guide_id?: string
          id?: string
          shop_link_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_items_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_items_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_items_shop_link_id_fkey"
            columns: ["shop_link_id"]
            isOneToOne: false
            referencedRelation: "shop_links"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          category: string | null
          created_at: string
          event_slug: string | null
          gender: string | null
          id: string
          intro: string
          is_published: boolean
          meta_description: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          event_slug?: string | null
          gender?: string | null
          id?: string
          intro: string
          is_published?: boolean
          meta_description?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          event_slug?: string | null
          gender?: string | null
          id?: string
          intro?: string
          is_published?: boolean
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_links: {
        Row: {
          asin: string | null
          brand: string | null
          check_status: string | null
          commission_rate: number | null
          coupon_percent: number | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          kind: string
          last_checked_at: string | null
          network_link_id: string | null
          store_id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          asin?: string | null
          brand?: string | null
          check_status?: string | null
          commission_rate?: number | null
          coupon_percent?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          kind: string
          last_checked_at?: string | null
          network_link_id?: string | null
          store_id: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          asin?: string | null
          brand?: string | null
          check_status?: string | null
          commission_rate?: number | null
          coupon_percent?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          kind?: string
          last_checked_at?: string | null
          network_link_id?: string | null
          store_id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_links_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          affiliate_link: string | null
          banner_link: string | null
          banner_url: string | null
          created_at: string | null
          id: string
          logo_url: string
          name: string
          slug: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          affiliate_link?: string | null
          banner_link?: string | null
          banner_url?: string | null
          created_at?: string | null
          id?: string
          logo_url: string
          name: string
          slug: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          affiliate_link?: string | null
          banner_link?: string | null
          banner_url?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string
          name?: string
          slug?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_expired_coupons: { Args: never; Returns: undefined }
      increment_coupon_click: {
        Args: { coupon_id_input: string }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
