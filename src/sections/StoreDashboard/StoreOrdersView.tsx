
import { useState } from 'react';
import { ShoppingCart, Search, Download, Archive, Home, MessageCircle } from 'lucide-react';
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
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                        <ShoppingCart className="h-4 w-4 text-violet-500" />
                        Ventas
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{filteredOrders.length} pedidos hoy</p>
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
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Archive className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Sin pedidos registrados</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="p-4 rounded-xl border dark:border-gray-800 hover:shadow-sm transition-all bg-gray-50/50 dark:bg-gray-800/20">
                            <div className="flex justify-between items-start mb-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-gray-400">#{order.id}</span>
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{order.createdAt.toLocaleDateString()} • {order.items.length} productos</p>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                                <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[150px]">{order.shippingAddress}</p>
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-7 text-[10px] px-2">Estado</Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'procesando')}>Procesando</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'enviado')}>Enviado</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'entregado')}>Entregado</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => updateOrderStatus(order.id, 'cancelado')}>Cancelar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => setSelectedOrder(order)}>Detalles</Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
