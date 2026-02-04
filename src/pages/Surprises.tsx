import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { SurpriseCard } from '@/components/SurpriseCard';
import { AddButton } from '@/components/AddButton';
import { useSupabaseDataWithAuthor } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import type { Surprise } from '@/types';
import { X, Gift, Loader2 } from 'lucide-react';

// Transform from DB format to app format
const transformSurprise = (dbSurprise: any, currentUserId?: string): Surprise => ({
  id: dbSurprise.id,
  title: dbSurprise.title,
  description: dbSurprise.description,
  isRevealed: dbSurprise.is_revealed,
  plannedFor: dbSurprise.planned_for ? new Date(dbSurprise.planned_for) : undefined,
  createdBy: dbSurprise.created_by === currentUserId ? 'me' : 'partner',
});

const Surprises = () => {
  const { user } = useAuth();
  const {
    data: surprises,
    loading,
    addItem,
    updateItem
  } = useSupabaseDataWithAuthor<Surprise>({
    table: 'surprises',
    orderBy: { column: 'created_at', ascending: false },
    transform: (s) => transformSurprise(s, user?.id),
    authorField: 'created_by',
  });

  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSurprise, setNewSurprise] = useState({
    title: '',
    description: '',
  });

  const handleReveal = async (id: string) => {
    await updateItem(id, { is_revealed: true } as any);
  };

  const handleAddSurprise = async () => {
    if (!newSurprise.title.trim() || !newSurprise.description.trim()) return;

    setSubmitting(true);
    await addItem({
      title: newSurprise.title,
      description: newSurprise.description,
      is_revealed: false,
      created_by: user?.id,
    } as any);

    setNewSurprise({ title: '', description: '' });
    setIsAdding(false);
    setSubmitting(false);
  };

  const hiddenSurprises = surprises.filter(s => !s.isRevealed);
  const revealedSurprises = surprises.filter(s => s.isRevealed);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title="Surprises"
        subtitle="Little secrets waiting to be discovered"
        emoji="🎁"
      />

      <div className="px-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {hiddenSurprises.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Waiting to be revealed ({hiddenSurprises.length})
                </h3>
                <div className="space-y-4">
                  <AnimatePresence>
                    {hiddenSurprises.map((surprise) => (
                      <SurpriseCard
                        key={surprise.id}
                        surprise={surprise}
                        onReveal={handleReveal}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {revealedSurprises.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  ✨ Revealed Surprises
                </h3>
                <div className="space-y-4">
                  <AnimatePresence>
                    {revealedSurprises.map((surprise) => (
                      <SurpriseCard
                        key={surprise.id}
                        surprise={surprise}
                        onReveal={handleReveal}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {surprises.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Gift className="w-12 h-12 mx-auto mb-4 text-coral" />
                <p className="text-muted-foreground">
                  Plan your first surprise! 🎁
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AddButton onClick={() => setIsAdding(true)} label="Plan surprise" />

      {/* Add Surprise Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-romantic text-2xl font-semibold text-foreground">
                  Plan a Surprise 🎁
                </h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newSurprise.title}
                  onChange={e => setNewSurprise({ ...newSurprise, title: e.target.value })}
                  placeholder="Surprise title..."
                  className="w-full p-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <textarea
                  value={newSurprise.description}
                  onChange={e => setNewSurprise({ ...newSurprise, description: e.target.value })}
                  placeholder="What's the surprise? 🤫"
                  className="w-full h-24 p-4 rounded-2xl bg-muted border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSurprise}
                disabled={!newSurprise.title.trim() || !newSurprise.description.trim() || submitting}
                className="w-full mt-4 py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Gift className="w-5 h-5" />
                )}
                Create Surprise
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Surprises;
