import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Check, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { Habit, HabitCompletion } from '@/types';
import { format } from 'date-fns';

const emojiOptions = ['🧘', '📖', '💪', '🏃', '🥗', '💧', '🎯', '✍️', '🌅', '💤', '📵', '🤲', '💊', '🧹'];

const HabitTracker = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitEmoji, setNewHabitEmoji] = useState('🎯');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);
    const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

    const today = format(new Date(), 'yyyy-MM-dd');

    const { data: habits, loading: habitsLoading, addItem: addHabit, deleteItem: deleteHabit } = useSupabaseData<Habit>({
        table: 'habits',
        orderBy: { column: 'created_at', ascending: true },
    });

    const { data: completions, loading: completionsLoading, addItem: addCompletion, deleteItem: deleteCompletion } = useSupabaseData<HabitCompletion>({
        table: 'habit_completions',
    });

    // Today's completions
    const todayCompletions = useMemo(
        () => completions.filter(c => c.completed_date === today),
        [completions, today]
    );

    const isCompletedByMe = (habitId: string) =>
        todayCompletions.some(c => c.habit_id === habitId && c.user_id === user?.id);

    const isCompletedByPartner = (habitId: string) =>
        todayCompletions.some(c => c.habit_id === habitId && c.user_id !== user?.id);

    const handleToggleHabit = async (habitId: string) => {
        if (!user) return;
        setLoadingHabitId(habitId);

        try {
            const existing = todayCompletions.find(
                c => c.habit_id === habitId && c.user_id === user.id
            );

            if (existing) {
                await deleteCompletion(existing.id);
            } else {
                await addCompletion({
                    habit_id: habitId,
                    user_id: user.id,
                    completed_date: today,
                } as any);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update habit', variant: 'destructive' });
        } finally {
            setLoadingHabitId(null);
        }
    };

    const handleAddHabit = async () => {
        if (!newHabitName.trim()) return;

        try {
            await addHabit({
                name: newHabitName.trim(),
                emoji: newHabitEmoji,
                frequency: 'daily',
                created_by: user?.id || '',
            } as any);

            setNewHabitName('');
            setNewHabitEmoji('🎯');
            setDialogOpen(false);
            toast({ title: 'Habit added! 🎯', description: 'Start tracking together.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add habit', variant: 'destructive' });
        }
    };

    const handleDeleteHabit = async (habitId: string) => {
        setDeletingHabitId(habitId);
        try {
            // Delete all completions for this habit first
            const { error: compError } = await supabase
                .from('habit_completions')
                .delete()
                .eq('habit_id', habitId);

            if (compError) throw compError;

            await deleteHabit(habitId);
            toast({ title: 'Habit removed' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete habit', variant: 'destructive' });
        } finally {
            setDeletingHabitId(null);
        }
    };

    const loading = habitsLoading || completionsLoading;

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="px-4 pt-6">
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/">
                        <motion.div whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center border border-border/50">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-romantic font-semibold text-gradient">Habit Tracker</h1>
                        <p className="text-xs text-muted-foreground">Build good habits together 💪</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-full gradient-romantic shadow-glow flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </motion.button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl max-w-[90vw]">
                            <DialogHeader>
                                <DialogTitle className="font-romantic text-xl">New Habit</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Habit Name</label>
                                    <Input
                                        placeholder="e.g. Meditate, Read, Exercise..."
                                        value={newHabitName}
                                        onChange={(e) => setNewHabitName(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Pick an emoji</label>
                                    <div className="flex flex-wrap gap-2">
                                        {emojiOptions.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => setNewHabitEmoji(emoji)}
                                                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newHabitEmoji === emoji
                                                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                                                        : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddHabit}
                                    disabled={!newHabitName.trim()}
                                    className="w-full rounded-xl gradient-romantic text-white"
                                >
                                    Add Habit
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Today's date */}
                <div className="text-center mb-5">
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(), 'EEEE, MMMM d')}
                    </p>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : habits.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <Target className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No habits yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Start by adding a habit you want to build together
                        </p>
                        <Button onClick={() => setDialogOpen(true)} className="rounded-xl gradient-romantic text-white">
                            <Plus className="w-4 h-4 mr-2" /> Add Your First Habit
                        </Button>
                    </motion.div>
                ) : (
                    /* Habits list */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        {/* Legend */}
                        <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground mb-1 px-1">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span>Me</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-violet-500" />
                                <span>Partner</span>
                            </div>
                        </div>

                        <AnimatePresence>
                            {habits.map((habit) => {
                                const myDone = isCompletedByMe(habit.id);
                                const partnerDone = isCompletedByPartner(habit.id);
                                const isLoading = loadingHabitId === habit.id;
                                const isDeleting = deletingHabitId === habit.id;

                                return (
                                    <motion.div
                                        key={habit.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className={`p-4 rounded-2xl bg-card shadow-sm border transition-all ${myDone && partnerDone
                                                ? 'border-emerald-300 bg-emerald-50/50'
                                                : 'border-border/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Checkbox for me */}
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleToggleHabit(habit.id)}
                                                disabled={isLoading}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${myDone
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-emerald-300 hover:border-emerald-400 text-emerald-300'
                                                    }`}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : myDone ? (
                                                    <Check className="w-5 h-5" />
                                                ) : null}
                                            </motion.button>

                                            {/* Habit info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{habit.emoji}</span>
                                                    <h3 className={`font-medium truncate ${myDone ? 'line-through text-muted-foreground' : ''}`}>
                                                        {habit.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Partner status */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${partnerDone
                                                    ? 'bg-violet-500 text-white'
                                                    : 'bg-violet-100 text-violet-300'
                                                }`}>
                                                {partnerDone ? <Check className="w-4 h-4" /> : <span className="text-xs">•</span>}
                                            </div>

                                            {/* Delete button */}
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteHabit(habit.id)}
                                                disabled={isDeleting}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Both done celebration */}
                                        {myDone && partnerDone && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="text-xs text-emerald-600 mt-2 text-center font-medium"
                                            >
                                                ✨ Both of you did it today!
                                            </motion.p>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Summary */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 p-4 rounded-2xl bg-card shadow-sm border border-border/50 text-center"
                        >
                            <p className="text-sm text-muted-foreground">
                                Today: <span className="font-semibold text-emerald-600">
                                    {todayCompletions.filter(c => c.user_id === user?.id).length}
                                </span> / {habits.length} done by you
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HabitTracker;
