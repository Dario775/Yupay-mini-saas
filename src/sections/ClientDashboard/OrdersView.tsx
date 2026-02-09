
import { useState } from 'react';
import { Package, Clock, RefreshCw, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/utils/format';
import type { Order } from '@/types';

interface OrdersViewProps {
    orders: Order[];
    onCancelOrder: (orderId: string) => void;
}

function OrderStatusBadge({ status }: { status: Order['status'] }) {
    const styles = {
        pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        procesando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        enviado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        entregado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    const icons = { pendiente: Clock, procesando: RefreshCw, enviado: Truck, entregado: CheckCircle, cancelado: XCircle };
    const Icon = icons[status] || Clock;
    return (
        <Badge className={`${styles[status] || styles.pendiente} flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

export function OrdersView({ orders, onCancelOrder }: OrdersViewProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Mis Pedidos</h2>
                <p className="text-gray-600 dark:text-gray-400">Seguimiento de tus compras</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes pedidos</h3>
                    <p className="text-gray-500 dark:text-gray-400">Cuando realices una compra, aparecerá aquí</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl transition-all hover:shadow-md cursor-pointer group flex flex-col h-full" onClick={() => setSelectedOrder(order)}>
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <Badge variant="outline" className="mb-2 text-xs font-mono text-gray-500 border-gray-200 dark:border-gray-700">
                                            #{order.id.slice(0, 8)}
                                        </Badge>
                                        <p className="text-sm font-bold dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status === 'pendiente' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(order.id); }}
                                                title="Cancelar pedido"
                                            >
                                                <XCircle className="h-5 w-5" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-xs h-8 rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/20 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors"
                                        >
                                            Ver Detalle
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-md dark:bg-gray-900 border-0 rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold dark:text-white">Detalles del Pedido</DialogTitle>
                        <DialogDescription className="text-xs">Identificador: #{selectedOrder?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="mt-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <OrderStatusBadge status={selectedOrder.status} />
                                <p className="text-xs font-bold text-gray-500">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                            </div>

                            <ScrollArea className="max-h-[40vh] pr-2">
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-dashed dark:border-gray-800 last:border-0">
                                            <div>
                                                <p className="text-sm font-bold dark:text-white">{item.productName}</p>
                                                <p className="text-xs text-gray-500">{item.quantity} x {formatPrice(item.unitPrice)}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(item.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <Separator className="dark:border-gray-800" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Dirección</span>
                                    <span className="font-medium dark:text-white text-right max-w-[60%]">{selectedOrder.shippingAddress}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span className="text-violet-600">Total</span>
                                    <span className="text-gray-900 dark:text-white">{formatPrice(selectedOrder.total)}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button className="w-full rounded-xl font-bold" onClick={() => setSelectedOrder(null)}>
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={!!showCancelConfirm} onOpenChange={(open) => !open && setShowCancelConfirm(null)}>
                <DialogContent className="max-w-sm rounded-3xl dark:bg-gray-900 border-0">
                    <DialogHeader>
                        <DialogTitle>¿Cancelar pedido?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold text-xs" onClick={() => setShowCancelConfirm(null)}>NO, MANTENER</Button>
                        <Button
                            variant="destructive"
                            className="flex-1 h-11 rounded-xl font-bold text-xs"
                            onClick={() => {
                                if (showCancelConfirm) {
                                    onCancelOrder(showCancelConfirm);
                                    setShowCancelConfirm(null);
                                }
                            }}
                        >
                            SÍ, CANCELAR
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
