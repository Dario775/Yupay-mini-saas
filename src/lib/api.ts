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
        if (updates.hasFlashOffers !== undefined) dbUpdates.has_flash_offers = updates.hasFlashOffers;
        if (updates.maxFlashOffersPerMonth !== undefined) dbUpdates.max_flash_offers_per_month = updates.maxFlashOffersPerMonth;
        if (updates.maxFlashOfferRadius !== undefined) dbUpdates.max_flash_offer_radius = updates.maxFlashOfferRadius;

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
    },

    async updateSubscription(id: string, updates: any) {
        // Map common fields
        const dbUpdates: any = { ...updates };
        if (updates.startDate) dbUpdates.start_date = updates.startDate;
        if (updates.endDate) dbUpdates.end_date = updates.endDate;
        if (updates.trialEndDate) dbUpdates.trial_end_date = updates.trialEndDate;

        const { error } = await supabase
            .from('subscriptions')
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
    },

    async updateUser(id: string, updates: any) {
        const dbUpdates: Record<string, any> = {};

        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

        console.log('📝 Updating user:', id, 'with:', dbUpdates);

        const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('❌ Error updating user:', error);
            throw error;
        }
        console.log('✅ User updated successfully');
    },

    async deleteStore(id: string) {
        console.log('🗑️ Deleting store:', id);
        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error deleting store:', error);
            throw error;
        }
        console.log('✅ Store deleted successfully');
    },

    async deleteUser(id: string) {
        console.log('🗑️ Deleting user profile:', id);
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error deleting user:', error);
            throw error;
        }
        console.log('✅ User deleted successfully');
    },

    async deleteSubscription(id: string) {
        console.log('🗑️ Deleting subscription:', id);
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error deleting subscription:', error);
            throw error;
        }
        console.log('✅ Subscription deleted successfully');
    },

    async getAllStores() {
        const { data, error } = await supabase
            .from('stores')
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

    async updateStore(id: string, updates: any) {
        // Map camelCase to snake_case and only include valid DB fields
        const dbUpdates: Record<string, any> = {};

        if (updates.ownerId !== undefined) dbUpdates.owner_id = updates.ownerId;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.location !== undefined) dbUpdates.location = updates.location;

        console.log('📝 Updating store:', id, 'with:', dbUpdates);

        const { error } = await supabase
            .from('stores')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('❌ Error updating store:', error);
            throw error;
        }
        console.log('✅ Store updated successfully');
    },

    async addProduct(product: any) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateProduct(id: string, updates: any) {
        // Map camelCase to snake_case if necessary, currently assumed direct mapping or matching column names
        // Ideally we should map fields like storeId -> store_id if passed in updates
        const dbUpdates: any = { ...updates };
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.isOnSale !== undefined) dbUpdates.is_on_sale = updates.isOnSale;
        if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
        if (updates.saleEndDate !== undefined) dbUpdates.sale_end_date = updates.saleEndDate;
        if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async getOrders(storeId: string) {
        // Obtener órdenes de la tienda
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Cargar items para cada orden
        if (ordersData && ordersData.length > 0) {
            const orderIds = ordersData.map(o => o.id);
            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);

            // Agregar items a cada orden
            return ordersData.map(order => ({
                ...order,
                items: itemsData?.filter(item => item.order_id === order.id) || []
            }));
        }

        return ordersData;
    },

    async updateOrderStatus(orderId: string, status: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);
        if (error) throw error;
    }
};

/**
 * API for Client Data
 */
export const clientApi = {
    async getAllProducts() {
        // Get products from active stores only
        const { data, error } = await supabase
            .from('products')
            .select('*, stores!inner(is_active)')
            .eq('is_active', true)
            .eq('stores.is_active', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        // Remove the nested stores object from the result
        return data?.map(({ stores, ...product }) => product);
    },

    async getAllStores() {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;
        return data;
    },

    async createOrder(order: {
        customer_id: string;
        store_id: string;
        items: Array<{
            productId: string;
            productName: string;
            quantity: number;
            price: number;
            total: number;
        }>;
        total: number;
        shipping_address: string;
        status?: string;
    }) {
        // 1. Crear la orden (sin items)
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id: order.customer_id,
                store_id: order.store_id,
                total: order.total,
                shipping_address: order.shipping_address,
                status: order.status || 'pendiente',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Crear los items del pedido en la tabla order_items
        if (order.items && order.items.length > 0) {
            const orderItems = order.items.map(item => ({
                order_id: orderData.id,
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                unit_price: item.price,
                total: item.total
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('Error creating order items:', itemsError);
                // Nota: la orden ya fue creada, pero los items fallaron
            }
        }

        return orderData;
    },

    async getMyOrders(customerId: string) {
        // Obtener órdenes con sus items
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Cargar items para cada orden
        if (ordersData && ordersData.length > 0) {
            const orderIds = ordersData.map(o => o.id);
            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);

            // Agregar items a cada orden
            return ordersData.map(order => ({
                ...order,
                items: itemsData?.filter(item => item.order_id === order.id) || []
            }));
        }

        return ordersData;
    },

    async cancelOrder(orderId: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelado' })
            .eq('id', orderId);
        if (error) throw error;
    }
};
