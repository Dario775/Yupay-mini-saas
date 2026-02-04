import { supabase } from './supabase';
import type { Subscription, Store, Product, Order, User, SubscriptionPlan, FlashOffer } from '@/types';

/**
 * API for Admin Data
 */
export const adminApi = {
    async getPlanConfigs() {
        const { data, error } = await supabase
            .from('plan_configs')
            .select('*');
        if (error) throw error;

        // Transform array to record
        return data.reduce((acc, config) => {
            acc[config.id as SubscriptionPlan] = {
                price: Number(config.price),
                maxSalesPerMonth: config.max_sales_per_month,
                maxProducts: config.max_products,
                maxStores: config.max_stores,
                hasFlashOffers: config.has_flash_offers,
                maxFlashOffersPerMonth: config.max_flash_offers_per_month,
                maxFlashOfferRadius: config.max_flash_offer_radius
            };
            return acc;
        }, {} as Record<SubscriptionPlan, any>);
    },

    async updatePlanLimit(plan: SubscriptionPlan, updates: any) {
        // Map camelCase to snake_case for Supabase
        const dbUpdates: any = {};
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.maxSalesPerMonth !== undefined) dbUpdates.max_sales_per_month = updates.maxSalesPerMonth;
        if (updates.maxProducts !== undefined) dbUpdates.max_products = updates.maxProducts;
        if (updates.maxStores !== undefined) dbUpdates.max_stores = updates.maxStores;

        const { error } = await supabase
            .from('plan_configs')
            .update(dbUpdates)
            .eq('id', plan);
        if (error) throw error;
    },

    async getSubscriptions() {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
};

/**
 * API for Store Data
 */
export const storeApi = {
    async getStore(storeId: string) {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', storeId)
            .single();
        if (error) throw error;
        return data;
    },

    async getProducts(storeId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addProduct(product: any) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
