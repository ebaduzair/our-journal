import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { AddButton } from '@/components/AddButton';
import { useSupabaseDataWithAuthor } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import type { SafeSpaceEntry, SafeSpaceMode, FeelingCategory } from '@/types';
import { X, Send, Heart, Loader2, Check, MessageCircleHeart, Lock, HeartHandshake } from 'lucide-react';

const modeOptions: { value: SafeSpaceMode; label: string; emoji: string; description: string }[] = [
    { value: 'just_listen', label: 'Just Listen', emoji: '🗣️', description: 'I need to vent (no advice needed)' },
    { value: 'need_support', label: 'Need Support', emoji: '❤️‍🩹', description: 'I need comfort or advice' },
    { value: 'private', label: 'Private', emoji: '🔒', description: 'Just for myself' },
];

const categoryOptions: { value: FeelingCategory; emoji: string }[] = [
    { value: 'hurt', emoji: '💔' },
    { value: 'stressed', emoji: '😰' },
    { value: 'anxious', emoji: '😟' },
    { value: 'sad', emoji: '😢' },
    { value: 'frustrated', emoji: '😤' },
    { value: 'other', emoji: '💭' },
];

const reactionEmojis = ['💜', '🫂', '💪', '❤️‍🔥', '🥺', '💕'];

const getModeInfo = (mode: SafeSpaceMode) => {
    return modeOptions.find(m => m.value === mode) || modeOptions[0];
};

const getCategoryEmoji = (category?: FeelingCategory) => {
    if (!category) return '💭';
    return categoryOptions.find(c => c.value === category)?.emoji || '💭';
};

// Transform from DB format to app format
const transformEntry = (dbEntry: any): SafeSpaceEntry => ({
    id: dbEntry.id,
    content: dbEntry.content,
    mode: dbEntry.mode,
    category: dbEntry.category,
    author: dbEntry.author_id === dbEntry._currentUserId ? 'me' : 'partner',
    reactions: dbEntry.reactions || [],
    isResolved: dbEntry.is_resolved || false,
    createdAt: new Date(dbEntry.created_at),
});

type FilterTab = 'all' | 'mine' | 'partner';

const SafeSpace = () => {
    const { user, profile } = useAuth();
    const {
        data: entries,
        loading,
        addItem,
        updateItem,
    } = useSupabaseDataWithAuthor<SafeSpaceEntry>({
        table: 'safe_space_entries',
        orderBy: { column: 'created_at', ascending: false },
        transform: (entry) => ({
            ...transformEntry({ ...entry, _currentUserId: user?.id }),
            _authorId: entry.author_id,
        }),
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [selectedMode, setSelectedMode] = useState<SafeSpaceMode>('just_listen');
    const [selectedCategory, setSelectedCategory] = useState<FeelingCategory | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const handleAddEntry = async () => {
        if (!newContent.trim() || !profile?.couple_code) return;

        setSubmitting(true);
        await addItem({
            content: newContent,
            mode: selectedMode,
            category: selectedCategory,
            reactions: [],
            is_resolved: false,
            couple_code: profile.couple_code,
        } as any);

        setNewContent('');
        setSelectedMode('just_listen');
        setSelectedCategory(undefined);
        setIsAdding(false);
        setSubmitting(false);
    };

    const handleReaction = async (entryId: string, emoji: string) => {
        const entry = entries.find(e => e.id === entryId);
        if (!entry) return;

        const currentReactions = entry.reactions || [];
        const newReactions = currentReactions.includes(emoji)
            ? currentReactions.filter(r => r !== emoji)
            : [...currentReactions, emoji];

        await updateItem(entryId, { reactions: newReactions } as any);
    };

    const handleResolve = async (entryId: string, isResolved: boolean) => {
        await updateItem(entryId, { is_resolved: isResolved } as any);
    };

    // Add author info for display
    const entriesWithAuthor = entries.map(entry => ({
        ...entry,
        author: (entry as any)._authorId === user?.id ? 'me' as const : 'partner' as const,
    }));

    // Filter based on active tab
    const filteredEntries = entriesWithAuthor.filter(entry => {
        if (activeTab === 'mine') return entry.author === 'me';
        if (activeTab === 'partner') return entry.author === 'partner';
        return true;
    });

    return (
        <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
            <PageHeader
                title="Safe Space"
                subtitle="A sanctuary for your feelings"
                emoji="💜"
            />

            {/* Tab Filters */}
            <div className="px-4 mb-4">
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    {(['all', 'mine', 'partner'] as FilterTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab === 'all' ? 'All' : tab === 'mine' ? 'My Entries' : "Partner's"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredEntries.map((entry, index) => {
                            const modeInfo = getModeInfo(entry.mode);
                            const isOwnEntry = entry.author === 'me';

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-card rounded-2xl p-4 shadow-card border ${entry.isResolved ? 'border-green-200 bg-green-50/50' : 'border-border'
                                        }`}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getCategoryEmoji(entry.category)}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.mode === 'just_listen'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : entry.mode === 'need_support'
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {modeInfo.emoji} {modeInfo.label}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {isOwnEntry ? 'You' : 'Partner'} • {new Date(entry.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <p className="text-foreground leading-relaxed mb-3">{entry.content}</p>

                                    {/* Reactions (only for partner's non-private entries) */}
                                    {!isOwnEntry && entry.mode !== 'private' && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {reactionEmojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(entry.id, emoji)}
                                                    className={`text-xl p-1.5 rounded-lg transition-all ${entry.reactions.includes(emoji)
                                                            ? 'bg-primary/20 scale-110'
                                                            : 'bg-muted hover:bg-muted/80'
                                                        }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Show received reactions */}
                                    {entry.reactions.length > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Heart className="w-4 h-4" />
                                            <span className="flex gap-1">{entry.reactions.map(r => r).join(' ')}</span>
                                        </div>
                                    )}

                                    {/* Resolve toggle (only for own entries) */}
                                    {isOwnEntry && (
                                        <button
                                            onClick={() => handleResolve(entry.id, !entry.isResolved)}
                                            className={`mt-3 flex items-center gap-2 text-sm font-medium transition-colors ${entry.isResolved ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${entry.isResolved ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                                                }`}>
                                                {entry.isResolved && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            {entry.isResolved ? 'Feeling better' : 'Mark as resolved'}
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {!loading && filteredEntries.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <HeartHandshake className="w-12 h-12 mx-auto mb-4 text-purple-300" />
                        <p className="text-muted-foreground">
                            {activeTab === 'partner'
                                ? "Your partner hasn't shared anything yet"
                                : "No entries yet. Share what's on your mind 💜"}
                        </p>
                    </motion.div>
                )}
            </div>

            <AddButton onClick={() => setIsAdding(true)} label="Share feelings" />

            {/* Add Entry Modal */}
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
                                    Share Your Feelings 💜
                                </h2>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Mode Selection */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    How would you like to share?
                                </label>
                                <div className="space-y-2">
                                    {modeOptions.map((mode) => (
                                        <button
                                            key={mode.value}
                                            onClick={() => setSelectedMode(mode.value)}
                                            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedMode === mode.value
                                                    ? 'bg-primary/10 border-2 border-primary'
                                                    : 'bg-muted border-2 border-transparent hover:border-muted-foreground/20'
                                                }`}
                                        >
                                            <span className="text-2xl">{mode.emoji}</span>
                                            <div>
                                                <p className="font-medium text-foreground">{mode.label}</p>
                                                <p className="text-xs text-muted-foreground">{mode.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    What are you feeling? (optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categoryOptions.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setSelectedCategory(selectedCategory === cat.value ? undefined : cat.value)}
                                            className={`text-2xl p-2 rounded-xl transition-all ${selectedCategory === cat.value
                                                    ? 'bg-primary/20 scale-110'
                                                    : 'bg-muted hover:bg-muted/80'
                                                }`}
                                            title={cat.value}
                                        >
                                            {cat.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder="What's on your mind? Let it all out..."
                                className="w-full h-32 p-4 rounded-2xl bg-muted border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddEntry}
                                disabled={!newContent.trim() || submitting}
                                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : selectedMode === 'private' ? (
                                    <Lock className="w-5 h-5" />
                                ) : (
                                    <MessageCircleHeart className="w-5 h-5" />
                                )}
                                {selectedMode === 'private' ? 'Save Privately' : 'Share with Partner'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SafeSpace;
