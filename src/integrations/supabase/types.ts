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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          soc_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          soc_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          soc_enabled?: boolean | null
        }
        Relationships: []
      }
      threats: {
        Row: {
          adversarial_issues: Json | null
          adversarial_score: number | null
          ai_explanation: string | null
          asn: string | null
          attack_type: string | null
          behavior_issues: Json | null
          behavior_score: number | null
          breach_data: Json | null
          confidence: number
          created_at: string | null
          credential_harvesting_detected: boolean | null
          deepfake_detected: boolean | null
          dkim_pass: boolean | null
          dmarc_pass: boolean | null
          dom_manipulation_detected: boolean | null
          email_authentication_status: string | null
          email_content: string | null
          exposure_score: number | null
          homograph_detected: boolean | null
          id: string
          isp: string | null
          manipulation_tactics: Json | null
          network_issues: Json | null
          network_score: number
          nlp_issues: Json | null
          nlp_score: number
          obfuscation_detected: boolean | null
          organization_id: string | null
          punycode_detected: boolean | null
          qr_code_detected: boolean | null
          qr_destination_url: string | null
          reason: string
          sandbox_analyzed: boolean | null
          sandbox_report: Json | null
          sender_reputation: number | null
          social_engineering_score: number | null
          spf_pass: boolean | null
          subdomain_depth: number | null
          threat_intel_sources: Json | null
          threat_level: string
          url: string | null
          url_decomposition: Json | null
          url_decomposition_score: number | null
          user_ip: string | null
          verdict: string
          vishing_explanation: string | null
          vishing_score: number | null
          visual_issues: Json | null
          visual_score: number
          writing_style_score: number | null
        }
        Insert: {
          adversarial_issues?: Json | null
          adversarial_score?: number | null
          ai_explanation?: string | null
          asn?: string | null
          attack_type?: string | null
          behavior_issues?: Json | null
          behavior_score?: number | null
          breach_data?: Json | null
          confidence: number
          created_at?: string | null
          credential_harvesting_detected?: boolean | null
          deepfake_detected?: boolean | null
          dkim_pass?: boolean | null
          dmarc_pass?: boolean | null
          dom_manipulation_detected?: boolean | null
          email_authentication_status?: string | null
          email_content?: string | null
          exposure_score?: number | null
          homograph_detected?: boolean | null
          id?: string
          isp?: string | null
          manipulation_tactics?: Json | null
          network_issues?: Json | null
          network_score: number
          nlp_issues?: Json | null
          nlp_score: number
          obfuscation_detected?: boolean | null
          organization_id?: string | null
          punycode_detected?: boolean | null
          qr_code_detected?: boolean | null
          qr_destination_url?: string | null
          reason: string
          sandbox_analyzed?: boolean | null
          sandbox_report?: Json | null
          sender_reputation?: number | null
          social_engineering_score?: number | null
          spf_pass?: boolean | null
          subdomain_depth?: number | null
          threat_intel_sources?: Json | null
          threat_level: string
          url?: string | null
          url_decomposition?: Json | null
          url_decomposition_score?: number | null
          user_ip?: string | null
          verdict: string
          vishing_explanation?: string | null
          vishing_score?: number | null
          visual_issues?: Json | null
          visual_score: number
          writing_style_score?: number | null
        }
        Update: {
          adversarial_issues?: Json | null
          adversarial_score?: number | null
          ai_explanation?: string | null
          asn?: string | null
          attack_type?: string | null
          behavior_issues?: Json | null
          behavior_score?: number | null
          breach_data?: Json | null
          confidence?: number
          created_at?: string | null
          credential_harvesting_detected?: boolean | null
          deepfake_detected?: boolean | null
          dkim_pass?: boolean | null
          dmarc_pass?: boolean | null
          dom_manipulation_detected?: boolean | null
          email_authentication_status?: string | null
          email_content?: string | null
          exposure_score?: number | null
          homograph_detected?: boolean | null
          id?: string
          isp?: string | null
          manipulation_tactics?: Json | null
          network_issues?: Json | null
          network_score?: number
          nlp_issues?: Json | null
          nlp_score?: number
          obfuscation_detected?: boolean | null
          organization_id?: string | null
          punycode_detected?: boolean | null
          qr_code_detected?: boolean | null
          qr_destination_url?: string | null
          reason?: string
          sandbox_analyzed?: boolean | null
          sandbox_report?: Json | null
          sender_reputation?: number | null
          social_engineering_score?: number | null
          spf_pass?: boolean | null
          subdomain_depth?: number | null
          threat_intel_sources?: Json | null
          threat_level?: string
          url?: string | null
          url_decomposition?: Json | null
          url_decomposition_score?: number | null
          user_ip?: string | null
          verdict?: string
          vishing_explanation?: string | null
          vishing_score?: number | null
          visual_issues?: Json | null
          visual_score?: number
          writing_style_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "threats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "soc_analyst"
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
      app_role: ["admin", "user", "soc_analyst"],
    },
  },
} as const
