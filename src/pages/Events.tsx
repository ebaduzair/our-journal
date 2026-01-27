import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { EventCard } from '@/components/EventCard';
import { AddButton } from '@/components/AddButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SpecialEvent } from '@/types';
import { X, Calendar } from 'lucide-react';

const eventTypes = [
  { type: 'anniversary' as const, label: 'Anniversary', emoji: '💍' },
  { type: 'date' as const, label: 'Date Night', emoji: '💑' },
  { type: 'milestone' as const, label: 'Milestone', emoji: '🌟' },
  { type: 'memory' as const, label: 'Memory', emoji: '📸' },
];

const Events = () => {
  const [events, setEvents] = useLocalStorage<SpecialEvent[]>('special-events', [
    {
      id: '1',
      title: 'Our Anniversary',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 14),
      type: 'anniversary',
      description: 'The day we said "I do" 💍',
      emoji: '💍',
    },
    {
      id: '2',
      title: 'First Date',
      date: new Date(new Date().getFullYear() - 2, 5, 20),
      type: 'date',
      description: 'Where our story began...',
      emoji: '☕',
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: 'anniversary' as SpecialEvent['type'],
    description: '',
    emoji: '💍',
  });

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    
    const event: SpecialEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: new Date(newEvent.date),
      type: newEvent.type,
      description: newEvent.description,
      emoji: newEvent.emoji,
    };
    
    setEvents([event, ...events]);
    setNewEvent({ title: '', date: '', type: 'anniversary', description: '', emoji: '💍' });
    setIsAdding(false);
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Special Events" 
        subtitle="Moments we never want to forget"
        emoji="📅"
      />

      <div className="px-4 space-y-4">
        <AnimatePresence>
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gold-light" />
            <p className="text-muted-foreground">
              Add your first special event! 📅
            </p>
          </motion.div>
        )}
      </div>

      <AddButton onClick={() => setIsAdding(true)} label="Add event" />

      {/* Add Event Modal */}
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
              className="w-full max-w-md bg-card rounded-t-3xl p-6 shadow-card max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-romantic text-2xl font-semibold text-foreground">
                  New Special Event 🎉
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
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {eventTypes.map(et => (
                      <button
                        key={et.type}
                        onClick={() => setNewEvent({ ...newEvent, type: et.type, emoji: et.emoji })}
                        className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                          newEvent.type === et.type
                            ? 'gradient-romantic text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {et.emoji} {et.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Our First Kiss"
                    className="w-full p-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Description (optional)
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="What makes this moment special?"
                    className="w-full h-20 p-4 rounded-2xl bg-muted border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddEvent}
                disabled={!newEvent.title.trim() || !newEvent.date}
                className="w-full mt-6 py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Calendar className="w-5 h-5" />
                Add Event
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
