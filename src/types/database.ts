export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      academies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          city: string | null;
          state: string | null;
          address: string | null;
          phone: string | null;
          website: string | null;
          league_name: string | null;
          league_calendar_url: string | null;
          owner_id: string;
          plan_status: Database["public"]["Enums"]["plan_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          is_certified: boolean;
          primary_color: string;
          is_public: boolean;
          is_discoverable: boolean;
          public_consent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          city?: string | null;
          state?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          league_name?: string | null;
          league_calendar_url?: string | null;
          owner_id: string;
          plan_status?: Database["public"]["Enums"]["plan_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          is_certified?: boolean;
          primary_color?: string;
          is_public?: boolean;
          is_discoverable?: boolean;
          public_consent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          city?: string | null;
          state?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          league_name?: string | null;
          league_calendar_url?: string | null;
          owner_id?: string;
          plan_status?: Database["public"]["Enums"]["plan_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          is_certified?: boolean;
          primary_color?: string;
          is_public?: boolean;
          is_discoverable?: boolean;
          public_consent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          id: string;
          slug: string;
          first_name: string;
          last_name: string;
          birth_date: string;
          position: Database["public"]["Enums"]["player_position"];
          dominant_foot: Database["public"]["Enums"]["dominant_foot"];
          height_cm: number | null;
          weight_kg: number | null;
          jersey_number: number | null;
          photo_url: string | null;
          video_url: string | null;
          academy_id: string;
          passport_score: number;
          qr_code: string | null;
          is_public: boolean;
          is_discoverable: boolean;
          public_consent_at: string | null;
          guardian_name: string | null;
          guardian_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          first_name: string;
          last_name: string;
          birth_date: string;
          position: Database["public"]["Enums"]["player_position"];
          dominant_foot: Database["public"]["Enums"]["dominant_foot"];
          height_cm?: number | null;
          weight_kg?: number | null;
          jersey_number?: number | null;
          photo_url?: string | null;
          video_url?: string | null;
          academy_id: string;
          passport_score?: number;
          qr_code?: string | null;
          is_public?: boolean;
          is_discoverable?: boolean;
          public_consent_at?: string | null;
          guardian_name?: string | null;
          guardian_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string;
          position?: Database["public"]["Enums"]["player_position"];
          dominant_foot?: Database["public"]["Enums"]["dominant_foot"];
          height_cm?: number | null;
          weight_kg?: number | null;
          jersey_number?: number | null;
          photo_url?: string | null;
          video_url?: string | null;
          academy_id?: string;
          passport_score?: number;
          qr_code?: string | null;
          is_public?: boolean;
          is_discoverable?: boolean;
          public_consent_at?: string | null;
          guardian_name?: string | null;
          guardian_email?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
        ];
      };
      seasons: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "seasons_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          season_id: string;
          academy_id: string;
          opponent: string;
          match_date: string;
          result: Database["public"]["Enums"]["match_result"];
          goals_for: number;
          goals_against: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          academy_id: string;
          opponent: string;
          match_date: string;
          result: Database["public"]["Enums"]["match_result"];
          goals_for: number;
          goals_against: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          academy_id?: string;
          opponent?: string;
          match_date?: string;
          result?: Database["public"]["Enums"]["match_result"];
          goals_for?: number;
          goals_against?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
        ];
      };
      match_stats: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          goals: number;
          assists: number;
          minutes_played: number;
          yellow_cards: number;
          red_cards: number;
          captured_by: Database["public"]["Enums"]["captured_by"];
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          goals?: number;
          assists?: number;
          minutes_played?: number;
          yellow_cards?: number;
          red_cards?: number;
          captured_by: Database["public"]["Enums"]["captured_by"];
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          goals?: number;
          assists?: number;
          minutes_played?: number;
          yellow_cards?: number;
          red_cards?: number;
          captured_by?: Database["public"]["Enums"]["captured_by"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_stats_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      player_season_stats: {
        Row: {
          id: string;
          player_id: string;
          season_id: string;
          total_matches: number;
          total_goals: number;
          total_assists: number;
          total_minutes: number;
          total_yellow_cards: number;
          total_red_cards: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          season_id: string;
          total_matches?: number;
          total_goals?: number;
          total_assists?: number;
          total_minutes?: number;
          total_yellow_cards?: number;
          total_red_cards?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          season_id?: string;
          total_matches?: number;
          total_goals?: number;
          total_assists?: number;
          total_minutes?: number;
          total_yellow_cards?: number;
          total_red_cards?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_season_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_season_stats_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
      };
      email_logs: {
        Row: {
          id: string;
          academy_id: string;
          player_id: string;
          recipient_email: string;
          subject: string;
          status: Database["public"]["Enums"]["email_status"];
          sent_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          player_id: string;
          recipient_email: string;
          subject: string;
          status: Database["public"]["Enums"]["email_status"];
          sent_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          player_id?: string;
          recipient_email?: string;
          subject?: string;
          status?: Database["public"]["Enums"]["email_status"];
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_logs_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_logs_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "academy_admin" | "scout" | "admin";
      plan_status: "inactive" | "starter" | "pro" | "elite";
      player_position: "goalkeeper" | "defender" | "midfielder" | "forward";
      dominant_foot: "left" | "right" | "both";
      match_result: "win" | "draw" | "loss";
      captured_by: "coach" | "admin";
      email_status: "sent" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type UserRole = Database["public"]["Enums"]["user_role"];
export type PlanStatus = Database["public"]["Enums"]["plan_status"];
export type PlayerPosition = Database["public"]["Enums"]["player_position"];
export type DominantFoot = Database["public"]["Enums"]["dominant_foot"];
export type MatchResult = Database["public"]["Enums"]["match_result"];
export type CapturedBy = Database["public"]["Enums"]["captured_by"];
export type EmailStatus = Database["public"]["Enums"]["email_status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Academy = Database["public"]["Tables"]["academies"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Season = Database["public"]["Tables"]["seasons"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type MatchStat = Database["public"]["Tables"]["match_stats"]["Row"];
export type PlayerSeasonStat =
  Database["public"]["Tables"]["player_season_stats"]["Row"];
export type EmailLog = Database["public"]["Tables"]["email_logs"]["Row"];
