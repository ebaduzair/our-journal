import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mic, Plus, ArrowLeft, Trash2, CheckCircle2, Circle, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { SharedMedia, MediaNote } from '@/types';
import { format } from 'date-fns';

const emojiOptions = ['📚', '🎧', '🧠', '💡', '🌱', '❤️', '💼', '🚀', '🧘'];

const BookClub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Library view vs Detail view
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  
  // New Media Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newType, setNewType] = useState<'book' | 'podcast'>('book');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  
  // New Note
  const [newNote, setNewNote] = useState('');
  const [newNoteChapter, setNewNoteChapter] = useState('');
  const [isKeyTakeaway, setIsKeyTakeaway] = useState(false);

  const { data: mediaList, loading: mediaLoading, addItem: addMedia, updateItem: updateMedia, deleteItem: deleteMedia } = useSupabaseData<SharedMedia>({
    table: 'shared_media',
    orderBy: { column: 'created_at', ascending: false },
  });

  const { data: notes, loading: notesLoading, addItem: addNote, deleteItem: deleteNote } = useSupabaseData<MediaNote>({
    table: 'media_notes',
    orderBy: { column: 'created_at', ascending: true },
  });

  const selectedMedia = mediaList.find(m => m.id === selectedMediaId);
  const selectedNotes = notes.filter(n => n.media_id === selectedMediaId);

  const handleAddMedia = async () => {
    if (!newTitle.trim()) return;

    try {
      await addMedia({
        title: newTitle.trim(),
        author_or_host: newAuthor.trim(),
        cover_emoji: newEmoji,
        type: newType,
        status: 'reading',
        current_chapter: '',
        total_chapters: '',
        created_by: user?.id || '',
      } as any);

      setNewTitle('');
      setNewAuthor('');
      setNewEmoji('📚');
      setAddDialogOpen(false);
      toast({ title: 'Added to library! 📚' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (mediaId: string, status: 'reading' | 'finished' | 'paused') => {
    try {
      await updateMedia(mediaId, { status });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      // Notes are cascading deleted in DB
      await deleteMedia(mediaId);
      if (selectedMediaId === mediaId) {
        setSelectedMediaId(null);
      }
      toast({ title: 'Removed from library' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedMediaId || !user) return;

    try {
      await addNote({
        media_id: selectedMediaId,
        chapter: newNoteChapter.trim(),
        content: newNote.trim(),
        is_key_takeaway: isKeyTakeaway,
        author_id: user.id,
      } as any);

      setNewNote('');
      setNewNoteChapter('');
      setIsKeyTakeaway(false);
      toast({ title: 'Note added!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' });
    }
  };

  // --- RENDERING DETAIL VIEW ---
  if (selectedMediaId && selectedMedia) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMediaId(null)}
              className="w-10 h-10 rounded-full bg-card shadow-sm border border-border/50 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            
            <div className="flex gap-2">
              <Button
                variant={selectedMedia.status === 'reading' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdateStatus(selectedMedia.id, 'reading')}
                className="h-8 rounded-full text-xs"
              >
                {selectedMedia.type === 'podcast' ? 'Listening' : 'Reading'}
              </Button>
              <Button
                variant={selectedMedia.status === 'finished' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdateStatus(selectedMedia.id, 'finished')}
                className="h-8 rounded-full text-xs"
              >
                Finished
              </Button>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{selectedMedia.cover_emoji}</div>
            <h1 className="text-2xl font-romantic font-semibold text-foreground mb-1">{selectedMedia.title}</h1>
            <p className="text-sm text-muted-foreground">{selectedMedia.author_or_host}</p>
          </div>

          <div className="space-y-6">
            <h3 className="font-medium flex items-center gap-2 px-1">
              <MessageSquare className="w-4 h-4 text-primary" />
              Discussion Notes
            </h3>

            {/* Notes List */}
            <div className="space-y-4">
              {selectedNotes.map(note => {
                const isMe = note.author_id === user?.id;
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl max-w-[85%] ${
                      isMe 
                        ? 'bg-primary/10 border border-primary/20 ml-auto rounded-tr-sm' 
                        : 'bg-card border border-border/50 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        {isMe ? 'Me' : 'Partner'} {note.chapter && `• ${note.chapter}`}
                      </span>
                      {note.is_key_takeaway && <Star className="w-3 h-3 text-gold fill-gold" />}
                    </div>
                    <p className="text-sm text-foreground/90">{note.content}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                      <span className="text-[10px] opacity-50">
                        {format(new Date(note.created_at), 'MMM d, h:mm a')}
                      </span>
                      {isMe && (
                        <button onClick={() => deleteNote(note.id)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add Note Form */}
            <div className="bg-card p-4 rounded-3xl shadow-sm border border-border/50 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Chapter/Ep (e.g. Ch 3)"
                  value={newNoteChapter}
                  onChange={e => setNewNoteChapter(e.target.value)}
                  className="w-1/3 rounded-xl text-sm h-9"
                />
                <button
                  onClick={() => setIsKeyTakeaway(!isKeyTakeaway)}
                  className={`flex-1 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors border ${
                    isKeyTakeaway 
                      ? 'bg-amber-50 text-amber-600 border-amber-200' 
                      : 'bg-muted/50 text-muted-foreground border-transparent'
                  }`}
                >
                  <Star className={`w-3 h-3 ${isKeyTakeaway ? 'fill-amber-600' : ''}`} />
                  Key Takeaway
                </button>
              </div>
              <textarea
                placeholder="What did you think..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full rounded-xl gradient-romantic text-white">
                Post Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING LIBRARY VIEW ---
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <motion.div whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center border border-border/50">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-romantic font-semibold text-gradient">Book & Podcast Club</h1>
            <p className="text-xs text-muted-foreground">Learn and grow together 📖</p>
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full gradient-romantic shadow-glow flex items-center justify-center"
              >
                <Plus className="w-5 h-5 text-white" />
              </motion.button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-[90vw]">
              <DialogHeader>
                <DialogTitle className="font-romantic text-xl">Add to Library</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setNewType('book')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${newType === 'book' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  >
                    <BookOpen className="w-4 h-4" /> Book
                  </button>
                  <button
                    onClick={() => setNewType('podcast')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${newType === 'podcast' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  >
                    <Mic className="w-4 h-4" /> Podcast
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input placeholder="e.g. The 5 Love Languages" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Author / Host</label>
                  <Input placeholder="e.g. Gary Chapman" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} className="rounded-xl" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Cover Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {emojiOptions.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setNewEmoji(emoji)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                          newEmoji === emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddMedia} disabled={!newTitle.trim()} className="w-full rounded-xl gradient-romantic text-white">
                  Add to Library
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Library Grid */}
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {mediaList.map((media) => (
              <motion.div
                key={media.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <button
                  onClick={() => setSelectedMediaId(media.id)}
                  className="w-full text-left bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-4xl filter drop-shadow-sm">{media.cover_emoji}</div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      media.status === 'finished' ? 'bg-emerald-100 text-emerald-600' : 
                      media.status === 'reading' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {media.status === 'reading' && media.type === 'podcast' ? 'listening' : media.status}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-1">{media.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{media.author_or_host}</p>
                    
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 w-fit px-2 py-1 rounded-md">
                      {media.type === 'book' ? <BookOpen className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      <span className="capitalize">{media.type}</span>
                    </div>
                  </div>
                </button>
                
                {/* Delete button (only visible on hover/long press in a real app, but directly available here for simplicity) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteMedia(media.id); }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {mediaList.length === 0 && !mediaLoading && (
             <div className="col-span-2 text-center py-12 px-4 border-2 border-dashed border-border rounded-3xl mt-4">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
               <BookOpen className="w-8 h-8 text-muted-foreground" />
             </div>
             <p className="font-medium">Library is empty</p>
             <p className="text-xs text-muted-foreground mt-1">Add a book or podcast you want to learn from together.</p>
           </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookClub;
