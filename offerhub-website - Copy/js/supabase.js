// Simple Supabase initialization
console.log('supabase.js loading...');

// Wait for Supabase to be available
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library not loaded yet');
        return false;
    }

    console.log('✅ Supabase library found, initializing...');
    
    const SUPABASE_URL = 'https://xqgmejicgtmftuhtyuwr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZ21lamljZ3RtZnR1aHR5dXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTMxNTEsImV4cCI6MjA3ODA4OTE1MX0.GO1YOiPnrJv_2sPSNp9OSCML5yYR_mLv9OAri_OEg-A';

    try {
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created');

        // Create the global supabaseClient object
        window.supabaseClient = {
            supabase: supabaseClient,
            
            // Authentication functions - SIMPLIFIED VERSION
            // Authentication functions - FIXED VERSION
auth: {
    // FIXED signUp function
    // ✅ FIXED - expects object parameter
signUp: async (credentials) => {
    console.log('🔐 Signup called with:', credentials);
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: credentials.email,
            password: credentials.password
        });
        console.log('📨 Signup response:', { data, error });
        return { data, error };
    } catch (error) {
        console.error('❌ Signup error:', error);
        return { data: null, error };
    }
},  
    
    // FIXED signInWithPassword function
signInWithPassword: async (credentials) => {
    try {
        console.log('🔐 Login called with:', credentials);
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
        });
        console.log('📨 Login response:', { data, error });
        return { data, error };
    } catch (error) {
        console.error('❌ Login error:', error);
        return { data: null, error };
    }
},
    
    signOut: async () => {
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },
    
    getCurrentUser: async () => {
        const { data, error } = await supabaseClient.auth.getUser();
        return { data, error };
    },
    
    getUser: async () => {
        // Alias for getCurrentUser for compatibility
        const { data, error } = await supabaseClient.auth.getUser();
        return { data, error };
    }
},
            
            // Data functions (same as before)
            data: {
                getOffers: async () => {
                    try {
                        const { data, error } = await supabaseClient
                            .from('offers')
                            .select('*, shops(name, location)')
                            .eq('status', 'active')
                            .order('created_at', { ascending: false });
                        return { data, error };
                    } catch (error) {
                        return { data: null, error };
                    }
                },
                
                getShops: async () => {
                    try {
                        const { data, error } = await supabaseClient
                            .from('shops')
                            .select('*')
                            .order('created_at', { ascending: false });
                        return { data, error };
                    } catch (error) {
                        return { data: null, error };
                    }
                },
                
                getShopDetails: async (shopId) => {
                    try {
                        const { data, error } = await supabaseClient
                            .from('shops')
                            .select('*')
                            .eq('id', shopId)
                            .single();
                        return { data, error };
                    } catch (error) {
                        return { data: null, error };
                    }
                },
                
                addOffer: async (offerData) => {
                    try {
                        const { data, error } = await supabaseClient
                            .from('offers')
                            .insert([offerData])
                            .select();
                        return { data, error };
                    } catch (error) {
                        return { data: null, error };
                    }
                },
                
                getShopOffers: async (shopId) => {
                    try {
                        const { data, error } = await supabaseClient
                            .from('offers')
                            .select('*')
                            .eq('shop_id', shopId)
                            .eq('status', 'active')
                            .order('created_at', { ascending: false });
                        return { data, error };
                    } catch (error) {
                        return { data: null, error };
                    }
                },
                
                getShopReviews: async (shopId) => {
                    try {
                        // Try to get reviews from reviews table if it exists
                        const { data, error } = await supabaseClient
                            .from('reviews')
                            .select('*')
                            .eq('shop_id', shopId)
                            .order('created_at', { ascending: false });
                        // If reviews table doesn't exist, return empty array
                        if (error && error.code === 'PGRST116') {
                            return { data: [], error: null };
                        }
                        return { data, error };
                    } catch (error) {
                        // Return empty array if table doesn't exist
                        return { data: [], error: null };
                    }
                },
                
                getOfferById: async (offerId) => {
                    try {
                        const { data, error } = await supabaseClient
                            .from('offers')
                            .select('*, shops(name, location, description)')
                            .eq('id', offerId)
                            .single();
                        return { data, error };
                    } catch (error) {
                        return { data: null, error };
                    }
                }
            },
            
            testConnection: async () => {
                try {
                    const { data, error } = await supabaseClient
                        .from('shops')
                        .select('*')
                        .limit(1);
                    return !error;
                } catch (err) {
                    return false;
                }
            }
        };

        console.log('✅ Supabase client fully initialized');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating Supabase client:', error);
        return false;
    }
}

// Try to initialize immediately
if (typeof supabase !== 'undefined') {
    initSupabase();
} else {
    console.log('⏳ Waiting for Supabase library...');
    setTimeout(() => {
        if (typeof supabase !== 'undefined') {
            initSupabase();
        } else {
            console.error('❌ Supabase library never loaded');
        }
    }, 1000);
}