import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
    id: string;
    email: string;
    display_name: string;
    partner_id: string | null;
    couple_code: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    createCoupleCode: () => Promise<string>;
    joinCouple: (code: string) => Promise<{ error: Error | null }>;
    refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string, accessToken?: string) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const token = accessToken || supabaseKey;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${token}`,
                    },
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('[Profile] Fetch failed:', response.status);
                setLoading(false);
                return;
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                console.log('[Profile] Loaded with couple_code:', data[0].couple_code ? 'YES' : 'NO');
                setProfile(data[0]);
            } else {
                console.log('[Profile] No profile found in DB');
            }
        } catch (error) {
            console.error('[Profile] Fetch error:', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    if (mounted) setLoading(false);
                    return;
                }

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id, session.access_token);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id, session.access_token);
                    } else {
                        setProfile(null);
                        setLoading(false);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // Create profile
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: email,
                    display_name: displayName,
                } as any);

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    throw profileError;
                }
            }

            return { error: null };
        } catch (error) {
            console.error('Signup error:', error);
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    const generateCoupleCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const createCoupleCode = async () => {
        const code = generateCoupleCode();

        if (!user) {
            throw new Error('Not logged in');
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const accessToken = session?.access_token || supabaseKey;

        const profileData = {
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            couple_code: code,
        };

        try {
            const response = await fetch(
                `${supabaseUrl}/rest/v1/profiles`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates,return=representation',
                    },
                    body: JSON.stringify(profileData),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save couple code to database');
            }

            await response.json();

            setProfile({
                id: user.id,
                email: user.email || '',
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                couple_code: code,
                partner_id: null,
            });

            return code;
        } catch (error) {
            throw error;
        }
    };

    const joinCouple = async (code: string) => {
        if (!user) {
            return { error: new Error('Not logged in') };
        }

        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(
                `${supabaseUrl}/rest/v1/profiles?select=id,display_name&couple_code=eq.${code.toUpperCase()}`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                    },
                }
            );

            const data = await response.json();
            const partner = Array.isArray(data) && data.length > 0 ? data[0] : null;

            if (!partner) {
                return { error: new Error('Invalid couple code. No one has this code yet.') };
            }

            const accessToken = session?.access_token || supabaseKey;

            const upsertPayload = {
                id: user.id,
                email: user.email || '',
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                couple_code: code.toUpperCase(),
                partner_id: partner.id
            };

            await fetch(
                `${supabaseUrl}/rest/v1/profiles`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates',
                    },
                    body: JSON.stringify(upsertPayload),
                }
            );

            await fetch(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${partner.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ partner_id: user.id }),
                }
            );

            setProfile({
                id: user.id,
                email: user.email || '',
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                couple_code: code.toUpperCase(),
                partner_id: partner.id,
            });

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const refetchProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        createCoupleCode,
        joinCouple,
        refetchProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
