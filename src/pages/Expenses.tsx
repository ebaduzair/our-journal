import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { AddButton } from '@/components/AddButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, IndianRupee, Wallet, ShoppingBag, Coffee, Car, Home, Zap, Heart, MoreHorizontal, Trash2, CalendarCog } from 'lucide-react';
import { format, isToday, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, isSameDay, isSameWeek, isSameMonth, isSameYear, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface Expense {
    id: string;
    amount: number;
    category: 'food' | 'transport' | 'housing' | 'utilities' | 'entertainment' | 'shopping' | 'other';
    description?: string;
    date: string; // YYYY-MM-DD
    author_id: string;
    couple_code: string;
    created_at: string;
}

const categories = [
    { id: 'food', label: 'Food & Dining', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'transport', label: 'Transport', icon: Car, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'housing', label: 'Housing', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { id: 'utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 'entertainment', label: 'Fun & Dates', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-100' },
] as const;

export default function Expenses() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [filter, setFilter] = useState<'all' | 'me' | 'partner'>('all');

    // Data Fetching
    const { data: expenses, loading, addItem, deleteItem } = useSupabaseData<Expense>({
        table: 'expenses',
        orderBy: { column: 'created_at', ascending: false },
        transform: (entry: any) => ({
            ...entry,
            amount: Number(entry.amount), // Ensure amount is number
        }),
    });

    // Navigation Logic
    const handlePrev = () => {
        setSelectedDate(curr => {
            if (viewMode === 'daily') return subDays(curr, 1);
            if (viewMode === 'weekly') return subWeeks(curr, 1);
            if (viewMode === 'monthly') return subMonths(curr, 1);
            return subYears(curr, 1);
        });
    };

    const handleNext = () => {
        setSelectedDate(curr => {
            if (viewMode === 'daily') return addDays(curr, 1);
            if (viewMode === 'weekly') return addWeeks(curr, 1);
            if (viewMode === 'monthly') return addMonths(curr, 1);
            return addYears(curr, 1);
        });
    };

    const dateLabel = useMemo(() => {
        if (viewMode === 'daily') return isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d');
        if (viewMode === 'weekly') {
            const start = startOfWeek(selectedDate);
            const end = endOfWeek(selectedDate);
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
        }
        if (viewMode === 'monthly') return format(selectedDate, 'MMMM yyyy');
        return format(selectedDate, 'yyyy');
    }, [selectedDate, viewMode]);

    // Filtering
    const displayExpenses = useMemo(() => {
        return expenses.filter(e => {
            const expenseDate = parseISO(e.date);
            let matchesDate = false;

            if (viewMode === 'daily') matchesDate = isSameDay(expenseDate, selectedDate);
            else if (viewMode === 'weekly') matchesDate = isSameWeek(expenseDate, selectedDate);
            else if (viewMode === 'monthly') matchesDate = isSameMonth(expenseDate, selectedDate);
            else matchesDate = isSameYear(expenseDate, selectedDate);

            if (!matchesDate) return false;

            if (filter === 'me') return e.author_id === user?.id;
            if (filter === 'partner') return e.author_id !== user?.id;
            return true;
        });
    }, [expenses, selectedDate, viewMode, filter, user]);

    const totalAmount = displayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Add/Delete Logic
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState<{
        amount: string;
        category: string;
        description: string;
    }>({ amount: '', category: 'food', description: '' });

    const handleAdd = async () => {
        if (!newExpense.amount || !newExpense.category) return;
        setIsSubmitting(true);
        try {
            await addItem({
                amount: parseFloat(newExpense.amount),
                category: newExpense.category,
                description: newExpense.description,
                date: format(selectedDate, 'yyyy-MM-dd'),
            } as any); // Author ID handled by hook
            setIsAddOpen(false);
            setNewExpense({ amount: '', category: 'food', description: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            await deleteItem(id);
        }
    };

    return (
        <div className="min-h-screen pb-24 overflow-x-hidden bg-background">
            <PageHeader
                title="Expenses"
                subtitle="Track your shared spending"
                emoji="💸"
            />

            <div className="px-4 space-y-6">
                {/* View Mode Selector */}
                <div className="flex bg-muted p-1 rounded-lg">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                                viewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {/* Date & Filter */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrev}>&lt;</Button>
                        <span className="font-medium min-w-[140px] text-center text-sm">
                            {dateLabel}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleNext}>&gt;</Button>
                    </div>
                    <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Everyone</SelectItem>
                            <SelectItem value="me">Me</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Card */}
                <motion.div
                    key={viewMode + dateLabel}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                        <CardContent className="p-6 text-center">
                            <p className="text-sm text-green-600 font-medium mb-1">
                                Total Spent {viewMode === 'daily' && isToday(selectedDate) ? 'Today' : `in ${viewMode === 'daily' ? format(selectedDate, 'MMM d') : dateLabel}`}
                            </p>
                            <h2 className="text-4xl font-bold text-green-700 font-mono tracking-tight">
                                ₹{totalAmount.toFixed(2)}
                            </h2>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Expenses List */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : displayExpenses.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-muted-foreground"
                            >
                                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No expenses logged for this day</p>
                            </motion.div>
                        ) : (
                            displayExpenses.map((expense) => {
                                const category = categories.find(c => c.id === expense.category) || categories[6];
                                const Icon = category.icon;
                                const isMe = expense.author_id === user?.id;

                                return (
                                    <motion.div
                                        key={expense.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card>
                                            <CardContent className="p-3 flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", category.bg, category.color)}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium truncate">{expense.description || category.label}</h4>
                                                        <span className="font-mono font-bold ml-2">₹{expense.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground")}>
                                                            {isMe ? 'Me' : 'Partner'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{category.label}</span>
                                                    </div>
                                                </div>
                                                {isMe && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 -mr-1"
                                                        onClick={() => handleDelete(expense.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AddButton onClick={() => setIsAddOpen(true)} />

            {/* Add Expense Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                        <DialogDescription>Log a new expense for {format(selectedDate, 'MMMM d')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-9"
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setNewExpense({ ...newExpense, category: cat.id })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all",
                                            newExpense.category === cat.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-border hover:bg-secondary/50"
                                        )}
                                    >
                                        <cat.icon className={cn("w-4 h-4", cat.color)} />
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <Input
                                placeholder="What was this for?"
                                value={newExpense.description}
                                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!newExpense.amount || isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Expense
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
