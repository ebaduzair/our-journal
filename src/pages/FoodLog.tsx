import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { AddButton } from '@/components/AddButton';
import { useSupabaseDataWithAuthor } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { X, Utensils, Coffee, Sun, Moon, Cookie, Loader2, ChevronLeft, ChevronRight, Droplets, Plus, Minus } from 'lucide-react';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';

interface FoodLog {
    id: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_items: string;
    notes?: string;
    author_id: string;
    couple_code: string;
    logged_at: string;
    created_at: string;
}

const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: Sun, emoji: '☀️' },
    { id: 'dinner', label: 'Dinner', icon: Moon, emoji: '🌙' },
    { id: 'snack', label: 'Snack', icon: Cookie, emoji: '🍪' },
] as const;

const WATER_GOAL = 8; // 8 glasses per day

interface WaterIntake {
    id: string;
    glasses: number;
    logged_at: string;
    author_id: string;
    couple_code: string;
    created_at: string;
}

const FoodLog = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAdding, setIsAdding] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
    const [foodItems, setFoodItems] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const dateString = format(selectedDate, 'yyyy-MM-dd');

    const {
        data: allLogs,
        loading,
        addItem,
        deleteItem,
    } = useSupabaseDataWithAuthor<FoodLog>({
        table: 'food_logs',
        orderBy: { column: 'created_at', ascending: true },
        transform: (log) => ({
            ...log,
            _authorId: log.author_id,
        }),
    });

    // Water intake data
    const {
        data: allWaterLogs,
        loading: waterLoading,
        addItem: addWaterItem,
        updateItem: updateWaterItem,
    } = useSupabaseDataWithAuthor<WaterIntake>({
        table: 'water_intake',
        orderBy: { column: 'created_at', ascending: true },
        transform: (log) => ({
            ...log,
            _authorId: log.author_id,
        }),
    });

    // Filter logs for selected date
    const todaysLogs = useMemo(() => {
        return allLogs.filter(log => log.logged_at === dateString);
    }, [allLogs, dateString]);

    // Filter water logs for selected date
    const todaysWaterLogs = useMemo(() => {
        return allWaterLogs.filter(log => log.logged_at === dateString);
    }, [allWaterLogs, dateString]);

    // Get water intake for me and partner
    const myWater = todaysWaterLogs.find(log => (log as any)._authorId === user?.id);
    const partnerWater = todaysWaterLogs.find(log => (log as any)._authorId !== user?.id);

    // Separate my logs and partner's logs
    const myLogs = todaysLogs.filter(log => (log as any)._authorId === user?.id);
    const partnerLogs = todaysLogs.filter(log => (log as any)._authorId !== user?.id);

    const handleAddLog = async () => {
        if (!foodItems.trim()) return;

        setSubmitting(true);
        await addItem({
            meal_type: selectedMealType,
            food_items: foodItems.trim(),
            notes: notes.trim() || null,
            logged_at: dateString,
        } as any);

        setFoodItems('');
        setNotes('');
        setIsAdding(false);
        setSubmitting(false);
    };

    const handleDeleteLog = async (id: string) => {
        await deleteItem(id);
    };

    const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
    const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const goToToday = () => setSelectedDate(new Date());

    const handleWaterChange = async (delta: number) => {
        const currentGlasses = myWater?.glasses || 0;
        const newGlasses = Math.max(0, Math.min(WATER_GOAL + 4, currentGlasses + delta)); // Max 12 glasses

        if (myWater) {
            await updateWaterItem(myWater.id, { glasses: newGlasses } as any);
        } else {
            await addWaterItem({
                glasses: newGlasses,
                logged_at: dateString,
            } as any);
        }
    };

    const getMealIcon = (mealType: string) => {
        const meal = mealTypes.find(m => m.id === mealType);
        return meal?.emoji || '🍽️';
    };

    const renderLogSection = (logs: FoodLog[], title: string, isMe: boolean) => (
        <div className="mb-6">
            <h3 className={`text-sm font-medium mb-3 ${isMe ? 'text-primary' : 'text-lavender'}`}>
                {title}
            </h3>
            {logs.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">No meals logged yet</p>
            ) : (
                <div className="space-y-3">
                    {mealTypes.map(mealType => {
                        const mealLogs = logs.filter(log => log.meal_type === mealType.id);
                        if (mealLogs.length === 0) return null;

                        return (
                            <div key={mealType.id} className="bg-muted/50 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{mealType.emoji}</span>
                                    <span className="font-medium text-foreground">{mealType.label}</span>
                                </div>
                                {mealLogs.map(log => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="ml-7 mb-2 last:mb-0"
                                    >
                                        <p className="text-foreground">{log.food_items}</p>
                                        {log.notes && (
                                            <p className="text-muted-foreground text-sm mt-1">{log.notes}</p>
                                        )}
                                        {isMe && (
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="text-xs text-muted-foreground hover:text-destructive mt-1"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
            <PageHeader
                title="Food Log"
                subtitle="Track what you eat together 🍽️"
                emoji="🥗"
            />

            {/* Date Navigation */}
            <div className="px-4 mb-6">
                <div className="flex items-center justify-between bg-card rounded-2xl p-3 shadow-card">
                    <button
                        onClick={goToPreviousDay}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <div className="text-center">
                        <p className="font-romantic text-lg text-foreground">
                            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {format(selectedDate, 'MMMM d, yyyy')}
                        </p>
                    </div>

                    <button
                        onClick={goToNextDay}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        disabled={isToday(selectedDate)}
                    >
                        <ChevronRight className={`w-5 h-5 ${isToday(selectedDate) ? 'text-muted' : 'text-muted-foreground'}`} />
                    </button>
                </div>

                {!isToday(selectedDate) && (
                    <button
                        onClick={goToToday}
                        className="w-full mt-2 py-2 text-sm text-primary hover:underline"
                    >
                        Go to Today
                    </button>
                )}
            </div>

            {/* Water Intake Section */}
            <div className="px-4 mb-6">
                <div className="bg-card rounded-2xl p-4 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            <h3 className="font-medium text-foreground">Water Intake</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Goal: {WATER_GOAL} glasses
                        </span>
                    </div>

                    {/* My Water */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-primary font-medium">Me 💧</span>
                            <span className="text-sm text-muted-foreground">
                                {myWater?.glasses || 0}/{WATER_GOAL}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleWaterChange(-1)}
                                disabled={(myWater?.glasses || 0) === 0}
                                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 disabled:opacity-40 hover:bg-blue-200 transition-colors"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <div className="flex-1 flex gap-1">
                                {Array.from({ length: WATER_GOAL }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-8 rounded-lg transition-all ${i < (myWater?.glasses || 0)
                                                ? 'bg-blue-500'
                                                : 'bg-blue-100'
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => handleWaterChange(1)}
                                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Partner's Water */}
                    {partnerWater && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-lavender font-medium">Partner 💕</span>
                                <span className="text-sm text-muted-foreground">
                                    {partnerWater.glasses}/{WATER_GOAL}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: WATER_GOAL }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-6 rounded-lg transition-all ${i < partnerWater.glasses
                                                ? 'bg-purple-400'
                                                : 'bg-purple-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {(myWater?.glasses || 0) >= WATER_GOAL && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 text-center py-2 bg-green-100 rounded-xl text-green-700 text-sm font-medium"
                        >
                            🎉 You hit your water goal! Great job staying hydrated!
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Food Logs */}
            <div className="px-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {renderLogSection(myLogs, "My Meals 🍽️", true)}
                        {renderLogSection(partnerLogs, "Partner's Meals 💕", false)}
                    </>
                )}

                {!loading && todaysLogs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <Utensils className="w-12 h-12 mx-auto mb-4 text-rose-light" />
                        <p className="text-muted-foreground">
                            No meals logged for this day. Start tracking! 🥗
                        </p>
                    </motion.div>
                )}
            </div>

            <AddButton onClick={() => setIsAdding(true)} label="Log a meal" />

            {/* Add Food Log Modal */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60] flex items-end justify-center"
                        onClick={() => setIsAdding(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-card rounded-t-3xl p-6 shadow-card max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-romantic text-2xl font-semibold text-foreground">
                                    Log a Meal 🍽️
                                </h2>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Meal Type Selection */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Meal Type
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {mealTypes.map(meal => (
                                        <button
                                            key={meal.id}
                                            onClick={() => setSelectedMealType(meal.id)}
                                            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${selectedMealType === meal.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            <span className="text-xl">{meal.emoji}</span>
                                            <span className="text-xs">{meal.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Food Items */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    What did you eat?
                                </label>
                                <textarea
                                    value={foodItems}
                                    onChange={e => setFoodItems(e.target.value)}
                                    placeholder="e.g., Oatmeal with berries, coffee"
                                    className="w-full h-24 p-4 rounded-2xl bg-muted border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Notes (optional) */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Notes (optional)
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="e.g., Felt great after this meal!"
                                    className="w-full p-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddLog}
                                disabled={!foodItems.trim() || submitting}
                                className="w-full py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Utensils className="w-5 h-5" />
                                )}
                                Log Meal
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodLog;
