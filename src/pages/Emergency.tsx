import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Plus, HeartPulse, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { AddButton } from '@/components/AddButton';
import { useSupabaseDataWithAuthor } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EmergencyProtocol } from '@/types';

// Transform from DB format to app format
const transformProtocol = (dbEntry: any, currentUserId?: string): EmergencyProtocol => ({
    id: dbEntry.id,
    author: dbEntry.author_id === currentUserId ? 'me' : 'partner',
    emotion: dbEntry.emotion,
    triggerDescription: dbEntry.trigger_description || undefined,
    whatINeed: dbEntry.what_i_need,
    whatNotToDo: dbEntry.what_not_to_do || undefined,
    createdAt: new Date(dbEntry.created_at),
});

const Emergency = () => {
    const { user } = useAuth();
    const {
        data: protocols,
        loading,
        addItem,
    } = useSupabaseDataWithAuthor<EmergencyProtocol>({
        table: 'emergency_protocols',
        orderBy: { column: 'created_at', ascending: false },
        transform: (p) => transformProtocol(p, user?.id),
    });

    const [activeTab, setActiveTab] = useState('partner');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [emotion, setEmotion] = useState('');
    const [trigger, setTrigger] = useState('');
    const [whatINeed, setWhatINeed] = useState('');
    const [whatNotToDo, setWhatNotToDo] = useState('');

    const handleAddSubmit = async () => {
        if (!emotion.trim() || !whatINeed.trim()) return;
        setSubmitting(true);
        await addItem({
            emotion: emotion.trim(),
            trigger_description: trigger.trim() || null,
            what_i_need: whatINeed.trim(),
            what_not_to_do: whatNotToDo.trim() || null,
        } as any);

        setEmotion('');
        setTrigger('');
        setWhatINeed('');
        setWhatNotToDo('');
        setIsDialogOpen(false);
        setSubmitting(false);
    };

    const myProtocols = protocols.filter(p => p.author === 'me');
    const partnerProtocols = protocols.filter(p => p.author === 'partner');

    return (
        <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
            <PageHeader
                title="In Case of Emergency"
                subtitle="Emotional first aid for each other ❤️‍🩹"
                emoji="🚑"
            />

            <div className="px-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="partner">How to help them</TabsTrigger>
                            <TabsTrigger value="me">How to help me</TabsTrigger>
                        </TabsList>

                        <TabsContent value="partner" className="mt-4 space-y-4">
                            {partnerProtocols.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <HeartPulse className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">
                                        Your partner hasn't added any emergency protocols yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {partnerProtocols.map((protocol) => (
                                            <motion.div
                                                key={protocol.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-card rounded-2xl shadow-card border border-rose-100 overflow-hidden"
                                            >
                                                <div className="bg-rose-50 p-3 border-b border-rose-100 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                                    <h3 className="font-semibold text-rose-700">When they are feeling: {protocol.emotion}</h3>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    {protocol.triggerDescription && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Common Triggers:</p>
                                                            <p className="text-sm bg-muted/50 p-2 rounded-lg">{protocol.triggerDescription}</p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                            <Plus className="w-3 h-3" /> What They Need:
                                                        </p>
                                                        <p className="text-sm bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                                            {protocol.whatINeed}
                                                        </p>
                                                    </div>

                                                    {protocol.whatNotToDo && (
                                                        <div>
                                                            <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                                <ShieldAlert className="w-3 h-3" /> What NOT To Do:
                                                            </p>
                                                            <p className="text-sm bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                                                                {protocol.whatNotToDo}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="me" className="mt-4 space-y-4">
                            {myProtocols.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <Stethoscope className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">
                                        Add a protocol to help your partner know exactly what you need when you're overwhelmed.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {myProtocols.map((protocol) => (
                                            <motion.div
                                                key={protocol.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-card rounded-2xl shadow-card border border-primary/20 overflow-hidden"
                                            >
                                                <div className="bg-primary/5 p-3 border-b border-primary/10 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-primary" />
                                                    <h3 className="font-semibold text-primary">When I am feeling: {protocol.emotion}</h3>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    {protocol.triggerDescription && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Common Triggers:</p>
                                                            <p className="text-sm bg-muted/50 p-2 rounded-lg">{protocol.triggerDescription}</p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                            <Plus className="w-3 h-3" /> What I Need:
                                                        </p>
                                                        <p className="text-sm bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                                            {protocol.whatINeed}
                                                        </p>
                                                    </div>

                                                    {protocol.whatNotToDo && (
                                                        <div>
                                                            <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                                <ShieldAlert className="w-3 h-3" /> What NOT To Do:
                                                            </p>
                                                            <p className="text-sm bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                                                                {protocol.whatNotToDo}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            <AddButton onClick={() => { setActiveTab('me'); setIsDialogOpen(true); }} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[90%] max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-romantic text-xl text-center">
                            Add Emergency Protocol 🚑
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-xs font-medium mb-1 block">When I am feeling... (Emotion)</label>
                            <Input
                                placeholder="e.g., Anxious, Angry, Overwhelmed"
                                value={emotion}
                                onChange={(e) => setEmotion(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block">This is usually triggered by... (Optional)</label>
                            <Textarea
                                placeholder="e.g., Work stress, lack of sleep, loud noises"
                                value={trigger}
                                onChange={(e) => setTrigger(e.target.value)}
                                className="min-h-[60px] rounded-xl resize-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block text-green-600">What I need from you:</label>
                            <Textarea
                                placeholder="e.g., Just listen, hold me, make me tea, give me space"
                                value={whatINeed}
                                onChange={(e) => setWhatINeed(e.target.value)}
                                className="min-h-[80px] rounded-xl resize-none text-sm border-green-200 focus-visible:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block text-red-500">What NOT to do: (Optional)</label>
                            <Textarea
                                placeholder="e.g., Don't try to fix it, don't tell me to calm down"
                                value={whatNotToDo}
                                onChange={(e) => setWhatNotToDo(e.target.value)}
                                className="min-h-[80px] rounded-xl resize-none text-sm border-red-200 focus-visible:ring-red-500"
                            />
                        </div>

                        <Button
                            onClick={handleAddSubmit}
                            disabled={!emotion.trim() || !whatINeed.trim() || submitting}
                            className="w-full rounded-xl gradient-romantic text-primary-foreground mt-4"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Stethoscope className="w-4 h-4 mr-2" />
                            )}
                            Save Protocol
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Emergency;
