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

export interface Memory {
  id: string;
  imageUrl: string;
  caption?: string;
  date: Date;
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
  challengeId: string;
  completedAt: Date;
  notes?: string;
  rating?: number;
}

export interface ChallengeStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedWeek: string; // ISO week string like "2025-W05"
}
