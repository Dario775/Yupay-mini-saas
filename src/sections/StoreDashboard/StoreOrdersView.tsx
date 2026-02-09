
import { useState } from 'react';
import { ShoppingCart, Search, Download, Archive, Home, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatStatusUpdateMessage, generateWhatsAppLink } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/format';
import type { Order, OrderStatus } from '@/types';

interface StoreOrdersViewProps {
    orders: Order[];
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    handleExportOrders: () => void;
}

export function StoreOrdersView({
    orders,
    updateOrderStatus,
    handleExportOrders
}: StoreOrdersViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-violet-500/5 overflow-hidden">
            {/* Mesh Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/10 dark:bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <CardHeader className="relative p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                <div>
                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2 dark:text-white">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                            <ShoppingCart className="h-5 w-5 text-violet-600" />
                        </div>
                        Historial de Ventas
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{filteredOrders.length} pedidos hoy</p>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">Live Feed</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportOrders} className="h-9 gap-1.5 text-xs px-3"><Download className="h-3.5 w-3.5" />Exportar</Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-400"
                        >
                            <Archive className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-medium">Sin pedidos registrados</p>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50 hover:border-violet-200 dark:hover:border-violet-900/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all bg-white dark:bg-gray-800/20"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                                ID-{order.id.slice(0, 8)}
                                            </span>
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                                            <span>{order.createdAt.toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                            <span className="text-gray-500 dark:text-gray-400">{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">${order.total.toFixed(2)}</span>
                                        <p className="text-[9px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest mt-0.5">Pendiente de cobro</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-dashed dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 italic">
                                        <Home className="h-3 w-3" />
                                        <span className="line-clamp-1 max-w-[200px]">{order.shippingAddress}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="secondary" size="sm" className="h-8 text-[10px] font-bold px-3 bg-gray-100 dark:bg-gray-800 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-gray-600 dark:text-gray-300 transition-colors">
                                                    Actualizar Estado
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'procesando')} className="text-xs">Procesando</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'enviado')} className="text-xs">Enviado</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'entregado')} className="text-xs">Entregado</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600 text-xs font-bold" onClick={() => updateOrderStatus(order.id, 'cancelado')}>Cancelar Pedido</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold px-3" onClick={() => setSelectedOrder(order)}>Ver Detalle</Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </CardContent>

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-lg dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Detalles del Pedido</DialogTitle><DialogDescription>Pedido #{selectedOrder?.id}</DialogDescription></DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between"><OrderStatusBadge status={selectedOrder.status} /><span className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.createdAt.toLocaleDateString()}</span></div>
                            <div><h4 className="font-medium mb-2 dark:text-white">Productos</h4>
                                <div className="space-y-2">{selectedOrder.items.map((item, idx) => (<div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded"><span className="dark:text-gray-300">{item.quantity}x {item.productName}</span><span className="font-medium dark:text-white">{formatPrice(item.total)}</span></div>))}</div>
                            </div>
                            <div className="flex justify-between font-semibold text-lg border-t dark:border-gray-700 pt-3"><span className="dark:text-white">Total</span><span className="dark:text-white">{formatPrice(selectedOrder.total)}</span></div>
                            <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"><Home className="h-4 w-4 mt-0.5" /><span>{selectedOrder.shippingAddress}</span></div>

                            <Button
                                variant="outline"
                                className="w-full mt-4 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={() => {
                                    // Mock user data for now since order doesn't have phone
                                    const mockPhone = '5491112345678';
                                    const customerName = 'Cliente';
                                    const msg = formatStatusUpdateMessage(customerName, selectedOrder.id, selectedOrder.status, 'Mi Tienda');
                                    window.open(generateWhatsAppLink(mockPhone, msg), '_blank');
                                }}
                            >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Notificar Estado por WhatsApp
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
