/**
 * Format a number as Argentine Pesos currency.
 * - Adds thousand separators (dots).
 * - No decimals (rounded).
 * - Prefix with "$".
 * 
 * Example: 15000.50 -> "$15.001"
 */
export const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
