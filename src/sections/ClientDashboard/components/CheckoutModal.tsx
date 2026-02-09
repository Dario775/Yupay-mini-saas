
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, CreditCard, Loader2, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { clientApi, storeApi } from '@/lib/api';
import { formatPrice } from '@/utils/format';
import { generateWhatsAppLink, formatOrderMessage } from '@/utils/whatsapp';
import type { Product, Store, User } from '@/types';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    store: Store | null;
    user: User | null;
    total: number;
    onOrderCreated: () => void;
}

export function CheckoutModal({
    isOpen,
    onClose,
    cart,
    store,
    user,
    total,
    onOrderCreated
}: CheckoutModalProps) {
    const [loading, setLoading] = useState(false);
    const [paymentConfig, setPaymentConfig] = useState<any>(null);
    const [checkingConfig, setCheckingConfig] = useState(true);

    useEffect(() => {
        if (isOpen && store) {
            setCheckingConfig(true);
            storeApi.getPaymentConfig(store.id, 'mercadopago')
                .then(config => setPaymentConfig(config))
                .catch(err => console.error('Error checking payment config:', err))
                .finally(() => setCheckingConfig(false));
        }
    }, [isOpen, store]);

    const handleWhatsAppOrder = () => {
        if (!store?.phone) {
            toast.error('La tienda no tiene WhatsApp configurado');
            return;
        }

        const orderMock: any = {
            items: cart.map(i => ({
                quantity: i.quantity,
                productName: i.product.name,
                unitPrice: i.product.price
            })),
            total,
            shippingAddress: user?.location?.address || 'Mi dirección'
        };
        const msg = formatOrderMessage(orderMock, store.name);
        window.open(generateWhatsAppLink(store.phone, msg), '_blank');
        onOrderCreated();
        onClose();
    };

    const handleOnlinePayment = async () => {
        if (!user?.email) {
            toast.error('Necesitas un email en tu perfil para pagar online');
            return;
        }

        setLoading(true);
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.price,
                total: item.product.price * item.quantity
            }));

            const response = await clientApi.createStorePreference(store!.id, items, user.email);

            if (response.error) {
                throw new Error(response.error);
            }

            if (response.init_point) {
                // Create order in DB as 'pending' before redirecting?
                // For now, we rely on webhook or redirection. 
                // But strictly, we might want to create it first.
                // let's just redirect and assume flow for now.
                window.location.href = response.init_point;
            } else if (response.sandbox_init_point) {
                window.location.href = response.sandbox_init_point;
            } else {
                throw new Error('No se recibió link de pago');
            }

        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Error al iniciar el pago');
        } finally {
            setLoading(false);
        }
    };

    if (!store) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-0 rounded-3xl overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-black text-center text-gray-900 dark:text-white">
                        ¿Cómo te gustaría pagar?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500">
                        Elige el método mas conveniente para ti
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {/* Online Payment Option */}
                    <button
                        onClick={handleOnlinePayment}
                        disabled={loading || checkingConfig || !paymentConfig?.isActive}
                        className={`w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-4 text-left ${paymentConfig?.isActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-600'
                                : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-xl ${paymentConfig?.isActive ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${paymentConfig?.isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-500'}`}>
                                        Pagar Online
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-tight mt-1">
                                        {checkingConfig ? 'Verificando disponibilidad...' :
                                            paymentConfig?.isActive
                                                ? 'Tarjetas de crédito, débito y dinero en cuenta.'
                                                : 'No disponible temporalmente'}
                                    </p>
                                </div>
                            </div>
                            {paymentConfig?.isActive && <div className="h-6 w-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                            </div>}
                        </div>
                        {paymentConfig?.isActive && <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                            <ShieldCheck className="h-4 w-4" />
                            Procesado de forma segura por Mercado Pago
                        </div>}
                    </button>

                    {/* WhatsApp / Manual Option */}
                    <button
                        onClick={handleWhatsAppOrder}
                        className="w-full group relative overflow-hidden rounded-2xl border-2 border-green-500 bg-green-50 dark:bg-green-900/10 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-600 transition-all duration-300 p-4 text-left"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-green-500 text-white shadow-md">
                                    <MessageCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-green-900 dark:text-green-100">
                                        Acordar por WhatsApp
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-tight mt-1">
                                        Coordina el pago y envío directamente con el vendedor.
                                    </p>
                                </div>
                            </div>
                            <div className="h-6 w-6 rounded-full border-2 border-green-500 flex items-center justify-center opacity-50 group-hover:opacity-100">
                                <ArrowRight className="h-3 w-3 text-green-600" />
                            </div>
                        </div>
                    </button>

                    <div className="pt-4 border-t dark:border-gray-800 text-center">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                            Total a pagar: <span className="text-gray-900 dark:text-white font-black text-lg ml-2">{formatPrice(total)}</span>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
