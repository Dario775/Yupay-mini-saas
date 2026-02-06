const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xbbyvnxcjggwpfzbygos.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYnl2bnhjamdnd3BmemJ5Z29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc1NDIsImV4cCI6MjA4NTU4MzU0Mn0._7Fig3xiVNhNynJSayDQ_1sswyXyz-05yPyJ_GFzU5k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const OWNER_ID = 'cd864db8-d651-432c-b07c-617a054b8015';

async function fix() {
    console.log(`🔍 Iniciando limpieza para el dueño: ${OWNER_ID}`);

    // 1. Obtener todas las tiendas del dueño
    const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('id, name, created_at')
        .eq('owner_id', OWNER_ID)
        .order('created_at', { ascending: true });

    if (storeError || !stores) {
        console.error('❌ Error al obtener tiendas:', storeError);
        return;
    }

    console.log(`✅ Se encontraron ${stores.length} tiendas.`);
    if (stores.length <= 1) {
        console.log('✨ No hay tiendas duplicadas. Nada que hacer.');
        return;
    }

    const mainStore = stores[0];
    const otherStoreIds = stores.slice(1).map(s => s.id);

    console.log(`🏠 Tienda principal: ${mainStore.name} (${mainStore.id})`);
    console.log(`🗑️ Tiendas a eliminar: ${otherStoreIds.length}`);

    // 2. Buscar productos en TODAS las tiendas del dueño
    const { data: allProducts, error: prodError } = await supabase
        .from('products')
        .select('id, name, store_id')
        .in('store_id', stores.map(s => s.id));

    if (prodError) {
        console.error('❌ Error al buscar productos:', prodError);
        return;
    }

    console.log(`📦 Total de productos encontrados: ${allProducts ? allProducts.length : 0}`);

    // 3. Relinkear productos a la tienda principal
    const productsToMove = allProducts.filter(p => p.store_id !== mainStore.id);

    if (productsToMove.length > 0) {
        console.log(`🚚 Moviendo ${productsToMove.length} productos a la tienda principal...`);
        for (const prod of productsToMove) {
            const { error: updateError } = await supabase
                .from('products')
                .update({ store_id: mainStore.id })
                .eq('id', prod.id);

            if (updateError) {
                console.error(`❌ Error al mover producto ${prod.name}:`, updateError);
            } else {
                console.log(`   ✅ Movido: ${prod.name}`);
            }
        }
    } else {
        console.log('✅ No hay productos en otras tiendas.');
    }

    // 4. Mover suscripciones si es necesario (generalmente asociadas al user_id, pero a veces al store_id)
    console.log('🔄 Revisando suscripciones...');
    const { data: subs } = await supabase.from('subscriptions').select('id, store_id').eq('user_id', OWNER_ID);
    if (subs) {
        for (const sub of subs) {
            if (sub.store_id !== mainStore.id) {
                await supabase.from('subscriptions').update({ store_id: mainStore.id }).eq('id', sub.id);
                console.log(`   ✅ Suscripción ${sub.id} movida a la tienda principal.`);
            }
        }
    }

    // 5. Eliminar tiendas duplicadas (esto podría fallar si hay RLS o foreign keys, pero lo intentamos)
    console.log('🧹 Eliminando tiendas duplicadas...');
    const { error: delError } = await supabase
        .from('stores')
        .delete()
        .in('id', otherStoreIds);

    if (delError) {
        console.error('❌ Error al eliminar tiendas duplicadas:', delError);
        console.log('⚠️ Es posible que debas eliminarlas manualmente si tienen dependencias activas.');
    } else {
        console.log('✨ Tiendas duplicadas eliminadas exitosamente.');
    }

    console.log('\n🎉 ¡Limpieza completada! Por favor recarga la página.');
}

fix();
