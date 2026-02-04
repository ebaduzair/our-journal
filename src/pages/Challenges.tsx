import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Check, RefreshCw, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { challengeDatabase, getCategoryColor, getCategoryLabel } from '@/data/challenges';
import { CompletedChallenge, ChallengeStreak, Challenge } from '@/types';
import { format, startOfWeek, getISOWeek, getYear } from 'date-fns';

const getWeekString = (date: Date) => `${getYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;

export default function Challenges() {
  const [completedChallenges, setCompletedChallenges] = useLocalStorage<CompletedChallenge[]>('couple-completed-challenges', []);
  const [streak, setStreak] = useLocalStorage<ChallengeStreak>('couple-challenge-streak', {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedWeek: '',
  });
  const [weeklyChallenge, setWeeklyChallenge] = useLocalStorage<{ challengeId: string; weekString: string } | null>('couple-weekly-challenge', null);

  const [selectedCategory, setSelectedCategory] = useState<Challenge['category'] | 'all'>('all');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionRating, setCompletionRating] = useState(5);
  const [showHistory, setShowHistory] = useState(false);

  const currentWeekString = getWeekString(new Date());

  // Get or generate weekly challenge
  const currentChallenge = useMemo(() => {
    if (weeklyChallenge?.weekString === currentWeekString) {
      return challengeDatabase.find(c => c.id === weeklyChallenge.challengeId);
    }
    // Generate new weekly challenge
    const completedIds = completedChallenges.map(c => c.challengeId);
    const availableChallenges = challengeDatabase.filter(c => !completedIds.includes(c.id));
    const pool = availableChallenges.length > 0 ? availableChallenges : challengeDatabase;
    const randomChallenge = pool[Math.floor(Math.random() * pool.length)];
    setWeeklyChallenge({ challengeId: randomChallenge.id, weekString: currentWeekString });
    return randomChallenge;
  }, [weeklyChallenge, currentWeekString, completedChallenges, setWeeklyChallenge]);

  const isCurrentChallengeCompleted = completedChallenges.some(
    c => c.challengeId === currentChallenge?.id && getWeekString(new Date(c.completedAt)) === currentWeekString
  );

  const filteredChallenges = useMemo(() => {
    if (selectedCategory === 'all') return challengeDatabase;
    return challengeDatabase.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  const completedThisWeek = completedChallenges.filter(
    c => getWeekString(new Date(c.completedAt)) === currentWeekString
  ).length;

  const totalCompleted = completedChallenges.length;

  const handleCompleteChallenge = () => {
    if (!currentChallenge) return;

    const newCompleted: CompletedChallenge = {
      challengeId: currentChallenge.id,
      completedAt: new Date(),
      notes: completionNotes || undefined,
      rating: completionRating,
    };

    setCompletedChallenges([...completedChallenges, newCompleted]);

    // Update streak
    const newStreak = { ...streak };
    if (streak.lastCompletedWeek === currentWeekString) {
      // Already completed this week
    } else {
      const lastWeekNum = streak.lastCompletedWeek ? parseInt(streak.lastCompletedWeek.split('-W')[1]) : 0;
      const currentWeekNum = getISOWeek(new Date());
      const lastYear = streak.lastCompletedWeek ? parseInt(streak.lastCompletedWeek.split('-W')[0]) : 0;
      const currentYear = getYear(new Date());

      if ((currentYear === lastYear && currentWeekNum === lastWeekNum + 1) ||
        (currentYear === lastYear + 1 && lastWeekNum >= 52 && currentWeekNum === 1)) {
        newStreak.currentStreak += 1;
      } else {
        newStreak.currentStreak = 1;
      }
      newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);
      newStreak.lastCompletedWeek = currentWeekString;
    }
    setStreak(newStreak);

    setShowCompleteDialog(false);
    setCompletionNotes('');
    setCompletionRating(5);
  };

  const shuffleChallenge = () => {
    const completedIds = completedChallenges.map(c => c.challengeId);
    const availableChallenges = challengeDatabase.filter(
      c => !completedIds.includes(c.id) && c.id !== currentChallenge?.id
    );
    const pool = availableChallenges.length > 0 ? availableChallenges : challengeDatabase.filter(c => c.id !== currentChallenge?.id);
    if (pool.length === 0) return;
    const randomChallenge = pool[Math.floor(Math.random() * pool.length)];
    setWeeklyChallenge({ challengeId: randomChallenge.id, weekString: currentWeekString });
  };

  const completedHistory = useMemo(() => {
    return completedChallenges
      .map(c => ({
        ...c,
        challenge: challengeDatabase.find(ch => ch.id === c.challengeId),
      }))
      .filter(c => c.challenge)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [completedChallenges]);

  const categories: (Challenge['category'] | 'all')[] = ['all', 'communication', 'adventure', 'romance', 'fun'];

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden">
      <PageHeader
        title="Challenges"
        subtitle="Weekly fun to keep the spark alive"
        emoji="🔥"
      />

      <div className="px-4 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{streak.currentStreak}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Week Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-bold">{streak.longestStreak}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Best Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Check className="w-5 h-5" />
                <span className="text-2xl font-bold">{totalCompleted}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* This Week's Challenge */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            ✨ This Week's Challenge
          </h2>
          {currentChallenge && (
            <motion.div
              key={currentChallenge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`relative overflow-hidden ${isCurrentChallengeCompleted ? 'ring-2 ring-green-500' : ''}`}>
                <div className="absolute inset-0 gradient-romantic opacity-10" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{currentChallenge.emoji}</span>
                    <Badge className={getCategoryColor(currentChallenge.category)}>
                      {getCategoryLabel(currentChallenge.category)}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 break-words">{currentChallenge.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{currentChallenge.description}</p>

                  <div className="flex gap-2">
                    {isCurrentChallengeCompleted ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Completed this week! 🎉</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => setShowCompleteDialog(true)}
                          className="flex-1 gradient-romantic text-primary-foreground"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={shuffleChallenge}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">This Week's Progress</span>
              <span className="text-sm text-muted-foreground">{completedThisWeek} completed</span>
            </div>
            <Progress value={completedThisWeek > 0 ? 100 : 0} className="h-2" />
          </CardContent>
        </Card>

        {/* Challenge Library */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Challenge Library</h2>

          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0"
              >
                {cat === 'all' ? 'All' : getCategoryLabel(cat)}
              </Button>
            ))}
          </div>

          {/* Challenge Grid */}
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredChallenges.slice(0, 6).map((challenge, index) => {
                const isCompleted = completedChallenges.some(c => c.challengeId === challenge.id);
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`${isCompleted ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <span className="text-2xl mt-1 shrink-0">{challenge.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm leading-tight">{challenge.title}</h4>
                            {isCompleted && <Check className="w-4 h-4 text-green-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{challenge.description}</p>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 ${getCategoryColor(challenge.category)}`}>
                            {getCategoryLabel(challenge.category)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* History Section */}
        {completedHistory.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-lg font-semibold mb-3 w-full"
            >
              <span>📜 Challenge History</span>
              {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <Badge variant="secondary" className="ml-auto">{completedHistory.length}</Badge>
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {completedHistory.map((item, index) => (
                      <motion.div
                        key={`${item.challengeId}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-3 flex items-center gap-3">
                            <span className="text-xl">{item.challenge?.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.challenge?.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(item.completedAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                            {item.rating && (
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{item.rating}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Challenge 🎉</DialogTitle>
            <DialogDescription>
              How was "{currentChallenge?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setCompletionRating(rating)}
                    className="p-2"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${rating <= completionRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="How did it go? Any special moments?"
                rows={3}
              />
            </div>
            <Button
              onClick={handleCompleteChallenge}
              className="w-full gradient-romantic text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
