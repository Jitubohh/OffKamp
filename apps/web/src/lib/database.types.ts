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
      bookmarks: {
        Row: {
          created_at: string
          property_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          property_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          property_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          avg_rating: number | null
          contact_phone: string | null
          contact_whatsapp: string
          created_at: string
          description: string | null
          distance_note: string | null
          gender_pref: Database["public"]["Enums"]["gender_pref"]
          id: string
          lat: number | null
          lng: number | null
          location: string
          location_accuracy_m: number | null
          location_set_at: string | null
          name: string
          owner_id: string | null
          review_count: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          contact_phone?: string | null
          contact_whatsapp: string
          created_at?: string
          description?: string | null
          distance_note?: string | null
          gender_pref: Database["public"]["Enums"]["gender_pref"]
          id?: string
          lat?: number | null
          lng?: number | null
          location: string
          location_accuracy_m?: number | null
          location_set_at?: string | null
          name: string
          owner_id?: string | null
          review_count?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          contact_phone?: string | null
          contact_whatsapp?: string
          created_at?: string
          description?: string | null
          distance_note?: string | null
          gender_pref?: Database["public"]["Enums"]["gender_pref"]
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string
          location_accuracy_m?: number | null
          location_set_at?: string | null
          name?: string
          owner_id?: string | null
          review_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_facilities: {
        Row: {
          facility: Database["public"]["Enums"]["facility_kind"]
          property_id: string
        }
        Insert: {
          facility: Database["public"]["Enums"]["facility_kind"]
          property_id: string
        }
        Update: {
          facility?: Database["public"]["Enums"]["facility_kind"]
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_facilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_schools: {
        Row: {
          distance_km: number | null
          distance_minutes: number | null
          distance_note: string | null
          property_id: string
          school_id: string
        }
        Insert: {
          distance_km?: number | null
          distance_minutes?: number | null
          distance_note?: string | null
          property_id: string
          school_id: string
        }
        Update: {
          distance_km?: number | null
          distance_minutes?: number | null
          distance_note?: string | null
          property_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_schools_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          property_id: string
          rating: number
          student_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          property_id: string
          rating: number
          student_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          property_id?: string
          rating?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_photos: {
        Row: {
          created_at: string
          id: string
          position: number
          room_type_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          room_type_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          room_type_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_photos_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_type_amenities: {
        Row: {
          amenity: Database["public"]["Enums"]["amenity_kind"]
          extra_semester: number | null
          extra_session: number | null
          extra_tri_semester: number | null
          mode: Database["public"]["Enums"]["amenity_mode"]
          room_type_id: string
        }
        Insert: {
          amenity: Database["public"]["Enums"]["amenity_kind"]
          extra_semester?: number | null
          extra_session?: number | null
          extra_tri_semester?: number | null
          mode?: Database["public"]["Enums"]["amenity_mode"]
          room_type_id: string
        }
        Update: {
          amenity?: Database["public"]["Enums"]["amenity_kind"]
          extra_semester?: number | null
          extra_session?: number | null
          extra_tri_semester?: number | null
          mode?: Database["public"]["Enums"]["amenity_mode"]
          room_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_type_amenities_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          capacity: number
          created_at: string
          id: string
          label: string | null
          price_semester: number | null
          price_session: number | null
          price_tri_semester: number | null
          property_id: string
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          capacity: number
          created_at?: string
          id?: string
          label?: string | null
          price_semester?: number | null
          price_session?: number | null
          price_tri_semester?: number | null
          property_id: string
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          capacity?: number
          created_at?: string
          id?: string
          label?: string | null
          price_semester?: number | null
          price_session?: number | null
          price_tri_semester?: number | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_types_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          has_tri_semester: boolean
          id: string
          lat: number | null
          lng: number | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          has_tri_semester?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          has_tri_semester?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      property_ratings: {
        Row: {
          avg_rating: number | null
          property_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      amenity_kind: "feeding" | "laundry" | "transport"
      amenity_mode: "included" | "optional" | "not_offered"
      availability_status: "available" | "full"
      facility_kind:
        | "wifi"
        | "power_24_7"
        | "generator"
        | "borehole_water"
        | "security"
        | "parking"
        | "gym"
        | "study_room"
        | "kitchen"
        | "common_room"
      gender_pref: "male" | "female" | "mixed"
      user_role: "student" | "lister"
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
      amenity_kind: ["feeding", "laundry", "transport"],
      amenity_mode: ["included", "optional", "not_offered"],
      availability_status: ["available", "full"],
      facility_kind: [
        "wifi",
        "power_24_7",
        "generator",
        "borehole_water",
        "security",
        "parking",
        "gym",
        "study_room",
        "kitchen",
        "common_room",
      ],
      gender_pref: ["male", "female", "mixed"],
      user_role: ["student", "lister"],
    },
  },
} as const
