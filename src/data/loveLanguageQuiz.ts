import type { LoveLanguage } from '@/types';

export interface QuizQuestion {
  id: number;
  question: string;
  optionA: { text: string; language: LoveLanguage };
  optionB: { text: string; language: LoveLanguage };
}

export const loveLanguageQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "When you're feeling down, you'd prefer your partner to...",
    optionA: { text: "Give you a long, comforting hug", language: 'touch' },
    optionB: { text: "Tell you how much they love and appreciate you", language: 'words' },
  },
  {
    id: 2,
    question: "A perfect evening together would be...",
    optionA: { text: "Cuddling on the couch with no distractions", language: 'time' },
    optionB: { text: "Having them take care of dinner and chores", language: 'acts' },
  },
  {
    id: 3,
    question: "You feel most loved when your partner...",
    optionA: { text: "Surprises you with a thoughtful gift", language: 'gifts' },
    optionB: { text: "Writes you a heartfelt love note", language: 'words' },
  },
  {
    id: 4,
    question: "After a long day, you'd appreciate...",
    optionA: { text: "A relaxing massage from your partner", language: 'touch' },
    optionB: { text: "Them handling dinner without being asked", language: 'acts' },
  },
  {
    id: 5,
    question: "On your birthday, you'd most love...",
    optionA: { text: "A whole day of undivided attention", language: 'time' },
    optionB: { text: "A carefully chosen meaningful gift", language: 'gifts' },
  },
  {
    id: 6,
    question: "You feel closest to your partner when...",
    optionA: { text: "They hold your hand in public", language: 'touch' },
    optionB: { text: "They plan a special date just for two", language: 'time' },
  },
  {
    id: 7,
    question: "When your partner is away, you miss...",
    optionA: { text: "Receiving loving text messages", language: 'words' },
    optionB: { text: "Their physical presence and touch", language: 'touch' },
  },
  {
    id: 8,
    question: "A small gesture that melts your heart is...",
    optionA: { text: "Them bringing you coffee in bed", language: 'acts' },
    optionB: { text: "A spontaneous 'just because' gift", language: 'gifts' },
  },
  {
    id: 9,
    question: "You'd feel most appreciated if your partner...",
    optionA: { text: "Publicly compliments you in front of friends", language: 'words' },
    optionB: { text: "Plans a weekend getaway together", language: 'time' },
  },
  {
    id: 10,
    question: "When you accomplish something, you want...",
    optionA: { text: "A celebratory hug and kiss", language: 'touch' },
    optionB: { text: "Them to verbally express how proud they are", language: 'words' },
  },
  {
    id: 11,
    question: "During a movie night, you prefer...",
    optionA: { text: "Snuggling close together", language: 'touch' },
    optionB: { text: "Them putting away their phone for you", language: 'time' },
  },
  {
    id: 12,
    question: "A thoughtful partner would...",
    optionA: { text: "Remember and celebrate small anniversaries with gifts", language: 'gifts' },
    optionB: { text: "Help with tasks without being asked", language: 'acts' },
  },
  {
    id: 13,
    question: "When stressed, you'd love your partner to...",
    optionA: { text: "Listen attentively and be fully present", language: 'time' },
    optionB: { text: "Take over your responsibilities for the day", language: 'acts' },
  },
  {
    id: 14,
    question: "The best surprise would be...",
    optionA: { text: "A love letter expressing their feelings", language: 'words' },
    optionB: { text: "A gift they saw and thought of you", language: 'gifts' },
  },
  {
    id: 15,
    question: "You feel secure in the relationship when...",
    optionA: { text: "They regularly show physical affection", language: 'touch' },
    optionB: { text: "They consistently help with daily tasks", language: 'acts' },
  },
];

export const loveLanguageInfo: Record<LoveLanguage, {
  name: string;
  emoji: string;
  description: string;
  tips: string[];
}> = {
  words: {
    name: 'Words of Affirmation',
    emoji: '💬',
    description: 'You feel most loved when your partner expresses their love through verbal compliments, encouragement, and appreciation.',
    tips: [
      'Leave sweet notes for them to find',
      'Send loving text messages throughout the day',
      'Verbally express appreciation for specific things',
      'Give genuine compliments regularly',
    ],
  },
  acts: {
    name: 'Acts of Service',
    emoji: '🤝',
    description: 'You feel most loved when your partner shows their care through helpful actions and taking care of responsibilities.',
    tips: [
      'Help with chores without being asked',
      'Prepare meals or bring them coffee',
      'Run errands for them when they\'re busy',
      'Take on tasks they dislike doing',
    ],
  },
  gifts: {
    name: 'Receiving Gifts',
    emoji: '🎁',
    description: 'You feel most loved when your partner gives thoughtful gifts that show they were thinking of you.',
    tips: [
      'Bring small "just because" gifts',
      'Remember special occasions with meaningful presents',
      'Pick up items they mentioned wanting',
      'Create handmade gifts with personal meaning',
    ],
  },
  time: {
    name: 'Quality Time',
    emoji: '⏰',
    description: 'You feel most loved when your partner gives you their undivided attention and creates meaningful moments together.',
    tips: [
      'Plan regular date nights',
      'Put away devices when together',
      'Create new experiences and adventures',
      'Have deep, meaningful conversations',
    ],
  },
  touch: {
    name: 'Physical Touch',
    emoji: '🤗',
    description: 'You feel most loved through physical affection like hugs, kisses, holding hands, and other caring touches.',
    tips: [
      'Hold hands when walking together',
      'Give long hugs when greeting and parting',
      'Offer massages after long days',
      'Cuddle while watching movies',
    ],
  },
};
