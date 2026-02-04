export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    display_name: string
                    partner_id: string | null
                    couple_code: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    display_name: string
                    partner_id?: string | null
                    couple_code?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    display_name?: string
                    partner_id?: string | null
                    couple_code?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            love_notes: {
                Row: {
                    id: string
                    content: string
                    author_id: string
                    couple_code: string
                    hearts: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    author_id: string
                    couple_code: string
                    hearts?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    author_id?: string
                    couple_code?: string
                    hearts?: number
                    created_at?: string
                }
                Relationships: []
            }
            memories: {
                Row: {
                    id: string
                    image_url: string
                    caption: string | null
                    couple_code: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    image_url: string
                    caption?: string | null
                    couple_code: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    image_url?: string
                    caption?: string | null
                    couple_code?: string
                    created_at?: string
                }
                Relationships: []
            }
            special_events: {
                Row: {
                    id: string
                    title: string
                    date: string
                    type: 'anniversary' | 'date' | 'milestone' | 'memory'
                    description: string | null
                    emoji: string | null
                    couple_code: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    date: string
                    type: 'anniversary' | 'date' | 'milestone' | 'memory'
                    description?: string | null
                    emoji?: string | null
                    couple_code: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    date?: string
                    type?: 'anniversary' | 'date' | 'milestone' | 'memory'
                    description?: string | null
                    emoji?: string | null
                    couple_code?: string
                    created_at?: string
                }
                Relationships: []
            }
            surprises: {
                Row: {
                    id: string
                    title: string
                    description: string
                    is_revealed: boolean
                    planned_for: string | null
                    created_by: string
                    couple_code: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    is_revealed?: boolean
                    planned_for?: string | null
                    created_by: string
                    couple_code: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    is_revealed?: boolean
                    planned_for?: string | null
                    created_by?: string
                    couple_code?: string
                    created_at?: string
                }
                Relationships: []
            }
            bucket_list_items: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    is_completed: boolean
                    completed_at: string | null
                    emoji: string | null
                    couple_code: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    is_completed?: boolean
                    completed_at?: string | null
                    emoji?: string | null
                    couple_code: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    is_completed?: boolean
                    completed_at?: string | null
                    emoji?: string | null
                    couple_code?: string
                    created_at?: string
                }
                Relationships: []
            }
            love_reasons: {
                Row: {
                    id: string
                    content: string
                    author_id: string
                    couple_code: string
                    hearts: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    author_id: string
                    couple_code: string
                    hearts?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    author_id?: string
                    couple_code?: string
                    hearts?: number
                    created_at?: string
                }
                Relationships: []
            }
            completed_challenges: {
                Row: {
                    id: string
                    challenge_id: string
                    notes: string | null
                    rating: number | null
                    couple_code: string
                    completed_at: string
                }
                Insert: {
                    id?: string
                    challenge_id: string
                    notes?: string | null
                    rating?: number | null
                    couple_code: string
                    completed_at?: string
                }
                Update: {
                    id?: string
                    challenge_id?: string
                    notes?: string | null
                    rating?: number | null
                    couple_code?: string
                    completed_at?: string
                }
                Relationships: []
            }
            check_in_entries: {
                Row: {
                    id: string
                    week_string: string
                    author_id: string
                    couple_code: string
                    connection_rating: number
                    partner_highlight: string
                    unresolved_issues: string
                    gratitude: string
                    next_week_plan: string
                    overall_mood: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    week_string: string
                    author_id: string
                    couple_code: string
                    connection_rating: number
                    partner_highlight: string
                    unresolved_issues: string
                    gratitude: string
                    next_week_plan: string
                    overall_mood: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    week_string?: string
                    author_id?: string
                    couple_code?: string
                    connection_rating?: number
                    partner_highlight?: string
                    unresolved_issues?: string
                    gratitude?: string
                    next_week_plan?: string
                    overall_mood?: number
                    created_at?: string
                }
                Relationships: []
            }
            love_language_results: {
                Row: {
                    id: string
                    user_id: string
                    couple_code: string
                    scores: Json
                    primary_language: string
                    completed_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    couple_code: string
                    scores: Json
                    primary_language: string
                    completed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    couple_code?: string
                    scores?: Json
                    primary_language?: string
                    completed_at?: string
                }
                Relationships: []
            }
            worry_entries: {
                Row: {
                    id: string
                    worry: string
                    reframe: string
                    author_id: string
                    couple_code: string
                    is_resolved: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    worry: string
                    reframe: string
                    author_id: string
                    couple_code: string
                    is_resolved?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    worry?: string
                    reframe?: string
                    author_id?: string
                    couple_code?: string
                    is_resolved?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            reassurance_cards: {
                Row: {
                    id: string
                    message: string
                    author_id: string
                    couple_code: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    message: string
                    author_id: string
                    couple_code: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    message?: string
                    author_id?: string
                    couple_code?: string
                    created_at?: string
                }
                Relationships: []
            }
            calm_sessions: {
                Row: {
                    id: string
                    type: 'breathing' | 'grounding' | 'affirmation'
                    duration_seconds: number
                    completed_together: boolean
                    couple_code: string
                    completed_at: string
                }
                Insert: {
                    id?: string
                    type: 'breathing' | 'grounding' | 'affirmation'
                    duration_seconds: number
                    completed_together?: boolean
                    couple_code: string
                    completed_at?: string
                }
                Update: {
                    id?: string
                    type?: 'breathing' | 'grounding' | 'affirmation'
                    duration_seconds?: number
                    completed_together?: boolean
                    couple_code?: string
                    completed_at?: string
                }
                Relationships: []
            }
            chat_messages: {
                Row: {
                    id: string
                    content: string
                    sender_id: string
                    couple_code: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    sender_id: string
                    couple_code: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    sender_id?: string
                    couple_code?: string
                    is_read?: boolean
                    created_at?: string
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
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
