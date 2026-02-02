/**
 * Utilidades para exportar datos a diferentes formatos
 */

// Convertir array de objetos a CSV
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    headers?: { key: keyof T; label: string }[]
): void {
    if (data.length === 0) {
        console.warn('No hay datos para exportar');
        return;
    }

    // Determinar headers
    const headerConfig = headers ||
        Object.keys(data[0]).map(key => ({ key: key as keyof T, label: String(key) }));

    // Crear línea de headers
    const headerLine = headerConfig.map(h => `"${h.label}"`).join(',');

    // Crear líneas de datos
    const dataLines = data.map(row =>
        headerConfig.map(h => {
            const value = row[h.key];
            // Escapar comillas dobles y envolver en comillas
            const stringValue = value === null || value === undefined ? '' : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
    );

    // Combinar todo
    const csvContent = [headerLine, ...dataLines].join('\n');

    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
}

// Convertir datos a JSON y descargar
export function exportToJSON<T>(data: T, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, `${filename}.json`);
}

// Función auxiliar para descargar blob
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Formatear fecha para exportación
export function formatDateForExport(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

// Formatear moneda para exportación
export function formatCurrencyForExport(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(amount);
}
