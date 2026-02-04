import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Mail, Lock, User, Users, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showCoupleSetup, setShowCoupleSetup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [coupleCode, setCoupleCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signIn, signUp, createCoupleCode, joinCouple, profile, user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    toast({
                        title: 'Login failed',
                        description: error.message,
                        variant: 'destructive',
                    });
                }
            } else {
                const { error } = await signUp(email, password, displayName);
                if (error) {
                    toast({
                        title: 'Sign up failed',
                        description: error.message,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: 'Account created! 💕',
                        description: 'Please check your email to verify your account.',
                    });
                    setShowCoupleSetup(true);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCode = async () => {
        console.log('Generate button clicked!');
        try {
            const code = await createCoupleCode();
            console.log('Code generated:', code);
            setGeneratedCode(code);
        } catch (error) {
            console.error('Error generating code:', error);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoinCouple = async () => {
        setLoading(true);
        const { error } = await joinCouple(coupleCode);
        if (error) {
            toast({
                title: 'Failed to join',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Connected! 💕',
                description: "You're now linked with your partner!",
            });
        }
        setLoading(false);
    };

    // Check if user needs couple setup (profile exists but no couple code, or profile is null but user is logged in)
    // Also keep showing if we just generated a code so user can see/copy it
    if (user && (!profile || !profile.couple_code || generatedCode)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="inline-block"
                        >
                            <Users className="w-16 h-16 mx-auto text-primary mb-4" />
                        </motion.div>
                        <h1 className="font-romantic text-3xl font-bold text-gradient mb-2">
                            Connect with Your Partner
                        </h1>
                        <p className="text-muted-foreground">
                            Share your love journal together 💕
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-card space-y-6">
                        {/* Create Code Section */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Heart className="w-4 h-4 text-primary" />
                                Start a New Journal
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Create a code and share it with your partner
                            </p>
                            {generatedCode ? (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-4 bg-muted rounded-xl text-center font-mono text-2xl font-bold text-primary tracking-widest">
                                            {generatedCode}
                                        </div>
                                        <Button
                                            onClick={handleCopyCode}
                                            variant="outline"
                                            className="rounded-xl"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Share this code with your partner to connect your journals!
                                    </p>
                                    <Button
                                        onClick={() => setGeneratedCode('')}
                                        className="w-full rounded-xl gradient-romantic text-white"
                                    >
                                        Continue to App 💕
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleCreateCode}
                                    className="w-full rounded-xl gradient-romantic text-white"
                                >
                                    Generate Couple Code
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-muted-foreground text-sm">or</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Join Section */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Join Your Partner
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Enter the code your partner shared with you
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={coupleCode}
                                    onChange={(e) => setCoupleCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    className="rounded-xl font-mono text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                                <Button
                                    onClick={handleJoinCouple}
                                    disabled={coupleCode.length !== 6 || loading}
                                    className="rounded-xl gradient-romantic text-white px-6"
                                >
                                    Join
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="inline-block"
                    >
                        <Heart className="w-16 h-16 mx-auto text-primary fill-primary mb-4" />
                    </motion.div>
                    <h1 className="font-romantic text-3xl font-bold text-gradient mb-2">
                        Our Love Journal
                    </h1>
                    <p className="text-muted-foreground">
                        {isLogin ? 'Welcome back, lovebird! 💕' : 'Start your love story 💕'}
                    </p>
                </div>

                {/* Auth Form */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Your Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="What should we call you?"
                                        className="pl-12 rounded-xl h-12"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="pl-12 rounded-xl h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 rounded-xl h-12"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl gradient-romantic text-white font-semibold"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    <Heart className="w-5 h-5" />
                                </motion.div>
                            ) : isLogin ? (
                                'Sign In'
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isLogin ? (
                                <>
                                    Don't have an account?{' '}
                                    <span className="font-semibold text-primary">Sign up</span>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <span className="font-semibold text-primary">Sign in</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
