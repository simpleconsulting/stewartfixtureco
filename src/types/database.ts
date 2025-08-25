export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      leads: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          email: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          lat: number | null
          lng: number | null
          source: string | null
          service_notes: string | null
          preferred_days: string | null
          preferred_time: string | null
          status: Database["public"]["Enums"]["lead_status"]
          owner: string | null
          last_contacted_at: string | null
          next_action_at: string | null
          contact_count: number
          converted_client_id: string | null
          converted_job_id: string | null
          converted_at: string | null
          notes: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          submission_count: number
          last_submission_at: string
          is_returning: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          lat?: number | null
          lng?: number | null
          source?: string | null
          service_notes?: string | null
          preferred_days?: string | null
          preferred_time?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          owner?: string | null
          last_contacted_at?: string | null
          next_action_at?: string | null
          contact_count?: number
          converted_client_id?: string | null
          converted_job_id?: string | null
          converted_at?: string | null
          notes?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          submission_count?: number
          last_submission_at?: string
          is_returning?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          lat?: number | null
          lng?: number | null
          source?: string | null
          service_notes?: string | null
          preferred_days?: string | null
          preferred_time?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          owner?: string | null
          last_contacted_at?: string | null
          next_action_at?: string | null
          contact_count?: number
          converted_client_id?: string | null
          converted_job_id?: string | null
          converted_at?: string | null
          notes?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          submission_count?: number
          last_submission_at?: string
          is_returning?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_service_interests: {
        Row: {
          lead_id: string
          service_offering_id: string
          quantity: number
        }
        Insert: {
          lead_id: string
          service_offering_id: string
          quantity?: number
        }
        Update: {
          lead_id?: string
          service_offering_id?: string
          quantity?: number
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
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      job_status:
        | "draft"
        | "quoted"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "canceled"
      lead_status: "new" | "contacted" | "qualified" | "quoted" | "converted" | "lost"
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
      payment_method: ["cash", "card", "check", "ach", "other"],
      payment_status: ["unpaid", "partial", "paid", "refunded"],
    },
  },
} as const

// Convenient type aliases for common operations
export type Client = Tables<'clients'>
export type ClientInsert = TablesInsert<'clients'>
export type ClientUpdate = TablesUpdate<'clients'>

export type Job = Tables<'jobs'>
export type JobInsert = TablesInsert<'jobs'>
export type JobUpdate = TablesUpdate<'jobs'>

export type JobItem = Tables<'job_items'>
export type JobItemInsert = TablesInsert<'job_items'>
export type JobItemUpdate = TablesUpdate<'job_items'>

export type ServiceOffering = Tables<'service_offerings'>
export type ServiceOfferingInsert = TablesInsert<'service_offerings'>
export type ServiceOfferingUpdate = TablesUpdate<'service_offerings'>

export type Payment = Tables<'payments'>
export type PaymentInsert = TablesInsert<'payments'>
export type PaymentUpdate = TablesUpdate<'payments'>

export type Attachment = Tables<'attachments'>
export type AttachmentInsert = TablesInsert<'attachments'>
export type AttachmentUpdate = TablesUpdate<'attachments'>

export type UserProfile = Tables<'user_profiles'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>

export type JobFinancials = Tables<'job_financials'>

export type Lead = Tables<'leads'>
export type LeadInsert = TablesInsert<'leads'>
export type LeadUpdate = TablesUpdate<'leads'>

export type LeadServiceInterest = Tables<'lead_service_interests'>
export type LeadServiceInterestInsert = TablesInsert<'lead_service_interests'>
export type LeadServiceInterestUpdate = TablesUpdate<'lead_service_interests'>

// Enum types for easier usage
export type JobStatus = Enums<'job_status'>
export type LeadStatus = Enums<'lead_status'>
export type PaymentStatus = Enums<'payment_status'>
export type PaymentMethod = Enums<'payment_method'>