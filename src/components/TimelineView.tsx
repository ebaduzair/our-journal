import { motion } from 'framer-motion';
import { differenceInDays, format, isPast, isFuture } from 'date-fns';
import type { SpecialEvent } from '@/types';

interface TimelineViewProps {
  events: SpecialEvent[];
}

const eventTypeStyles = {
  anniversary: { color: 'bg-pink-500', icon: '💍' },
  date: { color: 'bg-rose-400', icon: '💑' },
  milestone: { color: 'bg-amber-400', icon: '🌟' },
  memory: { color: 'bg-purple-400', icon: '📸' },
};

export function TimelineView({ events }: TimelineViewProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getTimeDistance = (date: Date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const days = Math.abs(differenceInDays(eventDate, today));
    
    if (days === 0) return 'Today! 🎉';
    if (days === 1) return isPast(eventDate) ? 'Yesterday' : 'Tomorrow';
    if (days < 7) return isPast(eventDate) ? `${days} days ago` : `In ${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return isPast(eventDate) ? `${weeks} week${weeks > 1 ? 's' : ''} ago` : `In ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return isPast(eventDate) ? `${months} month${months > 1 ? 's' : ''} ago` : `In ${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    return isPast(eventDate) ? `${years} year${years > 1 ? 's' : ''} ago` : `In ${years} year${years > 1 ? 's' : ''}`;
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events to display in timeline</p>
      </div>
    );
  }

  return (
    <div className="relative px-4">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const eventDate = new Date(event.date);
          const isUpcoming = isFuture(eventDate);
          const style = eventTypeStyles[event.type];

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className={`w-10 h-10 rounded-full ${style.color} flex items-center justify-center shadow-lg ${
                    isUpcoming ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                >
                  <span className="text-lg">{event.emoji || style.icon}</span>
                </motion.div>
                {isUpcoming && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-primary/20"
                  />
                )}
              </div>

              {/* Event card */}
              <div className={`flex-1 bg-card rounded-2xl p-4 shadow-card ${
                isUpcoming ? 'border-2 border-primary/30' : ''
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {format(eventDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isUpcoming 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {getTimeDistance(eventDate)}
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
