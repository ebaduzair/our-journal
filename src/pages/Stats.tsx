import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Flame, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import type { LoveNote, LoveReason, SpecialEvent, CompletedChallenge, ChallengeStreak, CheckInEntry, GratitudeEntry, LoveLanguageResult } from '@/types';
import { differenceInDays, format, subMonths, startOfMonth, endOfMonth, isWithinInterval, getISOWeek, getYear } from 'date-fns';
import { loveLanguageInfo } from '@/data/loveLanguageQuiz';

const Stats = () => {
  const [notes] = useLocalStorage<LoveNote[]>('love-notes', []);
  const [reasons] = useLocalStorage<LoveReason[]>('love-reasons', []);
  const [events] = useLocalStorage<SpecialEvent[]>('special-events', []);
  const [completedChallenges] = useLocalStorage<CompletedChallenge[]>('completed-challenges', []);
  const [streak] = useLocalStorage<ChallengeStreak>('challenge-streak', { currentStreak: 0, longestStreak: 0, lastCompletedWeek: '' });
  const [checkIns] = useLocalStorage<CheckInEntry[]>('check-ins', []);
  const [gratitudeEntries] = useLocalStorage<GratitudeEntry[]>('gratitude-entries', []);
  const [loveLanguageResults] = useLocalStorage<LoveLanguageResult[]>('love-language-results', []);

  // Calculate days together from first event or default
  const firstEvent = events.length > 0 
    ? events.reduce((earliest, e) => new Date(e.date) < new Date(earliest.date) ? e : earliest)
    : null;
  const daysTogether = firstEvent 
    ? Math.abs(differenceInDays(new Date(), new Date(firstEvent.date)))
    : 0;

  // Calculate total hearts
  const totalHearts = notes.reduce((sum, n) => sum + n.hearts, 0) + 
                      reasons.reduce((sum, r) => sum + r.hearts, 0);

  // Calculate monthly activity data (last 6 months)
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const notesCount = notes.filter(n => 
        isWithinInterval(new Date(n.createdAt), { start, end })
      ).length;
      
      const reasonsCount = reasons.filter(r => 
        isWithinInterval(new Date(r.createdAt), { start, end })
      ).length;
      
      const challengesCount = completedChallenges.filter(c => 
        isWithinInterval(new Date(c.completedAt), { start, end })
      ).length;

      months.push({
        month: format(monthDate, 'MMM'),
        notes: notesCount,
        reasons: reasonsCount,
        challenges: challengesCount,
      });
    }
    return months;
  };

  const monthlyData = getMonthlyData();

  // Calculate relationship score (gamified)
  const calculateRelationshipScore = () => {
    let score = 0;
    
    // Points for notes (max 20)
    score += Math.min(notes.length * 2, 20);
    
    // Points for reasons (max 20)
    score += Math.min(reasons.length * 2, 20);
    
    // Points for challenge streak (max 20)
    score += Math.min(streak.currentStreak * 5, 20);
    
    // Points for check-ins (max 20)
    const currentWeek = `${getYear(new Date())}-W${String(getISOWeek(new Date())).padStart(2, '0')}`;
    const recentCheckIns = checkIns.filter(c => {
      const weekNum = parseInt(c.weekString.split('-W')[1]);
      const currentWeekNum = parseInt(currentWeek.split('-W')[1]);
      return currentWeekNum - weekNum <= 4;
    }).length;
    score += Math.min(recentCheckIns * 5, 20);
    
    // Points for gratitude entries (max 20)
    score += Math.min(gratitudeEntries.length, 20);
    
    return Math.min(score, 100);
  };

  const relationshipScore = calculateRelationshipScore();

  // Get love language compatibility
  const myLanguage = loveLanguageResults.find(r => r.person === 'me');
  const partnerLanguage = loveLanguageResults.find(r => r.person === 'partner');

  // Calculate average challenge rating
  const avgRating = completedChallenges.length > 0
    ? (completedChallenges.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / 
       completedChallenges.filter(c => c.rating).length).toFixed(1)
    : 'N/A';

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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-romantic text-2xl font-semibold text-gradient">Relationship Stats</h1>
            <p className="text-sm text-muted-foreground">Your love by the numbers</p>
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 py-6 space-y-6"
      >
        {/* Hero Stats */}
        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <div className="gradient-romantic p-6 text-primary-foreground">
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-2"
                >
                  <span className="text-4xl font-bold">{relationshipScore}</span>
                </motion.div>
                <p className="text-sm opacity-90">Relationship Score</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold">{daysTogether}</p>
                  <p className="text-xs opacity-80">Days</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{notes.length}</p>
                  <p className="text-xs opacity-80">Notes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{streak.currentStreak}</p>
                  <p className="text-xs opacity-80">Streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalHearts}</p>
                  <p className="text-xs opacity-80">Hearts</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Activity Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="notes" fill="hsl(var(--primary))" name="Notes" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="reasons" fill="hsl(var(--coral))" name="Reasons" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="challenges" fill="hsl(var(--gold))" name="Challenges" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span className="text-muted-foreground">Notes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-coral" />
                  <span className="text-muted-foreground">Reasons</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gold" />
                  <span className="text-muted-foreground">Challenges</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak.longestStreak}</p>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                <span className="text-lg">🙏</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{gratitudeEntries.length}</p>
                <p className="text-xs text-muted-foreground">Gratitude Logs</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{checkIns.length}</p>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Love Language Compatibility */}
        {(myLanguage || partnerLanguage) && (
          <motion.div variants={item}>
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Love Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {myLanguage && (
                    <div className="text-center p-3 rounded-xl bg-primary/5">
                      <span className="text-3xl block mb-1">
                        {loveLanguageInfo[myLanguage.primaryLanguage].emoji}
                      </span>
                      <p className="text-xs text-muted-foreground">Me</p>
                      <p className="text-sm font-medium truncate">
                        {loveLanguageInfo[myLanguage.primaryLanguage].name}
                      </p>
                    </div>
                  )}
                  {partnerLanguage && (
                    <div className="text-center p-3 rounded-xl bg-coral/5">
                      <span className="text-3xl block mb-1">
                        {loveLanguageInfo[partnerLanguage.primaryLanguage].emoji}
                      </span>
                      <p className="text-xs text-muted-foreground">Partner</p>
                      <p className="text-sm font-medium truncate">
                        {loveLanguageInfo[partnerLanguage.primaryLanguage].name}
                      </p>
                    </div>
                  )}
                </div>
                {!myLanguage || !partnerLanguage ? (
                  <Link to="/love-quiz">
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      {!myLanguage && !partnerLanguage 
                        ? 'Take the Quiz' 
                        : `Complete ${!myLanguage ? 'your' : "partner's"} quiz`}
                    </Button>
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Milestones */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length >= 10 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                  <span className="text-xl">💌</span>
                  <div>
                    <p className="text-sm font-medium">Love Letter Writer</p>
                    <p className="text-xs text-muted-foreground">Wrote 10+ love notes</p>
                  </div>
                </div>
              )}
              {reasons.length >= 10 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-coral/5">
                  <span className="text-xl">💝</span>
                  <div>
                    <p className="text-sm font-medium">Reason Giver</p>
                    <p className="text-xs text-muted-foreground">Added 10+ reasons to love</p>
                  </div>
                </div>
              )}
              {streak.longestStreak >= 4 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gold/5">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-sm font-medium">Challenge Champion</p>
                    <p className="text-xs text-muted-foreground">4+ week challenge streak</p>
                  </div>
                </div>
              )}
              {checkIns.length >= 4 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                  <span className="text-xl">🌟</span>
                  <div>
                    <p className="text-sm font-medium">Consistent Communicator</p>
                    <p className="text-xs text-muted-foreground">4+ weekly check-ins completed</p>
                  </div>
                </div>
              )}
              {notes.length < 10 && reasons.length < 10 && streak.longestStreak < 4 && checkIns.length < 4 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keep using the app to unlock milestones! 💕
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Stats;
