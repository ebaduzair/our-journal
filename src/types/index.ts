export interface LoveNote {
  id: string;
  content: string;
  author: 'me' | 'partner';
  createdAt: Date;
  hearts: number;
}

export interface SpecialEvent {
  id: string;
  title: string;
  date: Date;
  type: 'anniversary' | 'date' | 'milestone' | 'memory';
  description?: string;
  emoji?: string;
}

export interface Surprise {
  id: string;
  title: string;
  description: string;
  isRevealed: boolean;
  plannedFor?: Date;
  createdBy: 'me' | 'partner';
}



export interface BucketListItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  emoji?: string;
}

export interface LoveReason {
  id: string;
  content: string;
  author: 'me' | 'partner';
  createdAt: Date;
  hearts: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'communication' | 'adventure' | 'romance' | 'fun';
  emoji: string;
}

export interface CompletedChallenge {
  id: string;
  challengeId: string;
  completedAt: Date;
  notes?: string;
  rating?: number;
}

export interface ChallengeStreak {
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedWeek: string; // ISO week string like "2025-W05"
}

// Weekly Check-ins
export interface CheckInEntry {
  id: string;
  weekString: string; // ISO week like "2025-W05"
  week_string?: string; // DB column name
  createdAt: Date;
  responses: {
    connectionRating: number; // 1-5
    partnerHighlight: string;
    unresolvedIssues: string;
    gratitude: string;
    nextWeekPlan: string;
  };
  overallMood: number; // 1-5
}

// Gratitude Entries
export interface GratitudeEntry {
  id: string;
  content: string;
  mood: string; // emoji
  createdAt: Date;
  author: 'me' | 'partner';
}

// Love Language Quiz
export type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch';

export interface LoveLanguageResult {
  id: string;
  person: 'me' | 'partner';
  user_id?: string; // DB column name
  scores: Record<LoveLanguage, number>;
  primaryLanguage: LoveLanguage;
  completedAt: Date;
}

// Mindful Moments - Overthinking Support
export interface WorryEntry {
  id: string;
  worry: string;
  reframe: string;
  createdAt: Date;
  author: 'me' | 'partner';
  isResolved: boolean;
}

export interface ReassuranceCard {
  id: string;
  message: string;
  author: 'me' | 'partner';
  createdAt: Date;
}

export interface RealityCheckAnswer {
  id: string;
  worry: string;
  answers: {
    evidence: string;
    likelihood: number; // 1-5
    worstCase: string;
    copingPlan: string;
  };
  createdAt: Date;
  author: 'me' | 'partner';
}

export interface CalmSession {
  id: string;
  type: 'breathing' | 'grounding' | 'affirmation';
  completedAt: Date;
  durationSeconds: number;
  completedTogether: boolean;
}

// Safe Space - Emotional Support
export type SafeSpaceMode = 'just_listen' | 'need_support' | 'private';
export type FeelingCategory = 'hurt' | 'stressed' | 'anxious' | 'sad' | 'frustrated' | 'other';

export interface SafeSpaceEntry {
  id: string;
  content: string;
  mode: SafeSpaceMode;
  category?: FeelingCategory;
  author: 'me' | 'partner';
  reactions: string[];
  isResolved: boolean;
  createdAt: Date;
}

export interface EmergencyProtocol {
  id: string;
  author: 'me' | 'partner';
  emotion: string;
  triggerDescription?: string;
  whatINeed: string;
  whatNotToDo?: string;
  createdAt: Date;
}

// Habit Tracker
export interface Habit {
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  created_by: string;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD
  created_at: string;
}
