
import {
    Clock,
    RefreshCw,
    Truck,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const styles = {
        pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
        procesando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900',
        enviado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900',
        entregado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900',
        cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900',
    };

    const icons = {
        pendiente: Clock,
        procesando: RefreshCw,
        enviado: Truck,
        entregado: CheckCircle,
        cancelado: XCircle
    };

    const Icon = icons[status] || Clock;

    return (
        <Badge variant="outline" className={`${styles[status] || styles.pendiente} flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold`}>
            <Icon className="h-3 w-3" />
            {status}
        </Badge>
    );
}
