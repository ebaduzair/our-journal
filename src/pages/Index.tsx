import { motion } from 'framer-motion';
import { Heart, Calendar, Gift, Sparkles, BarChart3, ClipboardCheck, Brain, Trophy, Settings, Utensils, MessageCircleHeart, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingHearts } from '@/components/HeartAnimation';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import type { LoveNote, SpecialEvent, LoveReason, CheckInEntry, LoveLanguageResult } from '@/types';
import { differenceInDays, format, getISOWeek, getYear } from 'date-fns';
import { loveLanguageInfo } from '@/data/loveLanguageQuiz';

const lovePrompts = [
  "What made you smile about them today?",
  "What's your favorite memory together?",
  "What do you admire most about them?",
  "What small thing do they do that you love?",
  "When did you last feel truly grateful for them?",
  "What's one thing you want them to know today?",
];

const Index = () => {
  const { user } = useAuth();

  // Fetch real data from Supabase
  const { data: notes } = useSupabaseData<LoveNote>({ table: 'love_notes' });
  const { data: reasons } = useSupabaseData<LoveReason>({ table: 'love_reasons' });
  const { data: events } = useSupabaseData<SpecialEvent>({
    table: 'special_events',
    orderBy: { column: 'date', ascending: true }
  });
  const { data: checkIns } = useSupabaseData<CheckInEntry>({ table: 'check_in_entries' });
  const { data: loveLanguageResults } = useSupabaseData<LoveLanguageResult>({ table: 'love_language_results' });

  // Use the day of the year to pick a consistent prompt for the day
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const promptIndex = dayOfYear % lovePrompts.length;
  const randomPrompt = lovePrompts[promptIndex];

  // Also pick a consistent reason if available
  const reasonIndex = reasons.length > 0 ? dayOfYear % reasons.length : 0;
  const randomReason = reasons.length > 0 ? reasons[reasonIndex] : null;

  // Filter for upcoming events
  const upcomingEvent = events
    .filter(e => differenceInDays(new Date(e.date), new Date()) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Check if weekly check-in is needed
  const currentWeek = `${getYear(new Date())}-W${String(getISOWeek(new Date())).padStart(2, '0')}`;
  const needsCheckIn = !checkIns.some(c => c.week_string === currentWeek);

  // Get love language results
  const myLanguage = loveLanguageResults.find(r => r.user_id === user?.id);
  const partnerLanguage = loveLanguageResults.find(r => r.user_id !== user?.id);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <FloatingHearts />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-12 pb-8 px-4 text-center"
      >
        <Link to="/settings" className="absolute top-4 right-4">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center border border-border/50"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </Link>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-romantic shadow-glow mb-4"
        >
          <Heart className="w-10 h-10 text-primary-foreground fill-current" />
        </motion.div>

        <h1 className="font-romantic text-4xl font-semibold text-gradient mb-2">
          Our Love Story
        </h1>
        <p className="text-muted-foreground text-sm">
          A place for just us 💕
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 space-y-5"
      >
        {/* Daily Prompt Card */}
        <motion.div variants={item}>
          <Link to="/love-notes">
            <div className="p-6 rounded-3xl bg-card shadow-card border border-rose-light/30 relative overflow-hidden group hover:shadow-glow transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 gradient-romantic opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Today's Question
                </span>
              </div>

              <p className="font-romantic text-2xl text-foreground leading-relaxed mb-4">
                "{randomPrompt}"
              </p>

              <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                <span>Write a love note</span>
                <Heart className="w-4 h-4 ml-1 fill-current" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <Link to="/love-notes" className="block">
            <div className="p-4 rounded-2xl bg-rose-50 text-center hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-rose-500 block">{notes.length}</span>
              <p className="text-[10px] font-medium text-rose-400 uppercase tracking-wide">Notes</p>
            </div>
          </Link>
          <Link to="/reasons" className="block">
            <div className="p-4 rounded-2xl bg-orange-50 text-center hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-orange-500 block">{reasons.length}</span>
              <p className="text-[10px] font-medium text-orange-400 uppercase tracking-wide">Reasons</p>
            </div>
          </Link>
          <Link to="/events" className="block">
            <div className="p-4 rounded-2xl bg-purple-50 text-center hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-purple-500 block">{events.length}</span>
              <p className="text-[10px] font-medium text-purple-400 uppercase tracking-wide">Events</p>
            </div>
          </Link>
        </motion.div>

        {/* Action Grid - Simplified & Cleaner */}
        <motion.div variants={item}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/food-log">
              <div className="p-4 rounded-2xl bg-card shadow-sm border border-border/50 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Food Log</h4>
                  <p className="text-[10px] text-muted-foreground">Track meals</p>
                </div>
              </div>
            </Link>

            <Link to="/surprises">
              <div className="p-4 rounded-2xl bg-card shadow-sm border border-border/50 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Surprises</h4>
                  <p className="text-[10px] text-muted-foreground">Plan gifts</p>
                </div>
              </div>
            </Link>

            <Link to="/challenges">
              <div className="p-4 rounded-2xl bg-card shadow-sm border border-border/50 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Challenges</h4>
                  <p className="text-[10px] text-muted-foreground">Fun tasks</p>
                </div>
              </div>
            </Link>

            <Link to="/stats">
              <div className="p-4 rounded-2xl bg-card shadow-sm border border-border/50 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Stats</h4>
                  <p className="text-[10px] text-muted-foreground">Insights</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Dynamic Content Cards */}
        {upcomingEvent && (
          <motion.div variants={item}>
            <Link to="/events">
              <div className="p-5 rounded-2xl gradient-romantic text-primary-foreground shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80 mb-1 font-semibold">Coming Up Soon</p>
                  <h3 className="font-romantic text-2xl font-medium flex items-center gap-2">
                    <span>{upcomingEvent.emoji}</span> {upcomingEvent.title}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {format(new Date(upcomingEvent.date), 'MMMM d')}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <span className="text-2xl font-bold block">
                    {differenceInDays(new Date(upcomingEvent.date), new Date())}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Days</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Reason of the Day or Add Reason CTA */}
        {reasons.length > 0 && randomReason ? (
          <motion.div variants={item}>
            <Link to="/reasons">
              <div className="p-5 rounded-2xl bg-card border-l-4 border-l-rose-400 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-rose-500">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold uppercase tracking-wide">Remember this?</span>
                </div>
                <p className="text-foreground italic">"{randomReason.content}"</p>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Link to="/reasons">
              <div className="p-5 rounded-2xl bg-card border border-dashed border-rose-300 flex items-center justify-center gap-3 group hover:border-rose-400 transition-colors">
                <Heart className="w-5 h-5 text-rose-300 group-hover:text-rose-400" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-rose-500">
                  Add your first reason why you love them...
                </span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Check-ins & Mindfulness */}
        <motion.div variants={item} className="grid grid-cols-1 gap-3">
          {needsCheckIn && (
            <Link to="/check-ins">
              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Weekly Check-in</h4>
                  <p className="text-xs text-muted-foreground">Time to reflect together</p>
                </div>
              </div>
            </Link>
          )}

          <Link to="/mindful">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Mindful Moments</h4>
                <p className="text-xs text-muted-foreground">Take a deep breath</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Love Languages Section */}
        <motion.div variants={item} className="pb-4">
          <Link to="/love-quiz">
            <div className="p-5 rounded-2xl bg-card shadow-sm border border-border/50 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/50 to-rose-400/50" />

              <h4 className="text-sm font-medium text-muted-foreground mb-4">Our Love Languages</h4>

              {(myLanguage || partnerLanguage) ? (
                <div className="flex justify-center items-center gap-8">
                  <div className="flex flex-col items-center">
                    {myLanguage ? (
                      <>
                        <span className="text-3xl mb-1">{loveLanguageInfo[myLanguage.primaryLanguage]?.emoji}</span>
                        <span className="text-xs font-medium text-foreground">Me</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Take quiz</span>
                    )}
                  </div>

                  <div className="w-px h-8 bg-border" />

                  <div className="flex flex-col items-center">
                    {partnerLanguage ? (
                      <>
                        <span className="text-3xl mb-1">{loveLanguageInfo[partnerLanguage.primaryLanguage]?.emoji}</span>
                        <span className="text-xs font-medium text-foreground">Partner</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Waiting...</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-1">
                    <MessageCircleHeart className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Discover your love styles</p>
                  <span className="text-xs text-primary font-medium">Take the Quiz &rarr;</span>
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
