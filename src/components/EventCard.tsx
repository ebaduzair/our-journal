import { motion } from 'framer-motion';
import type { SpecialEvent } from '@/types';
import { format, differenceInDays } from 'date-fns';

interface EventCardProps {
  event: SpecialEvent;
}

const typeEmojis = {
  anniversary: '💍',
  date: '💑',
  milestone: '🌟',
  memory: '📸',
};

const typeColors = {
  anniversary: 'from-rose to-coral',
  date: 'from-coral to-gold',
  milestone: 'from-gold to-rose',
  memory: 'from-rose-dark to-rose',
};

export function EventCard({ event }: EventCardProps) {
  const daysAway = differenceInDays(new Date(event.date), new Date());
  const isPast = daysAway < 0;
  const isToday = daysAway === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl shadow-card bg-card"
    >
      <div className={`h-2 bg-gradient-to-r ${typeColors[event.type]}`} />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{event.emoji || typeEmojis[event.type]}</span>
            <div>
              <h3 className="font-romantic text-lg font-semibold text-foreground">
                {event.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isToday 
              ? 'bg-primary text-primary-foreground animate-pulse-soft' 
              : isPast 
                ? 'bg-muted text-muted-foreground'
                : 'bg-rose-light text-primary'
          }`}>
            {isToday ? 'Today! 💕' : isPast ? `${Math.abs(daysAway)}d ago` : `${daysAway}d away`}
          </div>
        </div>
        
        {event.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {event.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
