import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Heart, BookOpen, MessageCircle, Wind, 
  Plus, ChevronDown, ChevronUp, Check, Sparkles,
  RefreshCw, ArrowRight, Clock, X
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import type { WorryEntry, ReassuranceCard, RealityCheckAnswer, CalmSession } from '@/types';
import { 
  breathingExercises, 
  groundingExercises, 
  coupleAffirmations, 
  realityCheckQuestions,
  reframePrompts,
  defaultReassurances 
} from '@/data/mindfulMoments';
import { format } from 'date-fns';

const MindfulMoments = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('worry');
  
  // Local storage for all data
  const [worries, setWorries] = useLocalStorage<WorryEntry[]>('worry-entries', []);
  const [reassurances, setReassurances] = useLocalStorage<ReassuranceCard[]>('reassurance-cards', []);
  const [realityChecks, setRealityChecks] = useLocalStorage<RealityCheckAnswer[]>('reality-checks', []);
  const [calmSessions, setCalmSessions] = useLocalStorage<CalmSession[]>('calm-sessions', []);
  
  // UI state
  const [showWorryForm, setShowWorryForm] = useState(false);
  const [showReassuranceForm, setShowReassuranceForm] = useState(false);
  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState<string | null>(null);
  const [showGrounding, setShowGrounding] = useState<string | null>(null);
  const [expandedWorry, setExpandedWorry] = useState<string | null>(null);
  
  // Form state
  const [newWorry, setNewWorry] = useState('');
  const [newReframe, setNewReframe] = useState('');
  const [newReassurance, setNewReassurance] = useState('');
  const [currentReframePrompt, setCurrentReframePrompt] = useState(reframePrompts[0]);
  
  // Reality check form
  const [realityWorry, setRealityWorry] = useState('');
  const [realityEvidence, setRealityEvidence] = useState('');
  const [realityLikelihood, setRealityLikelihood] = useState([3]);
  const [realityWorstCase, setRealityWorstCase] = useState('');
  const [realityCopingPlan, setRealityCopingPlan] = useState('');

  // Breathing exercise state
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState<NodeJS.Timeout | null>(null);
  const [breathingComplete, setBreathingComplete] = useState(false);

  // Random affirmation
  const [currentAffirmation, setCurrentAffirmation] = useState(
    coupleAffirmations[Math.floor(Math.random() * coupleAffirmations.length)]
  );

  const shuffleReframePrompt = () => {
    const newPrompt = reframePrompts[Math.floor(Math.random() * reframePrompts.length)];
    setCurrentReframePrompt(newPrompt);
  };

  const shuffleAffirmation = () => {
    const newAffirmation = coupleAffirmations[Math.floor(Math.random() * coupleAffirmations.length)];
    setCurrentAffirmation(newAffirmation);
  };

  const addWorry = () => {
    if (!newWorry.trim() || !newReframe.trim()) return;
    
    const entry: WorryEntry = {
      id: Date.now().toString(),
      worry: newWorry.trim(),
      reframe: newReframe.trim(),
      createdAt: new Date(),
      author: 'me',
      isResolved: false,
    };
    
    setWorries([entry, ...worries]);
    setNewWorry('');
    setNewReframe('');
    setShowWorryForm(false);
    toast({ title: "Worry reframed! 💪", description: "You're doing great facing your thoughts." });
  };

  const toggleWorryResolved = (id: string) => {
    setWorries(worries.map(w => 
      w.id === id ? { ...w, isResolved: !w.isResolved } : w
    ));
  };

  const addReassurance = () => {
    if (!newReassurance.trim()) return;
    
    const card: ReassuranceCard = {
      id: Date.now().toString(),
      message: newReassurance.trim(),
      author: 'me',
      createdAt: new Date(),
    };
    
    setReassurances([card, ...reassurances]);
    setNewReassurance('');
    setShowReassuranceForm(false);
    toast({ title: "Reassurance saved! 💝", description: "Ready for when it's needed most." });
  };

  const submitRealityCheck = () => {
    if (!realityWorry.trim()) return;
    
    const check: RealityCheckAnswer = {
      id: Date.now().toString(),
      worry: realityWorry.trim(),
      answers: {
        evidence: realityEvidence.trim(),
        likelihood: realityLikelihood[0],
        worstCase: realityWorstCase.trim(),
        copingPlan: realityCopingPlan.trim(),
      },
      createdAt: new Date(),
      author: 'me',
    };
    
    setRealityChecks([check, ...realityChecks]);
    setRealityWorry('');
    setRealityEvidence('');
    setRealityLikelihood([3]);
    setRealityWorstCase('');
    setRealityCopingPlan('');
    setShowRealityCheck(false);
    toast({ title: "Reality check complete! 🧠", description: "You've gained perspective on this worry." });
  };

  const startBreathingExercise = (exerciseId: string) => {
    const exercise = breathingExercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    setShowBreathingExercise(exerciseId);
    setBreathingPhase(0);
    setBreathingComplete(false);
    
    let phase = 0;
    const timer = setInterval(() => {
      phase = (phase + 1) % exercise.instructions.length;
      setBreathingPhase(phase);
    }, 4000);
    
    setBreathingTimer(timer);
    
    // Complete after duration
    setTimeout(() => {
      if (timer) clearInterval(timer);
      setBreathingComplete(true);
      
      const session: CalmSession = {
        id: Date.now().toString(),
        type: 'breathing',
        completedAt: new Date(),
        durationSeconds: exercise.duration,
        completedTogether: true,
      };
      setCalmSessions([session, ...calmSessions]);
    }, exercise.duration * 1000);
  };

  const stopBreathingExercise = () => {
    if (breathingTimer) clearInterval(breathingTimer);
    setShowBreathingExercise(null);
    setBreathingPhase(0);
    setBreathingComplete(false);
  };

  // Get all reassurances (user + defaults)
  const allReassurances = reassurances.length > 0 
    ? reassurances 
    : defaultReassurances.map((msg, i) => ({ 
        id: `default-${i}`, 
        message: msg, 
        author: 'partner' as const,
        createdAt: new Date() 
      }));

  const randomReassurance = allReassurances[Math.floor(Math.random() * allReassurances.length)];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Mindful Moments" 
        subtitle="Tools to calm overthinking together"
        emoji="🧘"
      />

      <div className="px-4 space-y-4">
        {/* Quick Affirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-coral/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Couple Affirmation
                    </span>
                  </div>
                  <p className="font-romantic text-lg text-foreground">
                    "{currentAffirmation}"
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shuffleAffirmation}
                  className="shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="worry" className="flex flex-col py-2 px-1 text-xs">
              <BookOpen className="w-4 h-4 mb-1" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="reassure" className="flex flex-col py-2 px-1 text-xs">
              <Heart className="w-4 h-4 mb-1" />
              Reassure
            </TabsTrigger>
            <TabsTrigger value="reality" className="flex flex-col py-2 px-1 text-xs">
              <Brain className="w-4 h-4 mb-1" />
              Reality
            </TabsTrigger>
            <TabsTrigger value="calm" className="flex flex-col py-2 px-1 text-xs">
              <Wind className="w-4 h-4 mb-1" />
              Calm
            </TabsTrigger>
          </TabsList>

          {/* Worry Journal Tab */}
          <TabsContent value="worry" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Worry Journal
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Write down worries and reframe them with perspective
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showWorryForm ? (
                  <Button 
                    onClick={() => setShowWorryForm(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Worry to Reframe
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-sm font-medium mb-1 block">What's worrying you?</label>
                      <Textarea
                        value={newWorry}
                        onChange={(e) => setNewWorry(e.target.value)}
                        placeholder="Write your worry here..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Reframe prompt:</span>
                        <Button variant="ghost" size="sm" onClick={shuffleReframePrompt}>
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm italic text-foreground">{currentReframePrompt}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Your reframed thought:</label>
                      <Textarea
                        value={newReframe}
                        onChange={(e) => setNewReframe(e.target.value)}
                        placeholder="Write a healthier perspective..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={addWorry} className="flex-1">
                        Save Entry
                      </Button>
                      <Button variant="outline" onClick={() => setShowWorryForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Past Entries */}
            {worries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Past Entries</h3>
                {worries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className={entry.isResolved ? 'opacity-60' : ''}>
                      <CardContent className="p-3">
                        <div 
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => setExpandedWorry(expandedWorry === entry.id ? null : entry.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                              </span>
                              {entry.isResolved && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium line-clamp-2">{entry.worry}</p>
                          </div>
                          {expandedWorry === entry.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {expandedWorry === entry.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-border"
                            >
                              <div className="mb-3">
                                <span className="text-xs font-medium text-muted-foreground block mb-1">
                                  Reframed thought:
                                </span>
                                <p className="text-sm text-foreground bg-muted/50 p-2 rounded-lg">
                                  {entry.reframe}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleWorryResolved(entry.id)}
                              >
                                {entry.isResolved ? 'Mark Unresolved' : 'Mark as Resolved'}
                                <Check className="w-3 h-3 ml-2" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reassurance Cards Tab */}
          <TabsContent value="reassure" className="space-y-4 mt-4">
            {/* Random Reassurance */}
            <Card className="bg-gradient-to-br from-rose-light to-gold-light border-rose-light">
              <CardContent className="p-5 text-center">
                <Heart className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="font-romantic text-xl text-foreground mb-2">
                  "{randomReassurance.message}"
                </p>
                <p className="text-xs text-muted-foreground">
                  From your {randomReassurance.author === 'me' ? 'collection' : 'partner'}
                </p>
              </CardContent>
            </Card>

            {/* Add New Reassurance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Reassurance Cards
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Save comforting messages for anxious moments
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showReassuranceForm ? (
                  <Button 
                    onClick={() => setShowReassuranceForm(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Reassurance
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <Textarea
                      value={newReassurance}
                      onChange={(e) => setNewReassurance(e.target.value)}
                      placeholder="Write a loving reassurance for your partner..."
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={addReassurance} className="flex-1">
                        Save Card
                      </Button>
                      <Button variant="outline" onClick={() => setShowReassuranceForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Saved Reassurances */}
                {reassurances.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {reassurances.slice(0, 4).map((card) => (
                      <div 
                        key={card.id}
                        className="p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <p className="text-sm">"{card.message}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reality Check Tab */}
          <TabsContent value="reality" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Reality Check Quiz
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ground spiraling thoughts with facts
                </p>
              </CardHeader>
              <CardContent>
                {!showRealityCheck ? (
                  <Button 
                    onClick={() => setShowRealityCheck(true)}
                    className="w-full"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Start Reality Check
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        What's the worry you're checking?
                      </label>
                      <Textarea
                        value={realityWorry}
                        onChange={(e) => setRealityWorry(e.target.value)}
                        placeholder="Describe the thought that's bothering you..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {realityCheckQuestions[0].question}
                      </label>
                      <Textarea
                        value={realityEvidence}
                        onChange={(e) => setRealityEvidence(e.target.value)}
                        placeholder={realityCheckQuestions[0].placeholder}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {realityCheckQuestions[1].question}
                      </label>
                      <div className="px-2">
                        <Slider
                          value={realityLikelihood}
                          onValueChange={setRealityLikelihood}
                          min={1}
                          max={5}
                          step={1}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Very unlikely</span>
                          <span>Very likely</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {realityCheckQuestions[2].question}
                      </label>
                      <Textarea
                        value={realityWorstCase}
                        onChange={(e) => setRealityWorstCase(e.target.value)}
                        placeholder={realityCheckQuestions[2].placeholder}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {realityCheckQuestions[3].question}
                      </label>
                      <Textarea
                        value={realityCopingPlan}
                        onChange={(e) => setRealityCopingPlan(e.target.value)}
                        placeholder={realityCheckQuestions[3].placeholder}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={submitRealityCheck} className="flex-1">
                        Complete Check
                      </Button>
                      <Button variant="outline" onClick={() => setShowRealityCheck(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Past Reality Checks */}
            {realityChecks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Past Checks</h3>
                {realityChecks.slice(0, 3).map((check) => (
                  <Card key={check.id}>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(check.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm font-medium mb-2">{check.worry}</p>
                      <div className="text-xs text-muted-foreground">
                        Likelihood: {check.answers.likelihood}/5
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Calm Together Tab */}
          <TabsContent value="calm" className="space-y-4 mt-4">
            {/* Breathing Exercises */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary" />
                  Breathing Exercises
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {breathingExercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => startBreathingExercise(exercise.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{exercise.emoji}</span>
                        <div>
                          <h4 className="font-medium text-sm">{exercise.name}</h4>
                          <p className="text-xs text-muted-foreground">{exercise.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {Math.ceil(exercise.duration / 60)}m
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grounding Exercises */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  🌍 Grounding Exercises
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {groundingExercises.map((exercise) => (
                  <Dialog key={exercise.id}>
                    <DialogTrigger asChild>
                      <div 
                        className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{exercise.emoji}</span>
                            <div>
                              <h4 className="font-medium text-sm">{exercise.name}</h4>
                              <p className="text-xs text-muted-foreground">{exercise.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span>{exercise.emoji}</span>
                          {exercise.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {exercise.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{step.sense}</h4>
                              <p className="text-sm text-muted-foreground">{step.prompt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </CardContent>
            </Card>

            {/* Session Stats */}
            {calmSessions.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Calm sessions completed</p>
                      <p className="text-xs text-muted-foreground">Together you're getting calmer</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {calmSessions.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Breathing Exercise Modal */}
      <Dialog open={!!showBreathingExercise} onOpenChange={() => stopBreathingExercise()}>
        <DialogContent className="text-center">
          {showBreathingExercise && (() => {
            const exercise = breathingExercises.find(e => e.id === showBreathingExercise);
            if (!exercise) return null;
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center">
                    {exercise.emoji} {exercise.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="py-8">
                  {!breathingComplete ? (
                    <>
                      <motion.div
                        key={breathingPhase}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6"
                      >
                        <div className="w-32 h-32 mx-auto rounded-full gradient-romantic flex items-center justify-center">
                          <motion.div
                            animate={{ 
                              scale: breathingPhase === 0 || breathingPhase === 2 ? [1, 1.2] : [1.2, 1] 
                            }}
                            transition={{ duration: 4, ease: "easeInOut" }}
                            className="w-24 h-24 rounded-full bg-primary-foreground/30"
                          />
                        </div>
                      </motion.div>
                      <p className="text-xl font-medium text-foreground">
                        {exercise.instructions[breathingPhase]}
                      </p>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <Check className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-xl font-medium text-foreground">Great job! 💕</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        You completed this together
                      </p>
                    </motion.div>
                  )}
                </div>
                
                <Button variant="outline" onClick={stopBreathingExercise}>
                  {breathingComplete ? 'Close' : 'Stop Early'}
                </Button>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MindfulMoments;
