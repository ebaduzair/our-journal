import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { AddButton } from '@/components/AddButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Memory } from '@/types';
import { X, Image, Heart } from 'lucide-react';
import { format } from 'date-fns';

const sampleMemories: Memory[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop',
    caption: 'Our favorite coffee spot ☕',
    date: new Date(Date.now() - 604800000),
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop',
    caption: 'Sunset walks together 🌅',
    date: new Date(Date.now() - 1209600000),
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop',
    caption: 'Cooking dinner together 🍝',
    date: new Date(Date.now() - 2419200000),
  },
];

const Memories = () => {
  const [memories, setMemories] = useLocalStorage<Memory[]>('memories', sampleMemories);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({
    imageUrl: '',
    caption: '',
  });

  const handleAddMemory = () => {
    if (!newMemory.imageUrl.trim()) return;
    
    const memory: Memory = {
      id: Date.now().toString(),
      imageUrl: newMemory.imageUrl,
      caption: newMemory.caption,
      date: new Date(),
    };
    
    setMemories([memory, ...memories]);
    setNewMemory({ imageUrl: '', caption: '' });
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Memories" 
        subtitle="Moments captured forever"
        emoji="📸"
      />

      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMemory(memory)}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-card cursor-pointer group"
              >
                <img 
                  src={memory.imageUrl} 
                  alt={memory.caption || 'Memory'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-primary-foreground text-xs font-medium truncate">
                    {memory.caption}
                  </p>
                </div>
                <div className="absolute top-2 right-2">
                  <Heart className="w-4 h-4 text-primary-foreground drop-shadow-lg fill-primary" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {memories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Image className="w-12 h-12 mx-auto mb-4 text-muted" />
            <p className="text-muted-foreground">
              Add your first memory! 📸
            </p>
          </motion.div>
        )}
      </div>

      <AddButton onClick={() => setIsAdding(true)} label="Add memory" />

      {/* View Memory Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <img 
                src={selectedMemory.imageUrl} 
                alt={selectedMemory.caption || 'Memory'}
                className="w-full rounded-2xl shadow-card"
              />
              <div className="mt-4 text-center">
                {selectedMemory.caption && (
                  <p className="text-primary-foreground font-medium mb-1">
                    {selectedMemory.caption}
                  </p>
                )}
                <p className="text-primary-foreground/70 text-sm">
                  {format(new Date(selectedMemory.date), 'MMMM d, yyyy')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Memory Modal */}
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
                  Add Memory 📸
                </h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={newMemory.imageUrl}
                    onChange={e => setNewMemory({ ...newMemory, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={newMemory.caption}
                    onChange={e => setNewMemory({ ...newMemory, caption: e.target.value })}
                    placeholder="What's this memory about?"
                    className="w-full p-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {newMemory.imageUrl && (
                  <div className="rounded-2xl overflow-hidden">
                    <img 
                      src={newMemory.imageUrl} 
                      alt="Preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMemory}
                disabled={!newMemory.imageUrl.trim()}
                className="w-full mt-4 py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Image className="w-5 h-5" />
                Save Memory
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Memories;
