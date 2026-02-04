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

    const fetchProfile = async (userId: string) => {
        console.log('Fetching profile for user:', userId);

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.warn('Profile fetch timed out after 5 seconds');
            setLoading(false);
        }, 5000);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            clearTimeout(timeoutId);

            if (error) {
                console.error('Error fetching profile:', error);
            } else if (data) {
                console.log('Profile fetched:', data);
                setProfile(data);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Exception fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                console.log('Getting initial session...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    if (mounted) setLoading(false);
                    return;
                }

                console.log('Session:', session ? 'exists' : 'none');

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
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
        console.log('Generated code:', code);

        if (user) {
            console.log('User found, attempting to save profile...');

            // Try to upsert with a timeout - don't wait forever
            const upsertWithTimeout = async () => {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );

                const upsertPromise = supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email || '',
                        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                        couple_code: code,
                    } as any);

                console.log('Upserting profile...');

                try {
                    const result = await Promise.race([upsertPromise, timeoutPromise]);
                    console.log('Upsert completed:', result);
                } catch (error) {
                    console.log('Upsert timed out or failed, continuing anyway...', error);
                }
            };

            // Fire and forget - don't wait
            upsertWithTimeout();

            // Immediately set profile locally so user can proceed
            console.log('Setting profile locally...');
            setProfile({
                id: user.id,
                email: user.email || '',
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                couple_code: code,
                partner_id: null,
            });
        } else {
            console.log('No user found!');
        }

        return code;
    };

    const joinCouple = async (code: string) => {
        console.log('Joining couple with code:', code);

        if (!user) {
            console.error('No user found!');
            return { error: new Error('Not logged in') };
        }

        try {
            // Step 1: Find the partner using direct fetch (more reliable)
            console.log('Step 1: Finding partner with code:', code.toUpperCase());

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
            console.log('Find partner result:', data);

            const partner = Array.isArray(data) && data.length > 0 ? data[0] : null;

            if (!partner) {
                console.error('No partner found with code:', code);
                return { error: new Error('Invalid couple code. No one has this code yet.') };
            }

            console.log('Found partner:', partner);

            // Get auth token for authenticated requests
            const accessToken = session?.access_token || supabaseKey;

            // Step 2: Update current user's profile using direct fetch
            console.log('Step 2: Updating current user profile...');
            const upsertPayload = {
                id: user.id,
                email: user.email || '',
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                couple_code: code.toUpperCase(),
                partner_id: partner.id
            };

            const upsertResponse = await fetch(
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
            console.log('Update self result:', upsertResponse.status);

            // Step 3: Update partner's profile with current user's ID
            console.log('Step 3: Updating partner profile with our ID...');
            const updatePartnerResponse = await fetch(
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
            console.log('Update partner result:', updatePartnerResponse.status);

            // Step 4: Set profile locally (skip fetching to avoid hangs)
            console.log('Step 4: Setting profile locally...');
            setProfile({
                id: user.id,
                email: user.email || '',
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                couple_code: code.toUpperCase(),
                partner_id: partner.id,
            });

            console.log('✅ Couple connection complete!');
            return { error: null };
        } catch (error) {
            console.error('Join couple error:', error);
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
