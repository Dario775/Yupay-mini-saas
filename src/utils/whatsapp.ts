
import type { Order, OrderItem, Store } from '@/types';

/**
 * Generates a WhatsApp link with a pre-filled message.
 * @param phone The phone number (with country code, e.g., 54911...)
 * @param message The message to pre-fill
 * @returns The full WhatsApp URL
 */
export const generateWhatsAppLink = (phone: string, message: string): string => {
    // Remove non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Formats an order into a readable message for the store owner.
 * @param order The order object
 * @param store The store object
 * @returns A formatted string
 */
export const formatOrderMessage = (order: Order, storeName: string): string => {
    const itemsList = order.items
        .map(item => `• ${item.quantity}x ${item.productName} ($${item.unitPrice})`)
        .join('\n');

    return `Hola *${storeName}*! 👋
Me gustaría realizar el siguiente pedido:

${itemsList}

*Total: $${order.total}*

Envío a: ${order.shippingAddress}

Quedo a la espera de su confirmación. Gracias!`;
};

/**
 * Formats a status update message for the client.
 * @param customerName Name of the customer
 * @param orderId Order ID
 * @param status New status
 * @param storeName Name of the store
 * @returns A formatted string
 */
export const formatStatusUpdateMessage = (customerName: string, orderId: string, status: string, storeName: string): string => {
    let statusText = '';
    switch (status) {
        case 'procesando': statusText = 'está siendo procesado 👨‍🍳'; break;
        case 'enviado': statusText = 'ha sido enviado 🚚'; break;
        case 'entregado': statusText = 'ha sido entregado 🎉'; break;
        case 'cancelado': statusText = 'ha sido cancelado ❌'; break;
        default: statusText = 'ha cambiado de estado';
    }

    return `Hola *${customerName}*!
Tu pedido *#${orderId}* en *${storeName}* ${statusText}.

Cualquier consulta estamos a tu disposición.
Saludos!`;
};
