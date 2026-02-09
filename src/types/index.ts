// Tipos de usuarios y roles
export type UserRole = 'admin' | 'cliente' | 'tienda';

// Ubicación geográfica
export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;        // Dirección completa legible
  locality?: string;      // Ciudad/Localidad
  province?: string;      // Provincia/Estado
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
  // Ubicación del usuario (para clientes)
  location?: GeoLocation;
  searchRadius?: number;  // Radio en km (0 = solo misma localidad)
}

// Suscripciones - Sistema Freemium
export type SubscriptionPlan = 'free' | 'basico' | 'profesional' | 'empresarial';
export type SubscriptionStatus = 'trial' | 'activa' | 'pendiente' | 'cancelada' | 'vencida' | 'limite_alcanzado';

export interface PlanLimits {
  maxSalesPerMonth: number;       // -1 = ilimitado
  maxProducts: number;            // -1 = ilimitado
  maxStores: number;
  hasReports: boolean;
  hasAdvancedReports: boolean;
  hasApiAccess: boolean;
  // Flash Offers (Ofertas Relámpago)
  hasFlashOffers: boolean;
  maxFlashOffersPerMonth: number; // -1 = ilimitado
  maxFlashOfferRadius: number;    // Radio máximo en km
  hasDynamicPayments: boolean;    // Integration with MercadoPago/etc.
  price: number;
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxSalesPerMonth: 5,
    maxProducts: 10,
    maxStores: 1,
    hasReports: false,
    hasAdvancedReports: false,
    hasApiAccess: false,
    hasFlashOffers: false,
    maxFlashOffersPerMonth: 0,
    maxFlashOfferRadius: 0,
    hasDynamicPayments: false,
    price: 0,
  },
  basico: {
    maxSalesPerMonth: 50,
    maxProducts: 100,
    maxStores: 1,
    hasReports: true,
    hasAdvancedReports: false,
    hasApiAccess: false,
    hasFlashOffers: false,
    maxFlashOffersPerMonth: 0,
    maxFlashOfferRadius: 0,
    hasDynamicPayments: false,
    price: 9.99,
  },
  profesional: {
    maxSalesPerMonth: 500,
    maxProducts: 1000,
    maxStores: 3,
    hasReports: true,
    hasAdvancedReports: true,
    hasApiAccess: false,
    hasFlashOffers: true,
    maxFlashOffersPerMonth: 2,
    maxFlashOfferRadius: 5,
    hasDynamicPayments: true,
    price: 29.99,
  },
  empresarial: {
    maxSalesPerMonth: -1, // Ilimitado
    maxProducts: -1,
    maxStores: 10,
    hasReports: true,
    hasAdvancedReports: true,
    hasApiAccess: true,
    hasFlashOffers: true,
    maxFlashOffersPerMonth: -1, // Ilimitado
    maxFlashOfferRadius: 20,
    hasDynamicPayments: true,
    price: 99.99,
  },
};

export interface StorePaymentConfig {
  id: string;
  storeId: string;
  provider: 'mercadopago';
  accessToken: string; // Only for input/saving, generally not returned unless masked
  publicKey?: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  storeId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;        // Fecha fin de trial (14 días)
  price: number;
  autoRenew: boolean;
  // Contadores de uso
  salesThisMonth: number;
  lastResetDate: Date;        // Fecha del último reset mensual
  createdAt?: Date;
}

// Tiendas
export interface ShippingMethod {
  id: string;
  name: string;              // Ej: "Envío estándar", "Express", "Retiro en sucursal"
  price: number;             // 0 = gratis
  estimatedDays: string;     // Ej: "3-5 días", "24hs", "Inmediato"
  description?: string;
  isActive: boolean;
}

export type PaymentMethodType = 'transferencia' | 'mercadopago' | 'efectivo' | 'tarjeta' | 'otro';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;              // Ej: "Transferencia bancaria", "MercadoPago"
  description?: string;      // Ej: "CBU: 123456789", "Alias: mitienda.mp"
  instructions?: string;     // Instrucciones adicionales
  isActive: boolean;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  banner?: string;
  coverImage?: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  rating: number;
  createdAt: Date;
  // Para freemium
  subscriptionId?: string;
  // Métodos de envío y pago
  shippingMethods?: ShippingMethod[];
  paymentMethods?: PaymentMethod[];
  // Ubicación geográfica
  location?: GeoLocation;
}

// Productos
export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  // Campos de descuento y ofertas
  discount?: number;           // Porcentaje de descuento (0-100)
  isOnSale?: boolean;          // Si está en oferta especial
  originalPrice?: number;      // Precio original antes del descuento
  saleEndDate?: Date;          // Fecha fin de la oferta
  // Campos contables
  cost?: number;               // Costo del producto (para calcular margen)
  sku?: string;                // Código de producto
  minStock?: number;           // Stock mínimo para alertas
  // Atributos dinámicos por categoría
  attributes?: Record<string, any>;
}

// Órdenes/Compras
export type OrderStatus = 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress: string;
}

// Estadísticas
export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  // Métricas freemium
  freeUsers: number;
  paidUsers: number;
  trialUsers: number;
  conversionRate: number;
}

export interface StoreStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Product[];
  // Límites
  salesThisMonth: number;
  salesLimit: number;
  productsCount: number;
  productsLimit: number;
  isLimitReached: boolean;
}

// Registro público
export interface RegisterStoreData {
  storeName: string;
  ownerName: string;
  email: string;
  password: string;
  category: string;
  phone?: string;
}

// Ofertas Flash (Relámpago) - Feature Premium
export type FlashOfferStatus = 'scheduled' | 'active' | 'expired' | 'cancelled';

export interface FlashOffer {
  id: string;
  storeId: string;
  // Productos en oferta
  productIds: string[];           // IDs de productos incluidos
  // Descuento
  discountType: 'percentage' | 'fixed';
  discountValue: number;          // % o monto fijo
  // Tiempo
  startDate: Date;
  endDate: Date;
  duration: number;               // Duración en horas (para mostrar countdown)
  // Alcance geográfico
  radiusKm: number;               // Radio de alcance en km
  // Límites
  maxRedemptions?: number;        // Límite de usos (opcional)
  currentRedemptions: number;     // Usos actuales
  // Estado
  status: FlashOfferStatus;
  // Metadata
  title: string;                  // Ej: "30% OFF en Auriculares"
  description?: string;
  createdAt: Date;
  // Notificaciones enviadas
  notificationsSent: number;
}
