import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseSupabaseDataOptions<T> {
    table: string;
    orderBy?: { column: string; ascending?: boolean };
    transform?: (data: any) => T;
    reverseTransform?: (data: T) => any;
}

export function useSupabaseData<T extends { id: string }>(
    options: UseSupabaseDataOptions<T>
) {
    const { table, orderBy, transform, reverseTransform } = options;
    const { profile, user, session } = useAuth();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const coupleCode = profile?.couple_code;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // Use session token for authenticated operations, fallback to anon key
    const accessToken = session?.access_token || supabaseKey;

    const orderByColumn = orderBy?.column;
    const orderByAscending = orderBy?.ascending;

    // Fetch data using direct fetch (more reliable than supabase client)
    const fetchData = useCallback(async () => {
        if (!coupleCode) {
            setLoading(false);
            return;
        }

        try {
            let url = `${supabaseUrl}/rest/v1/${table}?couple_code=eq.${coupleCode}`;

            if (orderByColumn) {
                const direction = orderByAscending ? 'asc' : 'desc';
                url += `&order=${orderByColumn}.${direction}`;
            }

            const response = await fetch(url, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            const transformedData = transform
                ? result?.map(transform) ?? []
                : (result as T[]) ?? [];

            setData(transformedData);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${table}:`, err);
            setError(err as Error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [coupleCode, table, orderByColumn, orderByAscending, transform, supabaseUrl, supabaseKey, accessToken]);

    // Subscribe to real-time changes
    useEffect(() => {
        if (!coupleCode) return;

        fetchData();

        const channel: RealtimeChannel = supabase
            .channel(`${table}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: `couple_code=eq.${coupleCode}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newItem = transform
                            ? transform(payload.new)
                            : (payload.new as T);
                        setData((prev) => {
                            // Check if item already exists (avoid duplicates)
                            if (prev.find((item) => item.id === newItem.id)) {
                                return prev;
                            }
                            // Add to beginning or end based on order
                            return orderByAscending === false
                                ? [newItem, ...prev]
                                : [...prev, newItem];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedItem = transform
                            ? transform(payload.new)
                            : (payload.new as T);
                        setData((prev) =>
                            prev.map((item) =>
                                item.id === updatedItem.id ? updatedItem : item
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setData((prev) =>
                            prev.filter((item) => item.id !== (payload.old as any).id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [coupleCode, table, fetchData, transform, orderByColumn, orderByAscending]);

    // Add item using direct fetch
    const addItem = async (item: Omit<T, 'id'>) => {
        if (!coupleCode || !user) return { error: new Error('Not authenticated') };

        try {
            const insertData = reverseTransform
                ? reverseTransform(item as T)
                : {
                    ...item,
                    couple_code: coupleCode,
                };

            // Ensure couple_code is set
            if (!insertData.couple_code) {
                insertData.couple_code = coupleCode;
            }

            // Add author_id ONLY for tables that actually have this column
            const tablesWithAuthorId = ['love_notes', 'love_reasons', 'reasons', 'food_logs', 'water_intake', 'safe_space_entries', 'check_in_entries', 'gratitude_entries', 'worry_entries', 'reassurance_cards', 'reality_check_answers', 'expenses', 'emergency_protocols'];

            if (user?.id && tablesWithAuthorId.includes(table)) {
                insertData.author_id = user.id;
            }

            const response = await fetch(
                `${supabaseUrl}/rest/v1/${table}`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(insertData),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const newItem = Array.isArray(result) ? result[0] : result;

            // Update local state (with deduplication check)
            const transformedItem = transform ? transform(newItem) : (newItem as T);
            setData(prev => {
                // Prevent duplicates
                if (prev.find(item => item.id === transformedItem.id)) {
                    return prev;
                }
                return [transformedItem, ...prev];
            });

            return { data: transformedItem, error: null };
        } catch (err) {
            console.error(`Error adding to ${table}:`, err);
            return { data: null, error: err as Error };
        }
    };

    // Update item using direct fetch
    const updateItem = async (id: string, updates: Partial<T>) => {
        try {
            const updateData = reverseTransform
                ? reverseTransform(updates as T)
                : updates;

            const response = await fetch(
                `${supabaseUrl}/rest/v1/${table}?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(updateData),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const updatedItem = Array.isArray(result) ? result[0] : result;

            // Update local state
            const transformedItem = transform ? transform(updatedItem) : (updatedItem as T);
            setData(prev => prev.map(item => item.id === id ? transformedItem : item));

            return { data: transformedItem, error: null };
        } catch (err) {
            console.error(`Error updating ${table}:`, err);
            return { data: null, error: err as Error };
        }
    };

    // Delete item using direct fetch
    const deleteItem = async (id: string) => {
        try {
            const response = await fetch(
                `${supabaseUrl}/rest/v1/${table}?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Update local state
            setData(prev => prev.filter(item => item.id !== id));

            return { error: null };
        } catch (err) {
            console.error(`Error deleting from ${table}:`, err);
            return { error: err as Error };
        }
    };

    // Set all data (for compatibility with useLocalStorage pattern)
    const setAllData = async (newData: T[]) => {
        setData(newData);
    };

    return {
        data,
        setData: setAllData,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        refetch: fetchData,
    };
}

// Hook for data that needs author tracking (me vs partner)
export function useSupabaseDataWithAuthor<T extends { id: string }>(
    options: UseSupabaseDataOptions<T> & { authorField?: string }
) {
    const { user } = useAuth();
    const result = useSupabaseData<T>(options);

    const isAuthor = useCallback(
        (item: any) => {
            const authorField = options.authorField || 'author_id';
            return item[authorField] === user?.id;
        },
        [user?.id, options.authorField]
    );

    return {
        ...result,
        isAuthor,
        userId: user?.id,
    };
}
