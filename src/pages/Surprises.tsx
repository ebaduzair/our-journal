import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { SurpriseCard } from '@/components/SurpriseCard';
import { AddButton } from '@/components/AddButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Surprise } from '@/types';
import { X, Gift } from 'lucide-react';

const Surprises = () => {
  const [surprises, setSurprises] = useLocalStorage<Surprise[]>('surprises', [
    {
      id: '1',
      title: 'Breakfast in Bed',
      description: 'Waking you up with your favorite pancakes and fresh flowers 🌸',
      isRevealed: false,
      createdBy: 'me',
    },
    {
      id: '2',
      title: 'Picnic Under the Stars',
      description: 'A cozy blanket, your favorite wine, and a million stars ✨',
      isRevealed: true,
      createdBy: 'partner',
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSurprise, setNewSurprise] = useState({
    title: '',
    description: '',
    createdBy: 'me' as 'me' | 'partner',
  });

  const handleReveal = (id: string) => {
    setSurprises(surprises.map(s => 
      s.id === id ? { ...s, isRevealed: true } : s
    ));
  };

  const handleAddSurprise = () => {
    if (!newSurprise.title.trim() || !newSurprise.description.trim()) return;
    
    const surprise: Surprise = {
      id: Date.now().toString(),
      ...newSurprise,
      isRevealed: false,
    };
    
    setSurprises([surprise, ...surprises]);
    setNewSurprise({ title: '', description: '', createdBy: 'me' });
    setIsAdding(false);
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSurprise({ ...newSurprise, createdBy: 'me' })}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      newSurprise.createdBy === 'me' 
                        ? 'gradient-romantic text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    From Me
                  </button>
                  <button
                    onClick={() => setNewSurprise({ ...newSurprise, createdBy: 'partner' })}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      newSurprise.createdBy === 'partner' 
                        ? 'gradient-romantic text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    From My Love
                  </button>
                </div>

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
                disabled={!newSurprise.title.trim() || !newSurprise.description.trim()}
                className="w-full mt-4 py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Gift className="w-5 h-5" />
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
