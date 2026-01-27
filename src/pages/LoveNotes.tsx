import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { LoveNoteCard } from '@/components/LoveNoteCard';
import { AddButton } from '@/components/AddButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { LoveNote } from '@/types';
import { X, Send, Heart } from 'lucide-react';

const LoveNotes = () => {
  const [notes, setNotes] = useLocalStorage<LoveNote[]>('love-notes', [
    {
      id: '1',
      content: "I love how you always know how to make me laugh, even on my worst days.",
      author: 'me',
      createdAt: new Date(Date.now() - 86400000),
      hearts: 3,
    },
    {
      id: '2',
      content: "The way you look at me makes my heart skip a beat. Every. Single. Time.",
      author: 'partner',
      createdAt: new Date(Date.now() - 172800000),
      hearts: 5,
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState<'me' | 'partner'>('me');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: LoveNote = {
      id: Date.now().toString(),
      content: newNote,
      author,
      createdAt: new Date(),
      hearts: 0,
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
    setIsAdding(false);
  };

  const handleHeart = (id: string) => {
    setNotes(notes.map(n => 
      n.id === id ? { ...n, hearts: n.hearts + 1 } : n
    ));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Love Notes" 
        subtitle="Little words that mean everything"
        emoji="💕"
      />

      <div className="px-4 space-y-4">
        <AnimatePresence>
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <LoveNoteCard note={note} onHeart={handleHeart} />
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Heart className="w-12 h-12 mx-auto mb-4 text-rose-light" />
            <p className="text-muted-foreground">
              No love notes yet. Write the first one! 💕
            </p>
          </motion.div>
        )}
      </div>

      <AddButton onClick={() => setIsAdding(true)} label="Write a note" />

      {/* Add Note Modal */}
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
                  Write a Love Note 💌
                </h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAuthor('me')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                    author === 'me' 
                      ? 'gradient-romantic text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  From Me ❤️
                </button>
                <button
                  onClick={() => setAuthor('partner')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                    author === 'partner' 
                      ? 'gradient-romantic text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  From My Love 💕
                </button>
              </div>

              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="What do you love about them?"
                className="w-full h-32 p-4 rounded-2xl bg-muted border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="w-full mt-4 py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                Send Love
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoveNotes;
