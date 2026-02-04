
import { ShoppingCart, Minus, Plus, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateWhatsAppLink, formatOrderMessage } from '@/utils/whatsapp';
import type { Product, Store, GeoLocation } from '@/types';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onCheckout: () => void;
    stores: Store[];
    userLocation: GeoLocation | null;
    cartTotal: number;
    cartItemsCount: number;
}

export function CartDrawer({
    isOpen,
    onOpenChange,
    cart,
    onUpdateQuantity,
    onCheckout,
    stores,
    userLocation,
    cartTotal,
    cartItemsCount
}: CartDrawerProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden dark:bg-gray-900 border-0 shadow-2xl">
                <div className="p-6 bg-violet-600">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Tu Carrito
                    </h3>
                    <p className="text-violet-100 text-xs mt-1">{cartItemsCount} productos seleccionados</p>
                </div>

                <div className="p-4 sm:p-6 bg-white dark:bg-gray-900">
                    <ScrollArea className="max-h-[50vh] pr-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Tu carrito está vacío</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                            {product.images?.[0] ?
                                                <img src={product.images[0]} className="w-full h-full object-cover" />
                                                :
                                                <div className="w-full h-full flex items-center justify-center font-bold text-gray-300">{product.name[0]}</div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                            <p className="text-[10px] text-violet-600 font-bold">${product.price}</p>
                                        </div>
                                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1 gap-3">
                                            <button onClick={() => onUpdateQuantity(product.id, -1)} className="p-1 hover:text-red-500 transition-colors"><Minus className="h-3 w-3" /></button>
                                            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                                            <button onClick={() => onUpdateQuantity(product.id, 1)} className="p-1 hover:text-green-500 transition-colors"><Plus className="h-3 w-3" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {cart.length > 0 && (
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold border-t dark:border-gray-800 pt-4">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Total</span>
                                <span className="text-xl text-violet-600">${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button onClick={onCheckout} className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20">
                                Realizar Pedido
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 border-green-500 text-green-600 hover:bg-green-50 font-bold rounded-2xl gap-2"
                                onClick={() => {
                                    const storeId = cart[0]?.product.storeId;
                                    const store = stores.find(s => s.id === storeId);
                                    if (store?.phone) {
                                        const orderMock: any = {
                                            items: cart.map(i => ({ quantity: i.quantity, productName: i.product.name, unitPrice: i.product.price })),
                                            total: cartTotal,
                                            shippingAddress: userLocation?.address || 'Mi dirección'
                                        };
                                        const msg = formatOrderMessage(orderMock, store.name);
                                        window.open(generateWhatsAppLink(store.phone, msg), '_blank');
                                    } else {
                                        toast.error('La tienda no tiene WhatsApp configurado');
                                    }
                                }}
                            >
                                <MessageCircle className="h-5 w-5" />
                                Pedir por WhatsApp
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
