import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, ChevronDown, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabaseDataWithAuthor } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { CheckInEntry, GratitudeEntry } from '@/types';
import { format, getISOWeek, getYear } from 'date-fns';

const moodOptions = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😰', label: 'Stressed' },
];

const getCurrentWeekString = () => {
  const now = new Date();
  return `${getYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
};

// Transform check-in from DB format to app format
const transformCheckIn = (dbEntry: any, currentUserId?: string): CheckInEntry => ({
  id: dbEntry.id,
  weekString: dbEntry.week_string,
  createdAt: new Date(dbEntry.created_at),
  responses: {
    connectionRating: dbEntry.connection_rating,
    partnerHighlight: dbEntry.partner_highlight,
    unresolvedIssues: dbEntry.unresolved_issues,
    gratitude: dbEntry.gratitude,
    nextWeekPlan: dbEntry.next_week_plan,
  },
  overallMood: dbEntry.overall_mood,
});

// Transform gratitude entry from DB format to app format
const transformGratitude = (dbEntry: any, currentUserId?: string): GratitudeEntry => ({
  id: dbEntry.id,
  content: dbEntry.content,
  mood: dbEntry.mood,
  createdAt: new Date(dbEntry.created_at),
  author: dbEntry.author_id === currentUserId ? 'me' : 'partner',
});

const CheckIns = () => {
  const { user } = useAuth();

  // Fetch check-ins from Supabase
  const {
    data: checkIns,
    loading: checkInsLoading,
    addItem: addCheckIn,
  } = useSupabaseDataWithAuthor<CheckInEntry>({
    table: 'check_in_entries',
    orderBy: { column: 'created_at', ascending: false },
    transform: (entry: any) => transformCheckIn(entry, user?.id),
  });

  // Fetch gratitude entries from Supabase
  const {
    data: gratitudeEntries,
    loading: gratitudeLoading,
    addItem: addGratitude,
  } = useSupabaseDataWithAuthor<GratitudeEntry>({
    table: 'gratitude_entries',
    orderBy: { column: 'created_at', ascending: false },
    transform: (entry: any) => transformGratitude(entry, user?.id),
  });

  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check-in form state
  const [connectionRating, setConnectionRating] = useState(3);
  const [partnerHighlight, setPartnerHighlight] = useState('');
  const [unresolvedIssues, setUnresolvedIssues] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [nextWeekPlan, setNextWeekPlan] = useState('');
  const [overallMood, setOverallMood] = useState(3);

  const currentWeek = getCurrentWeekString();
  const hasCompletedThisWeek = checkIns.some(c =>
    c.weekString === currentWeek || (c as any).week_string === currentWeek
  );

  const loading = checkInsLoading || gratitudeLoading;

  const handleAddGratitude = async () => {
    if (!gratitudeText.trim() || !selectedMood) return;

    setSubmitting(true);
    await addGratitude({
      content: gratitudeText,
      mood: selectedMood,
    } as any);

    setGratitudeText('');
    setSelectedMood('');
    setSubmitting(false);
  };

  const handleSubmitCheckIn = async () => {
    setSubmitting(true);

    await addCheckIn({
      week_string: currentWeek,
      connection_rating: connectionRating,
      partner_highlight: partnerHighlight,
      unresolved_issues: unresolvedIssues,
      gratitude: gratitude,
      next_week_plan: nextWeekPlan,
      overall_mood: overallMood,
    } as any);

    setShowCheckInForm(false);
    // Reset form
    setConnectionRating(3);
    setPartnerHighlight('');
    setUnresolvedIssues('');
    setGratitude('');
    setNextWeekPlan('');
    setOverallMood(3);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 py-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-romantic text-2xl font-semibold text-gradient">Check-ins & Gratitude</h1>
              <p className="text-sm text-muted-foreground">Reflect on your relationship</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

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
            <h1 className="font-romantic text-2xl font-semibold text-gradient">Check-ins & Gratitude</h1>
            <p className="text-sm text-muted-foreground">Reflect on your relationship</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Weekly Check-in Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-rose-light/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 gradient-romantic opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                Weekly Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasCompletedThisWeek ? (
                <div className="text-center py-4">
                  <span className="text-4xl mb-2 block">✨</span>
                  <p className="text-muted-foreground">You've completed this week's check-in!</p>
                  <p className="text-sm text-muted-foreground mt-1">Come back next week</p>
                </div>
              ) : showCheckInForm ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {/* Question 1: Connection Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words">How connected did you feel this week?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setConnectionRating(num)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full border-2 transition-all text-sm ${connectionRating >= num
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words">What's one thing your partner did that made you happy?</label>
                    <Textarea
                      value={partnerHighlight}
                      onChange={(e) => setPartnerHighlight(e.target.value)}
                      placeholder="Share a moment that brought you joy..."
                      className="resize-none"
                    />
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words">Is there anything unresolved between you?</label>
                    <Textarea
                      value={unresolvedIssues}
                      onChange={(e) => setUnresolvedIssues(e.target.value)}
                      placeholder="Any topics to address? (or 'Nothing, we're great!')"
                      className="resize-none"
                    />
                  </div>

                  {/* Question 4 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words">What are you grateful for in your relationship this week?</label>
                    <Textarea
                      value={gratitude}
                      onChange={(e) => setGratitude(e.target.value)}
                      placeholder="Express your gratitude..."
                      className="resize-none"
                    />
                  </div>

                  {/* Question 5 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words">What's one thing you'd like to do together next week?</label>
                    <Textarea
                      value={nextWeekPlan}
                      onChange={(e) => setNextWeekPlan(e.target.value)}
                      placeholder="Plan something special..."
                      className="resize-none"
                    />
                  </div>

                  {/* Overall Mood */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words">Overall relationship mood this week:</label>
                    <div className="flex gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setOverallMood(num)}
                          className={`flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl border-2 transition-all text-lg sm:text-xl ${overallMood === num
                              ? 'bg-primary/10 border-primary'
                              : 'border-border hover:border-primary/50'
                            }`}
                        >
                          {num === 1 ? '😔' : num === 2 ? '😐' : num === 3 ? '🙂' : num === 4 ? '😊' : '🥰'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCheckInForm(false)}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitCheckIn}
                      className="flex-1 gradient-romantic text-primary-foreground"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Complete Check-in'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button
                  onClick={() => setShowCheckInForm(true)}
                  className="w-full gradient-romantic text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Weekly Check-in
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gratitude Quick-Add */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-xl">🙏</span>
                Daily Gratitude
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="What are you grateful for today?"
                className="bg-background"
              />

              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">Mood:</span>
                <div className="grid grid-cols-6 gap-1">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.emoji}
                      onClick={() => setSelectedMood(mood.emoji)}
                      className={`py-1.5 sm:py-2 text-lg sm:text-xl rounded-lg transition-all ${selectedMood === mood.emoji
                          ? 'bg-primary/20 scale-110'
                          : 'hover:bg-muted'
                        }`}
                      title={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddGratitude}
                disabled={!gratitudeText.trim() || !selectedMood || submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Gratitude
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Gratitude Entries */}
        {gratitudeEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-medium mb-3 text-muted-foreground">Recent Gratitude</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {gratitudeEntries.slice(0, 5).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-card border border-border flex items-start gap-3"
                  >
                    <span className="text-2xl">{entry.mood}</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Check-in History */}
        {checkIns.length > 0 && (
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <span>📋</span>
                  Check-in History ({checkIns.length})
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {checkIns.map((checkIn) => (
                <Card key={checkIn.id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Week {checkIn.weekString || (checkIn as any).week_string}</span>
                      <span className="text-2xl">
                        {checkIn.overallMood === 1 ? '😔' : checkIn.overallMood === 2 ? '😐' : checkIn.overallMood === 3 ? '🙂' : checkIn.overallMood === 4 ? '😊' : '🥰'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Connection:</span> {checkIn.responses.connectionRating}/5</p>
                      {checkIn.responses.partnerHighlight && (
                        <p className="text-muted-foreground">"{checkIn.responses.partnerHighlight}"</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(checkIn.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
};

export default CheckIns;
