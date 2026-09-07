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
      companies: {
        Row: {
          canton: string | null
          created_at: string
          id: string
          name: string
          sectors: string[]
          uid: string | null
          updated_at: string
          website: string | null
          zefix_url: string | null
        }
        Insert: {
          canton?: string | null
          created_at?: string
          id?: string
          name: string
          sectors?: string[]
          uid?: string | null
          updated_at?: string
          website?: string | null
          zefix_url?: string | null
        }
        Update: {
          canton?: string | null
          created_at?: string
          id?: string
          name?: string
          sectors?: string[]
          uid?: string | null
          updated_at?: string
          website?: string | null
          zefix_url?: string | null
        }
        Relationships: []
      }
      digest_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      digests: {
        Row: {
          created_at: string
          editorial: string
          id: string
          item_ids: string[]
          published_at: string | null
          status: string
          week: string
        }
        Insert: {
          created_at?: string
          editorial: string
          id?: string
          item_ids?: string[]
          published_at?: string | null
          status?: string
          week: string
        }
        Update: {
          created_at?: string
          editorial?: string
          id?: string
          item_ids?: string[]
          published_at?: string | null
          status?: string
          week?: string
        }
        Relationships: []
      }
      investors: {
        Row: {
          created_at: string
          directory_url: string | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          created_at?: string
          directory_url?: string | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          created_at?: string
          directory_url?: string | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      item_investors: {
        Row: {
          investor_id: string
          is_lead: boolean
          item_id: string
        }
        Insert: {
          investor_id: string
          is_lead?: boolean
          item_id: string
        }
        Update: {
          investor_id?: string
          is_lead?: boolean
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_investors_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_sources: {
        Row: {
          created_at: string
          id: string
          item_id: string
          source_key: string | null
          source_name: string | null
          trust_rank: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          source_key?: string | null
          source_name?: string | null
          trust_rank?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          source_key?: string | null
          source_name?: string | null
          trust_rank?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_sources_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          amount: number | null
          canton: string | null
          company_id: string | null
          confidence: number | null
          created_at: string
          currency: string | null
          dedupe_key: string | null
          headline: string
          id: string
          meta: Json
          published_at: string | null
          round_stage: string | null
          sectors: string[]
          signal_type: string
          status: string
          summary: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          canton?: string | null
          company_id?: string | null
          confidence?: number | null
          created_at?: string
          currency?: string | null
          dedupe_key?: string | null
          headline: string
          id?: string
          meta?: Json
          published_at?: string | null
          round_stage?: string | null
          sectors?: string[]
          signal_type: string
          status?: string
          summary?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          canton?: string | null
          company_id?: string | null
          confidence?: number | null
          created_at?: string
          currency?: string | null
          dedupe_key?: string | null
          headline?: string
          id?: string
          meta?: Json
          published_at?: string | null
          round_stage?: string | null
          sectors?: string[]
          signal_type?: string
          status?: string
          summary?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
