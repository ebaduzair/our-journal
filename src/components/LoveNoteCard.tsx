import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { LoveNote } from '@/types';
import { format } from 'date-fns';

interface LoveNoteCardProps {
  note: LoveNote;
  onHeart: (id: string) => void;
}

export function LoveNoteCard({ note, onHeart }: LoveNoteCardProps) {
  const isPartner = note.author === 'partner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-2xl shadow-card ${
        isPartner ? 'bg-rose-light ml-4' : 'bg-card mr-4'
      }`}
    >
      <p className="text-foreground text-sm leading-relaxed mb-3 font-medium">
        "{note.content}"
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.createdAt), 'MMM d, yyyy')}
        </span>
        
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={() => onHeart(note.id)}
          className="flex items-center gap-1 text-primary"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span className="text-xs font-semibold">{note.hearts}</span>
        </motion.button>
      </div>

      <div className={`absolute -top-2 ${isPartner ? '-left-2' : '-right-2'}`}>
        <span className="text-lg">{isPartner ? '💕' : '❤️'}</span>
      </div>
    </motion.div>
  );
}
