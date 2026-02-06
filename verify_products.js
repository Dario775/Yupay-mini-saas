
import { createClient } from '@supabase/supabase-js';
// Env vars loaded via --env-file

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('Checking products...');

    // 1. Check count of all products
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Error getting product count:', countError);
    else console.log(`Total products in DB: ${count}`);

    // 1.5 Check Stores
    console.log('Checking stores...');
    const { data: stores, error: storesError } = await supabase.from('stores').select('*');
    if (storesError) console.error('Error getting stores:', storesError);
    else {
        console.log(`Total stores: ${stores?.length}`);
        if (stores?.length) {
            const store = stores[0];
            console.log('Using store:', store);

            // TRY INSERT
            console.log('Attempting to insert test product...');
            const { data: newProd, error: insertError } = await supabase.from('products').insert({
                store_id: store.id,
                name: 'Producto Verificacion ' + Date.now(),
                description: 'Creado por script de verificacion',
                price: 100,
                stock: 10,
                category: 'General',
                is_active: true
            }).select().single();

            if (insertError) console.error('INSERT FAILED:', insertError);
            else console.log('INSERT SUCCESS:', newProd);
        }
    }

    // 2. Try to fetch with the exact query used in clientApi
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching active products:', error);
    } else {
        console.log(`Active products returned: ${data?.length}`);
        if (data && data.length > 0) {
            console.log('Sample product:', data[0]);
        } else {
            // If 0 active products, check if we have ANY products
            const { data: allProducts } = await supabase.from('products').select('*').limit(5);
            console.log('Sample raw products (ignoring active status):', allProducts);
        }
    }
}

checkProducts().catch(console.error);
