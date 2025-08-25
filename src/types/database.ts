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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          job_id: string
          kind: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id: string
          kind?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id?: string
          kind?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_financials"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_items: {
        Row: {
          description: string | null
          id: string
          job_id: string
          line_total_cents: number
          quantity: number
          service_offering_id: string | null
          sort_order: number
          unit: string | null
          unit_price_cents: number
        }
        Insert: {
          description?: string | null
          id?: string
          job_id: string
          line_total_cents?: number
          quantity?: number
          service_offering_id?: string | null
          sort_order?: number
          unit?: string | null
          unit_price_cents?: number
        }
        Update: {
          description?: string | null
          id?: string
          job_id?: string
          line_total_cents?: number
          quantity?: number
          service_offering_id?: string | null
          sort_order?: number
          unit?: string | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_financials"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_items_service_offering_id_fkey"
            columns: ["service_offering_id"]
            isOneToOne: false
            referencedRelation: "service_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          client_id: string
          country: string | null
          created_at: string
          discount_cents: number
          final_price_cents: number
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          postal_code: string | null
          quoted_price_cents: number
          scheduled_end: string | null
          scheduled_start: string | null
          state: string | null
          status: Database["public"]["Enums"]["job_status"]
          tax_rate_percent: number
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          client_id: string
          country?: string | null
          created_at?: string
          discount_cents?: number
          final_price_cents?: number
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          postal_code?: string | null
          quoted_price_cents?: number
          scheduled_end?: string | null
          scheduled_start?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tax_rate_percent?: number
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          client_id?: string
          country?: string | null
          created_at?: string
          discount_cents?: number
          final_price_cents?: number
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          postal_code?: string | null
          quoted_price_cents?: number
          scheduled_end?: string | null
          scheduled_start?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tax_rate_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_service_interests: {
        Row: {
          lead_id: string
          quantity: number
          service_offering_id: string
        }
        Insert: {
          lead_id: string
          quantity?: number
          service_offering_id: string
        }
        Update: {
          lead_id?: string
          quantity?: number
          service_offering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_service_interests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_service_interests_service_offering_id_fkey"
            columns: ["service_offering_id"]
            isOneToOne: false
            referencedRelation: "service_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          booking_requested: boolean | null
          city: string | null
          contact_count: number
          converted_at: string | null
          converted_client_id: string | null
          converted_job_id: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_returning: boolean
          last_contacted_at: string | null
          last_submission_at: string | null
          lat: number | null
          lng: number | null
          next_action_at: string | null
          notes: string | null
          owner: string | null
          phone: string | null
          postal_code: string | null
          preferred_days: string | null
          preferred_time: string | null
          service_notes: string | null
          source: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
          submission_count: number
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          booking_requested?: boolean | null
          city?: string | null
          contact_count?: number
          converted_at?: string | null
          converted_client_id?: string | null
          converted_job_id?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_returning?: boolean
          last_contacted_at?: string | null
          last_submission_at?: string | null
          lat?: number | null
          lng?: number | null
          next_action_at?: string | null
          notes?: string | null
          owner?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_days?: string | null
          preferred_time?: string | null
          service_notes?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          submission_count?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          booking_requested?: boolean | null
          city?: string | null
          contact_count?: number
          converted_at?: string | null
          converted_client_id?: string | null
          converted_job_id?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_returning?: boolean
          last_contacted_at?: string | null
          last_submission_at?: string | null
          lat?: number | null
          lng?: number | null
          next_action_at?: string | null
          notes?: string | null
          owner?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_days?: string | null
          preferred_time?: string | null
          service_notes?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          submission_count?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          id: string
          job_id: string
          method: Database["public"]["Enums"]["payment_method"]
          received_at: string
          reference: string | null
        }
        Insert: {
          amount_cents: number
          id?: string
          job_id: string
          method: Database["public"]["Enums"]["payment_method"]
          received_at?: string
          reference?: string | null
        }
        Update: {
          amount_cents?: number
          id?: string
          job_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          received_at?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_financials"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      service_offerings: {
        Row: {
          base_price_cents: number
          created_at: string
          default_duration_minutes: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          base_price_cents?: number
          created_at?: string
          default_duration_minutes?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          unit?: string
          updated_at?: string
        }
        Update: {
          base_price_cents?: number
          created_at?: string
          default_duration_minutes?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      job_financials: {
        Row: {
          amount_paid_cents: number | null
          balance_delta_cents: number | null
          discount_cents: number | null
          items_total_cents: number | null
          job_id: string | null
          suggested_total_cents: number | null
          tax_cents: number | null
          tax_rate_percent: number | null
        }
        Relationships: []
      }
      pipeline_open: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          kind: string | null
          next_action_at: string | null
          phone: string | null
          scheduled_start: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      convert_lead_to_client_job: {
        Args: {
          p_job_status?: Database["public"]["Enums"]["job_status"]
          p_lead_id: string
        }
        Returns: {
          client_id: string
          job_id: string
        }[]
      }
    }
    Enums: {
      job_status:
        | "draft"
        | "quoted"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "canceled"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "quoted"
        | "converted"
        | "lost"
      payment_method: "cash" | "card" | "check" | "ach" | "other"
      payment_status: "unpaid" | "partial" | "paid" | "refunded"
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
    Enums: {
      job_status: [
        "draft",
        "quoted",
        "scheduled",
        "in_progress",
        "completed",
        "canceled",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "quoted",
        "converted",
        "lost",
      ],
      payment_method: ["cash", "card", "check", "ach", "other"],
      payment_status: ["unpaid", "partial", "paid", "refunded"],
    },
  },
} as const

// Convenience types for common operations
export type ServiceOffering = Tables<'service_offerings'>
export type LeadInsert = TablesInsert<'leads'>
export type LeadUpdate = TablesUpdate<'leads'>
export type LeadServiceInterestInsert = TablesInsert<'lead_service_interests'>