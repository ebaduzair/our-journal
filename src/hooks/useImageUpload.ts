
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UploadResult {
    path: string;
    url: string;
    error: Error | null;
}

export const useImageUpload = (bucket: string = 'memories') => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const uploadImage = async (file: File): Promise<UploadResult> => {
        if (!supabase) {
            return { path: '', url: '', error: new Error('Supabase client not initialized') };
        }

        setUploading(true);
        setError(null);

        try {
            // Create a unique file path: random_id.ext
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;

            // Use direct fetch API instead of supabase.storage (which hangs)
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            // Get access token from session
            let authToken = supabaseKey;
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                authToken = session.access_token;
                console.log("✅ Using authenticated session for upload");
            } else {
                console.warn("⚠️ No session found, using anon key");
            }

            console.log(`📤 Uploading file: ${fileName}`);

            // Add timeout to prevent hanging forever
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            // Upload using direct REST API
            const uploadResponse = await fetch(
                `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': file.type,
                        'Cache-Control': '3600',
                    },
                    body: file,
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Upload response error:', uploadResponse.status, errorText);
                throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
            }

            console.log('✅ Upload successful:', fileName);

            // Construct public URL
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;

            return { path: fileName, url: publicUrl, error: null };
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setError(err);
            return { path: '', url: '', error: err };
        } finally {
            setUploading(false);
        }
    };

    const uploadMultipleImages = async (files: File[], accessToken?: string): Promise<UploadResult[]> => {
        setUploading(true);
        setError(null);

        const results: UploadResult[] = [];

        // Use direct fetch API instead of supabase.storage (which hangs)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        // Use authenticated token if provided, otherwise fall back to anon key
        let authToken = accessToken;

        if (!authToken) {
            console.warn("⚠️ No access token provided for upload! Attempts to upload to RLS-protected buckets will fail.");
            // Try to get from session as fallback
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                console.log("🔄 Recovered access token from current session");
                authToken = session.access_token;
            } else {
                console.error("❌ No active session found for upload!");
            }
        } else {
            console.log("✅ Using provided access token for upload");
        }

        const effectiveToken = authToken || supabaseKey;

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;

                console.log(`📤 Uploading file: ${fileName}`);
                console.log(`🔑 Auth Status: ${authToken ? 'Authenticated' : 'Anonymous (Risk of RLS Error)'}`);

                // Upload using direct REST API
                const uploadResponse = await fetch(
                    `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${effectiveToken}`,
                            'Content-Type': file.type,
                            'Cache-Control': '3600',
                        },
                        body: file,
                    }
                );

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error('Upload response error:', uploadResponse.status, errorText);
                    results.push({ path: '', url: '', error: new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`) });
                } else {
                    console.log('📤 Upload successful:', fileName);
                    // Construct public URL
                    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
                    results.push({ path: fileName, url: publicUrl, error: null });
                }
            } catch (err: any) {
                console.error('Upload exception:', err);
                results.push({ path: '', url: '', error: err });
            }
        }

        setUploading(false);
        return results;
    };

    return {
        uploadImage,
        uploadMultipleImages,
        uploading,
        error
    };
};
