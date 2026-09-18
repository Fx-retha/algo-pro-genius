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
      bot_configs: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_run_at: string | null
          max_open_trades: number
          min_confidence: number
          mt_account_id: string | null
          symbols: string[]
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          max_open_trades?: number
          min_confidence?: number
          mt_account_id?: string | null
          symbols?: string[]
          updated_at?: string
          user_id: string
          volume?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          max_open_trades?: number
          min_confidence?: number
          mt_account_id?: string | null
          symbols?: string[]
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "bot_configs_mt_account_id_fkey"
            columns: ["mt_account_id"]
            isOneToOne: false
            referencedRelation: "mt_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_connections: {
        Row: {
          account_login: string | null
          balance: number | null
          created_at: string
          equity: number | null
          id: string
          label: string
          last_error: string | null
          last_seen_at: string | null
          platform: string
          status: string
          token_hash: string
          token_prefix: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_login?: string | null
          balance?: number | null
          created_at?: string
          equity?: number | null
          id?: string
          label?: string
          last_error?: string | null
          last_seen_at?: string | null
          platform?: string
          status?: string
          token_hash: string
          token_prefix: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_login?: string | null
          balance?: number | null
          created_at?: string
          equity?: number | null
          id?: string
          label?: string
          last_error?: string | null
          last_seen_at?: string | null
          platform?: string
          status?: string
          token_hash?: string
          token_prefix?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      economic_events: {
        Row: {
          actual: string | null
          country: string | null
          currency: string | null
          event_time: string
          external_id: string
          fetched_at: string
          forecast: string | null
          id: string
          impact: string
          previous: string | null
          source: string
          title: string
        }
        Insert: {
          actual?: string | null
          country?: string | null
          currency?: string | null
          event_time: string
          external_id: string
          fetched_at?: string
          forecast?: string | null
          id?: string
          impact?: string
          previous?: string | null
          source?: string
          title: string
        }
        Update: {
          actual?: string | null
          country?: string | null
          currency?: string | null
          event_time?: string
          external_id?: string
          fetched_at?: string
          forecast?: string | null
          id?: string
          impact?: string
          previous?: string | null
          source?: string
          title?: string
        }
        Relationships: []
      }
      license_keys: {
        Row: {
          activated_at: string | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          key: string
          plan: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          key: string
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          key?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mentor_applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone_number: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mt_accounts: {
        Row: {
          broker: string | null
          connection_status: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          last_error: string | null
          last_synced_at: string | null
          login: string | null
          meta_account_id: string
          platform: string
          robot_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broker?: string | null
          connection_status?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          last_error?: string | null
          last_synced_at?: string | null
          login?: string | null
          meta_account_id: string
          platform?: string
          robot_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broker?: string | null
          connection_status?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          last_error?: string | null
          last_synced_at?: string | null
          login?: string | null
          meta_account_id?: string
          platform?: string
          robot_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_accounts: {
        Row: {
          balance: number
          created_at: string
          currency: string
          equity: number
          id: string
          is_active: boolean
          label: string
          leverage: number
          max_open_trades: number
          max_volume: number
          starting_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          equity?: number
          id?: string
          is_active?: boolean
          label?: string
          leverage?: number
          max_open_trades?: number
          max_volume?: number
          starting_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          equity?: number
          id?: string
          is_active?: boolean
          label?: string
          leverage?: number
          max_open_trades?: number
          max_volume?: number
          starting_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_positions: {
        Row: {
          account_id: string
          bridge_status: string | null
          close_price: number | null
          closed_at: string | null
          created_at: string
          execution_mode: string
          id: string
          note: string | null
          open_price: number
          opened_at: string
          profit: number
          side: string
          signal_id: string | null
          source: string
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          account_id: string
          bridge_status?: string | null
          close_price?: number | null
          closed_at?: string | null
          created_at?: string
          execution_mode?: string
          id?: string
          note?: string | null
          open_price: number
          opened_at?: string
          profit?: number
          side: string
          signal_id?: string | null
          source?: string
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
          volume: number
        }
        Update: {
          account_id?: string
          bridge_status?: string | null
          close_price?: number | null
          closed_at?: string | null
          created_at?: string
          execution_mode?: string
          id?: string
          note?: string | null
          open_price?: number
          opened_at?: string
          profit?: number
          side?: string
          signal_id?: string | null
          source?: string
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "paper_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_positions_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mentor_id: string | null
          phone_number: string | null
          subscription_plan: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mentor_id?: string | null
          phone_number?: string | null
          subscription_plan?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mentor_id?: string | null
          phone_number?: string | null
          subscription_plan?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          confidence: number
          created_at: string
          direction: string
          entry: string | null
          id: string
          live_price: number | null
          rejected_reason: string | null
          stop_loss: string | null
          summary: string | null
          symbol: string
          take_profit: string | null
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          direction?: string
          entry?: string | null
          id?: string
          live_price?: number | null
          rejected_reason?: string | null
          stop_loss?: string | null
          summary?: string | null
          symbol: string
          take_profit?: string | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          direction?: string
          entry?: string | null
          id?: string
          live_price?: number | null
          rejected_reason?: string | null
          stop_loss?: string | null
          summary?: string | null
          symbol?: string
          take_profit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          auto_executed: boolean
          confidence: number
          created_at: string
          direction: string
          entry: string | null
          id: string
          source: string
          stop_loss: string | null
          summary: string | null
          symbol: string
          take_profit: string | null
          user_id: string
        }
        Insert: {
          auto_executed?: boolean
          confidence?: number
          created_at?: string
          direction: string
          entry?: string | null
          id?: string
          source?: string
          stop_loss?: string | null
          summary?: string | null
          symbol: string
          take_profit?: string | null
          user_id: string
        }
        Update: {
          auto_executed?: boolean
          confidence?: number
          created_at?: string
          direction?: string
          entry?: string | null
          id?: string
          source?: string
          stop_loss?: string | null
          summary?: string | null
          symbol?: string
          take_profit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          closed_at: string | null
          created_at: string
          entry_price: number | null
          error_message: string | null
          id: string
          meta_order_id: string | null
          meta_position_id: string | null
          mt_account_id: string | null
          opened_at: string | null
          profit: number | null
          side: string
          signal_id: string | null
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          entry_price?: number | null
          error_message?: string | null
          id?: string
          meta_order_id?: string | null
          meta_position_id?: string | null
          mt_account_id?: string | null
          opened_at?: string | null
          profit?: number | null
          side: string
          signal_id?: string | null
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
          volume: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          entry_price?: number | null
          error_message?: string | null
          id?: string
          meta_order_id?: string | null
          meta_position_id?: string | null
          mt_account_id?: string | null
          opened_at?: string | null
          profit?: number | null
          side?: string
          signal_id?: string | null
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "trades_mt_account_id_fkey"
            columns: ["mt_account_id"]
            isOneToOne: false
            referencedRelation: "mt_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      activate_license_key: { Args: { license_key: string }; Returns: Json }
      generate_license_key: { Args: never; Returns: string }
      generate_mentor_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_license_key: { Args: { license_key: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
