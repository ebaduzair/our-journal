import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { LoveNoteCard } from '@/components/LoveNoteCard';
import { AddButton } from '@/components/AddButton';
import { useSupabaseDataWithAuthor } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import type { LoveNote } from '@/types';
import { X, Send, Heart, Loader2 } from 'lucide-react';

// Transform from DB format to app format
const transformNote = (dbNote: any): LoveNote => ({
  id: dbNote.id,
  content: dbNote.content,
  author: dbNote.author_id === dbNote._currentUserId ? 'me' : 'partner',
  createdAt: new Date(dbNote.created_at),
  hearts: dbNote.hearts || 0,
});

const LoveNotes = () => {
  const { user } = useAuth();
  const {
    data: notes,
    loading,
    addItem,
    updateItem,
    isAuthor
  } = useSupabaseDataWithAuthor<LoveNote>({
    table: 'love_notes',
    orderBy: { column: 'created_at', ascending: false },
    transform: (note) => ({
      ...transformNote({ ...note, _currentUserId: user?.id }),
      _authorId: note.author_id, // Keep for reference
    }),
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);
    await addItem({
      content: newNote,
      hearts: 0,
    } as any);

    setNewNote('');
    setIsAdding(false);
    setSubmitting(false);
  };

  const handleHeart = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      await updateItem(id, { hearts: note.hearts + 1 } as any);
    }
  };

  // Add author info for display
  const notesWithAuthor = notes.map(note => ({
    ...note,
    author: (note as any)._authorId === user?.id ? 'me' as const : 'partner' as const,
  }));

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <PageHeader
        title="Love Notes"
        subtitle="Little words that mean everything"
        emoji="💕"
      />

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence>
            {notesWithAuthor.map((note, index) => (
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
        )}

        {!loading && notes.length === 0 && (
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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60] flex items-end justify-center"
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

              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="What do you love about them?"
                className="w-full h-32 p-4 rounded-2xl bg-muted border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNote}
                disabled={!newNote.trim() || submitting}
                className="w-full mt-4 py-4 rounded-2xl gradient-romantic text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
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
