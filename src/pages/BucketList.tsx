import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Sparkles, Heart } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { BucketListItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const emojiOptions = ['✈️', '🏖️', '🎢', '🍽️', '🎭', '🎵', '⛰️', '🏠', '💍', '👶', '🐕', '🎓', '💪', '📚', '🎨'];

const BucketList = () => {
  const [items, setItems] = useLocalStorage<BucketListItem[]>('bucket-list', []);
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✈️');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    
    const newItem: BucketListItem = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription || undefined,
      isCompleted: false,
      createdAt: new Date(),
      emoji: selectedEmoji,
    };
    
    setItems([newItem, ...items]);
    setNewTitle('');
    setNewDescription('');
    setSelectedEmoji('✈️');
    setIsOpen(false);
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { 
            ...item, 
            isCompleted: !item.isCompleted,
            completedAt: !item.isCompleted ? new Date() : undefined 
          }
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const pendingItems = items.filter(item => !item.isCompleted);
  const completedItems = items.filter(item => item.isCompleted);
  const completionRate = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Our Bucket List" 
        subtitle="Dreams we'll chase together"
        emoji="🪣"
      />

      {/* Progress Card */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-6 p-4 rounded-2xl gradient-romantic text-primary-foreground"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Our Progress</span>
            <span className="text-2xl font-bold">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-primary-foreground rounded-full"
            />
          </div>
          <p className="text-xs mt-2 opacity-80">
            {completedItems.length} of {items.length} dreams achieved together 💕
          </p>
        </motion.div>
      )}

      <div className="px-4 space-y-6">
        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dreams to Chase
              </h2>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {pendingItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-card shadow-card border border-rose-light/30 group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className="mt-0.5 w-6 h-6 rounded-full border-2 border-primary/50 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-50" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <h3 className="font-medium text-foreground">{item.title}</h3>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-primary fill-current" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dreams We've Lived
              </h2>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {completedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-muted/50 border border-border group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className="mt-0.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg opacity-60">{item.emoji}</span>
                          <h3 className="font-medium text-muted-foreground line-through">{item.title}</h3>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground/70 mt-1 line-through">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
              <span className="text-4xl">🪣</span>
            </div>
            <h3 className="font-romantic text-xl text-foreground mb-2">Start Your Adventure</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Add dreams and goals you want to experience together. Check them off as you go!
            </p>
          </motion.div>
        )}
      </div>

      {/* Add Button with Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full gradient-romantic shadow-glow flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-romantic text-xl text-gradient">Add a Dream</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Pick an emoji</label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                      selectedEmoji === emoji 
                        ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">What's the dream?</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Visit Paris together"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Add some details (optional)</label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g., Watch the sunset from the Eiffel Tower"
                className="rounded-xl"
              />
            </div>
            <Button 
              onClick={handleAdd} 
              className="w-full rounded-xl gradient-romantic text-primary-foreground"
              disabled={!newTitle.trim()}
            >
              Add to Our List 💕
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BucketList;
