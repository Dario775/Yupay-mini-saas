
export interface AttributeOption {
    label: string;
    value: string;
}

export interface CategoryAttribute {
    id: string;
    name: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'multiselect';
    options?: AttributeOption[] | string[];
    required?: boolean;
    placeholder?: string;
    unit?: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    attributes: CategoryAttribute[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
    {
        id: 'general',
        name: 'General / Otros',
        attributes: [
            { id: 'brand', name: 'Marca', type: 'text', placeholder: 'Ej: Samsung, Nike, etc.' },
            { id: 'model', name: 'Modelo', type: 'text', placeholder: 'Ej: Galaxy S23' }
        ]
    },
    {
        id: 'ropa',
        name: 'Ropa e Indumentaria',
        attributes: [
            { id: 'brand', name: 'Marca', type: 'text', required: true },
            {
                id: 'size', name: 'Talle / Tamaño', type: 'select', required: true,
                options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único']
            },
            { id: 'color', name: 'Color', type: 'text', required: true, placeholder: 'Ej: Rojo, Azul Marino' },
            { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex', 'Niños', 'Bebés'] },
            { id: 'material', name: 'Material', type: 'text', placeholder: 'Ej: Algodón, Poliéster' }
        ]
    },
    {
        id: 'calzado',
        name: 'Calzado',
        attributes: [
            { id: 'brand', name: 'Marca', type: 'text', required: true },
            { id: 'model', name: 'Modelo', type: 'text' },
            {
                id: 'size_type', name: 'Tipo de Talle', type: 'select', required: true,
                options: ['EU (Europa)', 'US (USA)', 'UK (Reino Unido)', 'AR (Argentina)', 'CM (Centímetros)']
            },
            { id: 'size', name: 'Talle', type: 'number', required: true, placeholder: 'Ej: 40' },
            { id: 'color', name: 'Color', type: 'text', placeholder: 'Ej: Negro, Blanco' }
        ]
    },
    {
        id: 'tecnologia',
        name: 'Tecnología y Electrónica',
        attributes: [
            { id: 'brand', name: 'Marca', type: 'text', required: true },
            { id: 'model', name: 'Modelo', type: 'text', required: true },
            { id: 'warranty', name: 'Garantía (Meses)', type: 'number', placeholder: 'Ej: 12' },
            { id: 'condition', name: 'Condición', type: 'select', options: ['Nuevo', 'Usado - Como nuevo', 'Usado - Bueno', 'Refurbished'] },
            // Ejemplo de especificaciones técnicas comunes
            { id: 'storage', name: 'Almacenamiento', type: 'text', placeholder: 'Ej: 128GB' },
            { id: 'ram', name: 'Memoria RAM', type: 'text', placeholder: 'Ej: 8GB' }
        ]
    },
    {
        id: 'hogar',
        name: 'Hogar y Muebles',
        attributes: [
            { id: 'material', name: 'Material', type: 'text', placeholder: 'Ej: Madera, Metal' },
            { id: 'dimensions', name: 'Dimensiones (Alto x Ancho x Prof.)', type: 'text', placeholder: 'Ej: 200x120x60 cm' },
            { id: 'is_assembled', name: 'Requiere Armado', type: 'select', options: ['Sí', 'No'] }
        ]
    },
    {
        id: 'alimentos',
        name: 'Alimentos y Bebidas',
        attributes: [
            { id: 'brand', name: 'Marca', type: 'text' },
            { id: 'net_weight', name: 'Contenido Neto', type: 'text', placeholder: 'Ej: 500g, 1L' },
            { id: 'expiration_date', name: 'Fecha de Vencimiento', type: 'text', placeholder: 'DD/MM/AAAA' },
            { id: 'is_gluten_free', name: 'Libre de Gluten (Sin TACC)', type: 'boolean' },
            { id: 'is_vegan', name: 'Vegano', type: 'boolean' }
        ]
    }
];
