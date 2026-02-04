import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Send, Heart } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    couple_code: string;
    is_read: boolean;
    created_at: string;
}

const Chat = () => {
    const { user, profile } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!profile?.couple_code) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('couple_code', profile.couple_code)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data);
            }
            setLoading(false);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('chat_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `couple_code=eq.${profile.couple_code}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.couple_code]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !profile?.couple_code) return;

        setSending(true);
        const messageContent = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase.from('chat_messages').insert({
            content: messageContent,
            sender_id: user.id,
            couple_code: profile.couple_code,
        });

        if (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageContent); // Restore message on error
        }

        setSending(false);
        inputRef.current?.focus();
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return format(date, 'h:mm a');
    };

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    const getDateHeaders = () => {
        const headers: { [key: string]: number } = {};
        messages.forEach((msg, index) => {
            const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd');
            if (!(dateKey in headers)) {
                headers[dateKey] = index;
            }
        });
        return headers;
    };

    const dateHeaders = getDateHeaders();

    if (!profile?.couple_code) {
        return (
            <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
                <div className="text-center p-8">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h2 className="font-romantic text-xl mb-2">Connect with your partner first</h2>
                    <p className="text-muted-foreground text-sm">
                        Go to settings to link your account with your partner
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PageHeader
                title="Chat"
                subtitle="Your private love chat 💕"
                emoji="💬"
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                            <Heart className="w-8 h-8 text-primary" />
                        </motion.div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Heart className="w-12 h-12 mx-auto mb-4 text-rose-light" />
                            <p className="text-muted-foreground">
                                Send your first message! 💕
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 pt-4">
                        <AnimatePresence initial={false}>
                            {messages.map((message, index) => {
                                const isMe = message.sender_id === user?.id;
                                const dateKey = format(new Date(message.created_at), 'yyyy-MM-dd');
                                const showDateHeader = dateHeaders[dateKey] === index;

                                return (
                                    <div key={message.id}>
                                        {showDateHeader && (
                                            <div className="flex justify-center my-4">
                                                <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                                                    {formatDateHeader(message.created_at)}
                                                </span>
                                            </div>
                                        )}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${isMe
                                                    ? 'gradient-romantic text-white rounded-br-md'
                                                    : 'bg-muted text-foreground rounded-bl-md'
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed break-words">
                                                    {message.content}
                                                </p>
                                                <p
                                                    className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {formatMessageTime(message.created_at)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="sticky bottom-16 bg-background border-t border-border p-4">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a sweet message..."
                        className="flex-1 px-4 py-3 rounded-full bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-12 h-12 rounded-full gradient-romantic flex items-center justify-center disabled:opacity-50"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
