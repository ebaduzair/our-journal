import { motion } from 'framer-motion';
import { Heart, Calendar, Gift, Sparkles, BarChart3, MessageCircleHeart, ClipboardCheck, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingHearts } from '@/components/HeartAnimation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  const [notes] = useLocalStorage<LoveNote[]>('love-notes', []);
  const [reasons] = useLocalStorage<LoveReason[]>('love-reasons', []);
  const [checkIns] = useLocalStorage<CheckInEntry[]>('check-ins', []);
  const [loveLanguageResults] = useLocalStorage<LoveLanguageResult[]>('love-language-results', []);
  const [events] = useLocalStorage<SpecialEvent[]>('special-events', [
    {
      id: '1',
      title: 'Our Anniversary',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 14),
      type: 'anniversary',
      emoji: '💍',
    },
  ]);

  const randomPrompt = lovePrompts[Math.floor(Math.random() * lovePrompts.length)];
  const randomReason = reasons.length > 0 ? reasons[Math.floor(Math.random() * reasons.length)] : null;
  
  const upcomingEvent = events
    .filter(e => differenceInDays(new Date(e.date), new Date()) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Check if weekly check-in is needed
  const currentWeek = `${getYear(new Date())}-W${String(getISOWeek(new Date())).padStart(2, '0')}`;
  const needsCheckIn = !checkIns.some(c => c.weekString === currentWeek);

  // Get love language results
  const myLanguage = loveLanguageResults.find(r => r.person === 'me');
  const partnerLanguage = loveLanguageResults.find(r => r.person === 'partner');

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
    <div className="min-h-screen bg-background pb-20 relative">
      <FloatingHearts />
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-12 pb-8 px-4 text-center"
      >
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

      {/* Daily Prompt Card */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 space-y-4"
      >
        <motion.div variants={item}>
          <Link to="/love-notes">
            <div className="p-5 rounded-2xl bg-card shadow-card border border-rose-light/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 gradient-romantic opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Today's Love Prompt
                </span>
              </div>
              
              <p className="font-romantic text-xl text-foreground leading-relaxed">
                "{randomPrompt}"
              </p>
              
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                <span>Write a love note</span>
                <Heart className="w-4 h-4 ml-2 group-hover:animate-heart-beat" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Today's Love Reminder */}
        {randomReason && (
          <motion.div variants={item}>
            <Link to="/reasons">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-light to-gold-light shadow-card border border-rose-light/50 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💝</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Today's Love Reminder
                  </span>
                </div>
                <p className="font-romantic text-base text-foreground leading-relaxed">
                  "{randomReason.content}"
                </p>
                <div className="mt-2 flex items-center text-primary text-xs font-medium">
                  <span>See all {reasons.length} reasons</span>
                  <Heart className="w-3 h-3 ml-1 group-hover:animate-heart-beat" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <Link to="/love-notes" className="block">
            <div className="p-3 rounded-2xl bg-rose-light text-center group hover:shadow-soft transition-shadow">
              <Heart className="w-5 h-5 mx-auto mb-1 text-primary group-hover:animate-heart-beat" />
              <span className="text-xl font-bold text-foreground">{notes.length}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Notes</p>
            </div>
          </Link>
          
          <Link to="/reasons" className="block">
            <div className="p-3 rounded-2xl bg-coral/10 text-center group hover:shadow-soft transition-shadow">
              <span className="text-lg block mb-1">💝</span>
              <span className="text-xl font-bold text-foreground">{reasons.length}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Reasons</p>
            </div>
          </Link>
          
          <Link to="/events" className="block">
            <div className="p-3 rounded-2xl bg-gold-light text-center group hover:shadow-soft transition-shadow">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-gold" />
              <span className="text-xl font-bold text-foreground">{events.length}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Events</p>
            </div>
          </Link>
        </motion.div>

        {/* Upcoming Event */}
        {upcomingEvent && (
          <motion.div variants={item}>
            <Link to="/events">
              <div className="p-4 rounded-2xl gradient-romantic text-primary-foreground shadow-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
                      Coming Up
                    </p>
                    <h3 className="font-romantic text-xl font-semibold">
                      {upcomingEvent.emoji} {upcomingEvent.title}
                    </h3>
                    <p className="text-sm opacity-90 mt-1">
                      {format(new Date(upcomingEvent.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold">
                      {differenceInDays(new Date(upcomingEvent.date), new Date())}
                    </span>
                    <p className="text-xs uppercase">days</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Weekly Check-in Reminder */}
        {needsCheckIn && (
          <motion.div variants={item}>
            <Link to="/check-ins">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-coral/10 border border-primary/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">Weekly Check-in Due</h4>
                  <p className="text-xs text-muted-foreground">Take 2 minutes to reflect together</p>
                </div>
                <Heart className="w-4 h-4 text-primary" />
              </div>
            </Link>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={item}>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/surprises">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-card shadow-card flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Surprises</h4>
                  <p className="text-xs text-muted-foreground">Plan something sweet</p>
                </div>
              </motion.div>
            </Link>
            
            <Link to="/stats">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-card shadow-card flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Stats</h4>
                  <p className="text-xs text-muted-foreground">Your love journey</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Discover Section */}
        <motion.div variants={item}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Discover</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/love-quiz">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-card shadow-card flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <MessageCircleHeart className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Love Quiz</h4>
                  <p className="text-xs text-muted-foreground">Discover languages</p>
                </div>
              </motion.div>
            </Link>
            
            <Link to="/check-ins">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-card shadow-card flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Check-ins</h4>
                  <p className="text-xs text-muted-foreground">Weekly reflection</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Mindful Moments Card */}
        <motion.div variants={item}>
          <Link to="/mindful">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/20 border border-primary/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Mindful Moments</h4>
                <p className="text-xs text-muted-foreground">Calm overthinking together 🧘</p>
              </div>
              <Heart className="w-4 h-4 text-primary" />
            </div>
          </Link>
        </motion.div>

        {/* Love Language Compatibility */}
        {(myLanguage || partnerLanguage) && (
          <motion.div variants={item}>
            <Link to="/love-quiz">
              <div className="p-4 rounded-2xl bg-card shadow-card border border-gold/30">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircleHeart className="w-4 h-4 text-gold" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Love Languages
                  </span>
                </div>
                <div className="flex justify-around">
                  {myLanguage && (
                    <div className="text-center">
                      <span className="text-2xl block">{loveLanguageInfo[myLanguage.primaryLanguage].emoji}</span>
                      <p className="text-xs text-muted-foreground mt-1">Me</p>
                    </div>
                  )}
                  {myLanguage && partnerLanguage && (
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  {partnerLanguage && (
                    <div className="text-center">
                      <span className="text-2xl block">{loveLanguageInfo[partnerLanguage.primaryLanguage].emoji}</span>
                      <p className="text-xs text-muted-foreground mt-1">Partner</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
