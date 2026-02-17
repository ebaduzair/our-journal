import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Settings as SettingsIcon, LogOut, Copy, Check, Heart, User, Users, Sun, Moon, Monitor, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ] as const;

    const handleCopyCode = () => {
        if (profile?.couple_code) {
            navigator.clipboard.writeText(profile.couple_code);
            setCopied(true);
            toast({
                title: 'Copied! 💕',
                description: 'Couple code copied to clipboard',
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await signOut();
            navigate('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: 'Logout failed',
                description: 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8 pb-6 px-4"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full gradient-romantic flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-romantic text-2xl font-bold text-gradient">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your account</p>
                    </div>
                </div>
            </motion.div>

            <div className="px-4 space-y-4">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl bg-card shadow-card"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold text-foreground">Profile</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Display Name</span>
                            <span className="text-sm font-medium text-foreground">
                                {profile?.display_name || 'Not set'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Email</span>
                            <span className="text-sm font-medium text-foreground">
                                {user?.email || 'Not set'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Couple Code Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl bg-card shadow-card"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold text-foreground">Couple Connection</h2>
                    </div>

                    {profile?.couple_code ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">Your Couple Code</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-bold text-primary tracking-widest">
                                        {profile.couple_code}
                                    </span>
                                    <Button
                                        onClick={handleCopyCode}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Share this code with your partner to connect your journals together 💕
                            </p>
                            {profile?.partner_id && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                                    <Heart className="w-4 h-4 text-green-500 fill-green-500" />
                                    <span className="text-sm text-green-700">Connected with your partner!</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No couple code generated yet.
                        </p>
                    )}
                </motion.div>

                {/* Appearance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 rounded-2xl bg-card shadow-card"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold text-foreground">Appearance</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {themeOptions.map((option) => {
                            const Icon = option.icon;
                            const isActive = theme === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${isActive
                                            ? 'border-primary bg-primary/10 shadow-soft'
                                            : 'border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                    />
                                    <span
                                        className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                    >
                                        {option.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTheme"
                                            className="absolute inset-0 rounded-xl border-2 border-primary"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Logout Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-4 rounded-2xl bg-card shadow-card"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <LogOut className="w-4 h-4 text-destructive" />
                        <h2 className="font-semibold text-foreground">Account</h2>
                    </div>

                    <Button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        variant="destructive"
                        className="w-full rounded-xl"
                    >
                        {loggingOut ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Heart className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </>
                        )}
                    </Button>
                </motion.div>

                {/* App Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="text-center py-6"
                >
                    <Heart className="w-6 h-6 mx-auto text-primary fill-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Our Love Journal</p>
                    <p className="text-xs text-muted-foreground">Made with 💕</p>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
