import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { AddButton } from '@/components/AddButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { LoveReason } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const ReasonsILoveYou = () => {
  const [reasons, setReasons] = useLocalStorage<LoveReason[]>('love-reasons', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<'me' | 'partner'>('me');

  const handleAddReason = () => {
    if (!newReason.trim()) return;

    const reason: LoveReason = {
      id: Date.now().toString(),
      content: newReason.trim(),
      author: selectedAuthor,
      createdAt: new Date(),
      hearts: 0,
    };

    setReasons([reason, ...reasons]);
    setNewReason('');
    setIsDialogOpen(false);
  };

  const handleHeart = (id: string) => {
    setReasons(reasons.map(r => 
      r.id === id ? { ...r, hearts: r.hearts + 1 } : r
    ));
  };

  const myReasons = reasons.filter(r => r.author === 'me');
  const partnerReasons = reasons.filter(r => r.author === 'partner');

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Reasons I Love You" 
        subtitle="Growing our love, one reason at a time 💕"
        emoji="💝"
      />

      <div className="px-4 space-y-6">
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-4 rounded-2xl bg-rose-light text-center">
            <span className="text-2xl font-bold text-foreground">{myReasons.length}</span>
            <p className="text-xs text-muted-foreground mt-1">My Reasons</p>
          </div>
          <div className="p-4 rounded-2xl bg-gold-light text-center">
            <span className="text-2xl font-bold text-foreground">{partnerReasons.length}</span>
            <p className="text-xs text-muted-foreground mt-1">Their Reasons</p>
          </div>
        </motion.div>

        {/* Random Reason Highlight */}
        {reasons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl gradient-romantic text-primary-foreground shadow-glow"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                Today's Reminder
              </span>
            </div>
            <p className="font-romantic text-lg leading-relaxed">
              "{reasons[Math.floor(Math.random() * reasons.length)].content}"
            </p>
          </motion.div>
        )}

        {/* Reasons List */}
        {reasons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-romantic text-xl text-foreground mb-2">
              Start Your Love List
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Add reasons why you love each other and watch your list grow 💕
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {reasons.map((reason, index) => (
                <motion.div
                  key={reason.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 rounded-2xl shadow-card ${
                    reason.author === 'partner' ? 'bg-rose-light ml-4' : 'bg-card mr-4'
                  }`}
                >
                  <p className="text-foreground text-sm leading-relaxed mb-3 font-medium">
                    "{reason.content}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reason.createdAt), 'MMM d, yyyy')}
                    </span>
                    
                    <motion.button
                      whileTap={{ scale: 1.3 }}
                      onClick={() => handleHeart(reason.id)}
                      className="flex items-center gap-1 text-primary"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-xs font-semibold">{reason.hearts}</span>
                    </motion.button>
                  </div>

                  <div className={`absolute -top-2 ${reason.author === 'partner' ? '-left-2' : '-right-2'}`}>
                    <span className="text-lg">{reason.author === 'partner' ? '💕' : '❤️'}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddButton onClick={() => setIsDialogOpen(true)} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-romantic text-xl text-center">
              Add a Reason 💝
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedAuthor === 'me' ? 'default' : 'outline'}
                className="flex-1 rounded-xl"
                onClick={() => setSelectedAuthor('me')}
              >
                ❤️ From Me
              </Button>
              <Button
                type="button"
                variant={selectedAuthor === 'partner' ? 'default' : 'outline'}
                className="flex-1 rounded-xl"
                onClick={() => setSelectedAuthor('partner')}
              >
                💕 From My Love
              </Button>
            </div>

            <Textarea
              placeholder="I love you because..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="min-h-[100px] rounded-xl resize-none"
            />

            <Button
              onClick={handleAddReason}
              disabled={!newReason.trim()}
              className="w-full rounded-xl gradient-romantic text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reason
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReasonsILoveYou;
