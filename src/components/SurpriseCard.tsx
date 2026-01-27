import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, Unlock } from 'lucide-react';
import type { Surprise } from '@/types';

interface SurpriseCardProps {
  surprise: Surprise;
  onReveal: (id: string) => void;
}

export function SurpriseCard({ surprise, onReveal }: SurpriseCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <AnimatePresence mode="wait">
        {!surprise.isRevealed ? (
          <motion.button
            key="hidden"
            exit={{ rotateY: 90 }}
            onClick={() => onReveal(surprise.id)}
            className="w-full p-6 rounded-2xl gradient-romantic shadow-glow text-center group"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Gift className="w-12 h-12 mx-auto mb-3 text-primary-foreground" />
            </motion.div>
            <p className="text-primary-foreground font-medium mb-1">
              A surprise awaits...
            </p>
            <div className="flex items-center justify-center gap-1 text-primary-foreground/80 text-sm">
              <Lock className="w-3 h-3" />
              <span>Tap to reveal</span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="revealed"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            className="w-full p-6 rounded-2xl bg-card shadow-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-rose-light">
                <Unlock className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                Revealed!
              </span>
            </div>
            <h3 className="font-romantic text-xl font-semibold text-foreground mb-2">
              {surprise.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {surprise.description}
            </p>
            <div className="mt-4 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                From: {surprise.createdBy === 'me' ? 'You 💕' : 'Your Love 💝'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
