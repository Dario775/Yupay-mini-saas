
import { useState } from 'react';
import { Package, Search, Plus, Download, MoreHorizontal, AlertTriangle, Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Product } from '@/types';
import { PRODUCT_CATEGORIES, type CategoryAttribute } from '@/constants/categories';
import { formatPrice } from '@/utils/format';
import { toast } from 'sonner';

interface InventoryViewProps {
    products: Product[];
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'storeId'> & { storeId: string }) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    updateStock: (id: string, quantity: number) => void;
    handleExportProducts: () => void;
}

export function InventoryView({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    handleExportProducts
}: InventoryViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockProduct, setStockProduct] = useState<Product | null>(null);
    const [stockQuantity, setStockQuantity] = useState('');

    const [newProduct, setNewProduct] = useState<{
        name: string; description: string; price: string; stock: string; category: string;
        discount: string; isOnSale: boolean; cost: string; sku: string; minStock: string;
        images: string[];
        attributes: Record<string, any>;
    }>({
        name: '', description: '', price: '', stock: '', category: '',
        discount: '', isOnSale: false, cost: '', sku: '', minStock: '',
        images: [] as string[],
        attributes: {}
    });

    const processImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject('No canvas context');
                        return;
                    }

                    // Standardize to square 800x800
                    const size = 800;
                    canvas.width = size;
                    canvas.height = size;

                    // Calculate cover logic
                    const scale = Math.max(size / img.width, size / img.height);
                    const x = (size - img.width * scale) / 2;
                    const y = (size - img.height * scale) / 2;

                    ctx.fillStyle = '#FFFFFF'; // White background just in case
                    ctx.fillRect(0, 0, size, size);
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentImages = isEditing ? editingProduct?.images || [] : newProduct.images;

        if (currentImages.length >= 2) {
            toast.error('Máximo 2 imágenes permitidas');
            return;
        }

        const remainingSlots = 2 - currentImages.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        try {
            const processedImages = await Promise.all(filesToProcess.map(processImage));

            if (isEditing && editingProduct) {
                setEditingProduct({
                    ...editingProduct,
                    images: [...(editingProduct.images || []), ...processedImages]
                });
            } else {
                setNewProduct(prev => ({
                    ...prev,
                    images: [...prev.images, ...processedImages]
                }));
            }
            toast.success(`${processedImages.length} imagen(es) agregada(s)`);
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Error al procesar la imagen');
        }

        // Reset input
        e.target.value = '';
    };

    const removeImage = (index: number, isEditing: boolean) => {
        if (isEditing && editingProduct) {
            const newImages = [...(editingProduct.images || [])];
            newImages.splice(index, 1);
            setEditingProduct({ ...editingProduct, images: newImages });
        } else {
            const newImages = [...newProduct.images];
            newImages.splice(index, 1);
            setNewProduct(prev => ({ ...prev, images: newImages }));
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateProduct = () => {
        if (!newProduct.name || !newProduct.price || !newProduct.stock) {
            toast.error('Completa los campos requeridos');
            return;
        }
        const price = parseFloat(newProduct.price);
        const discount = newProduct.discount ? parseFloat(newProduct.discount) : 0;
        const originalPrice = discount > 0 ? price : undefined;
        const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

        addProduct({
            storeId: '', // Handled by useStoreData hook
            name: newProduct.name,
            description: newProduct.description,
            price: finalPrice,
            originalPrice: originalPrice,
            stock: parseInt(newProduct.stock),
            category: newProduct.category || 'General',
            images: newProduct.images,
            isActive: true,
            discount: discount || undefined,
            isOnSale: newProduct.isOnSale,
            cost: newProduct.cost ? parseFloat(newProduct.cost) : undefined,
            sku: newProduct.sku || undefined,
            minStock: newProduct.minStock ? parseInt(newProduct.minStock) : undefined,
            attributes: newProduct.attributes
        });
        toast.success('Producto agregado exitosamente');
        setNewProduct({
            name: '', description: '', price: '', stock: '', category: '',
            discount: '', isOnSale: false, cost: '', sku: '', minStock: '',
            images: [],
            attributes: {}
        });
        setIsAddProductOpen(false);
    };

    const handleUpdateProduct = () => {
        if (!editingProduct) return;
        updateProduct(editingProduct.id, editingProduct);
        toast.success('Producto actualizado');
        setEditingProduct(null);
    };

    const handleUpdateStockSubmit = () => {
        if (!stockProduct || !stockQuantity) return;
        updateStock(stockProduct.id, parseInt(stockQuantity));
        toast.success('Stock actualizado');
        setShowStockModal(false);
        setStockProduct(null);
        setStockQuantity('');
    };

    const handleToggleActive = (product: Product) => {
        updateProduct(product.id, { isActive: !product.isActive });
        toast.success(product.isActive ? 'Producto desactivado' : 'Producto activado');
    };

    const renderAttributeInput = (attr: CategoryAttribute, values: Record<string, any>, setValues: (v: Record<string, any>) => void) => {
        const value = values[attr.id] || '';

        const handleChange = (val: any) => {
            setValues({ ...values, [attr.id]: val });
        };

        if (attr.type === 'select') {
            return (
                <div key={attr.id} className="space-y-2">
                    <Label>{attr.name} {attr.required && '*'}</Label>
                    <Select value={value} onValueChange={handleChange}>
                        <SelectTrigger className="dark:bg-gray-700">
                            <SelectValue placeholder={attr.placeholder || "Seleccionar..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {(attr.options as string[])?.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        if (attr.type === 'boolean') {
            return (
                <div key={attr.id} className="flex items-center gap-2 pt-8">
                    <Switch checked={value === true} onCheckedChange={handleChange} />
                    <Label>{attr.name}</Label>
                </div>
            );
        }

        return (
            <div key={attr.id} className="space-y-2">
                <Label>{attr.name} {attr.required && '*'}</Label>
                <Input
                    type={attr.type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={attr.placeholder}
                    className="dark:bg-gray-700"
                />
            </div>
        );
    };

    const getCategoryAttributes = (categoryId: string) => {
        const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
        return category?.attributes || [];
    };

    return (
        <Card className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-violet-500/5 overflow-hidden">
            {/* Mesh Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/10 dark:bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <CardHeader className="relative p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                <div>
                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2 dark:text-white">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                            <Package className="h-5 w-5 text-violet-600" />
                        </div>
                        Gestión de Catálogo
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{filteredProducts.length} productos registrados</p>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">Premium View</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleExportProducts} className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                        <Button onClick={() => setIsAddProductOpen(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nuevo</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                <th className="px-6 py-4 font-black">Producto</th>
                                <th className="px-6 py-4 font-black">Categoría</th>
                                <th className="px-6 py-4 font-black">Inversión / Precio</th>
                                <th className="px-6 py-4 font-black">disponibilidad</th>
                                <th className="px-6 py-4 font-black">Estado</th>
                                <th className="px-6 py-4 text-right font-black">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product, index) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.03 }}
                                        className="group hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-all text-sm"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group/img">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 overflow-hidden border dark:border-gray-700 shadow-sm transition-transform duration-500 group-hover:scale-110">
                                                        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : product.name.charAt(0)}
                                                    </div>
                                                    <div className="absolute inset-0 rounded-xl bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{product.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{product.sku || 'REF-NOSKU'}</p>
                                                        {product.isOnSale && (
                                                            <Badge className="h-3.5 text-[8px] bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 uppercase font-black px-1.5">Hot</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium text-[10px] border-0">
                                                {PRODUCT_CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                                                {product.discount && <span className="text-[10px] text-green-600">-{product.discount}% OFF</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${product.stock <= (product.minStock || 5) ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.stock <= (product.minStock || 5) ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                {product.stock} disp.
                                                {product.stock <= (product.minStock || 5) && <AlertTriangle className="h-3 w-3" />}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} className="data-[state=checked]:bg-violet-600" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setSelectedProduct(product)}>Ver</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setEditingProduct(product)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setStockProduct(product); setShowStockModal(true); }}>Stock</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => deleteProduct(product.id)}>Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y dark:divide-gray-800">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="p-4 space-y-3 active:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 overflow-hidden border dark:border-gray-700">
                                        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : product.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase leading-tight">{product.name}</p>
                                        <p className="text-[10px] text-gray-500">{product.category}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingProduct(product)}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setStockProduct(product); setShowStockModal(true); }}>Stock</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => deleteProduct(product.id)}>Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                                    <Badge variant={product.stock <= (product.minStock || 5) ? 'destructive' : 'outline'} className="text-[8px] px-1.5 h-4">
                                        Stock: {product.stock}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500">{product.isActive ? 'Activo' : 'Pausado'}</span>
                                    <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} className="scale-75" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Add Product Dialog */}
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Agregar Nuevo Producto</DialogTitle>
                        <DialogDescription>Completa la información del producto</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Nombre del Producto *</Label><Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nombre del producto" className="dark:bg-gray-700" /></div>
                        <div className="space-y-2"><Label>Descripción</Label><Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Descripción del producto" rows={3} className="dark:bg-gray-700" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Precio de Venta ($) *</Label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>Precio de Costo ($)</Label><Input type="number" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} placeholder="0.00" className="dark:bg-gray-700" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Stock *</Label><Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>Stock Mín. (Alerta)</Label><Input type="number" value={newProduct.minStock} onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })} placeholder="10" className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>SKU / Código</Label><Input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="ABC-123" className="dark:bg-gray-700" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select value={newProduct.category} onValueChange={(val) => setNewProduct({ ...newProduct, category: val, attributes: {} })}>
                                    <SelectTrigger className="dark:bg-gray-700">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRODUCT_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>% Descuento</Label><Input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })} placeholder="0" className="dark:bg-gray-700" /></div>
                        </div>

                        {/* Atributos Dinámicos */}
                        {newProduct.category && getCategoryAttributes(newProduct.category).length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700 space-y-3">
                                <h4 className="text-sm font-medium dark:text-gray-300">Detalles de {PRODUCT_CATEGORIES.find(c => c.id === newProduct.category)?.name}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {getCategoryAttributes(newProduct.category).map(attr =>
                                        renderAttributeInput(attr, newProduct.attributes, (newAttrs) => setNewProduct({ ...newProduct, attributes: newAttrs }))
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                            <Switch checked={newProduct.isOnSale} onCheckedChange={(checked) => setNewProduct({ ...newProduct, isOnSale: checked })} />
                            <Label>Marcar como Oferta Especial</Label>
                        </div>
                        <div className="space-y-3">
                            <Label>Imágenes del Producto (Máx. 2)</Label>

                            <div className="grid grid-cols-3 gap-4">
                                {newProduct.images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-700 group">
                                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(idx, false)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}

                                {newProduct.images.length < 2 && (
                                    <div className="aspect-square">
                                        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-violet-500 dark:hover:border-violet-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center px-2">Click para subir</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400">
                                * Las imágenes se recortarán automáticamente a formato cuadrado (1:1).
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateProduct}>Agregar Producto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Editar Producto</DialogTitle></DialogHeader>
                    {editingProduct && (
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Nombre</Label><Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>Descripción</Label><Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} className="dark:bg-gray-700" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Precio de Venta ($)</Label><Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>Precio de Costo ($)</Label><Input type="number" value={editingProduct.cost || ''} onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Stock</Label><Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>Stock Mín.</Label><Input type="number" value={editingProduct.minStock || ''} onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>SKU</Label><Input value={editingProduct.sku || ''} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} className="dark:bg-gray-700" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select value={editingProduct.category} onValueChange={(val) => setEditingProduct({ ...editingProduct, category: val, attributes: {} })}>
                                        <SelectTrigger className="dark:bg-gray-700">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRODUCT_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>% Descuento</Label><Input type="number" value={editingProduct.discount || ''} onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
                            </div>

                            {/* Atributos Dinámicos Edición */}
                            {editingProduct.category && getCategoryAttributes(editingProduct.category).length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700 space-y-3">
                                    <h4 className="text-sm font-medium dark:text-gray-300">Detalles de {PRODUCT_CATEGORIES.find(c => c.id === editingProduct.category)?.name}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {getCategoryAttributes(editingProduct.category).map(attr =>
                                            renderAttributeInput(attr, editingProduct.attributes || {}, (newAttrs) => setEditingProduct({ ...editingProduct, attributes: newAttrs }))
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-3 pt-2 border-t dark:border-gray-700">
                                <Label>Imágenes (Máx. 2)</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(editingProduct.images || []).map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-700 group">
                                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(idx, true)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {(!editingProduct.images || editingProduct.images.length < 2) && (
                                        <div className="aspect-square">
                                            <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-violet-500 dark:hover:border-violet-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center px-2">Subir</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                        <Button onClick={handleUpdateProduct}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stock Modal */}
            <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
                <DialogContent className="max-w-sm dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Ajustar Stock</DialogTitle><DialogDescription>{stockProduct?.name}</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stock actual: <span className="font-bold dark:text-white">{stockProduct?.stock}</span></p>
                        <div className="space-y-2"><Label>Cantidad a agregar/restar</Label><Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="ej: 10 o -5" className="dark:bg-gray-700" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStockModal(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateStockSubmit}>Aplicar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Detail Dialog */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 border-0 rounded-2xl p-0 gap-0">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left Column: Images */}
                            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-800 p-6 flex flex-col items-center justify-center relative">
                                <div className="aspect-square w-full max-w-[300px] mb-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                                    {selectedProduct.images?.[0] ? (
                                        <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-300">{selectedProduct.name.charAt(0)}</span>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                {selectedProduct.images && selectedProduct.images.length > 1 && (
                                    <div className="flex gap-2 justify-center w-full">
                                        {selectedProduct.images.map((img, idx) => (
                                            <div key={idx} className="w-16 h-16 border-2 border-transparent hover:border-violet-500 rounded-lg overflow-hidden cursor-pointer transition-all">
                                                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Details */}
                            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Badge variant="secondary" className="mb-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200">
                                            {PRODUCT_CATEGORIES.find(c => c.id === selectedProduct.category)?.name || selectedProduct.category}
                                        </Badge>
                                        <DialogTitle className="text-2xl font-bold dark:text-white leading-tight mb-1">
                                            {selectedProduct.name}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500 font-mono">{selectedProduct.sku || 'Sin SKU'}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="md:hidden">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <ScrollArea className="flex-1 -mr-4 pr-4">
                                    <div className="space-y-6">
                                        {/* Price & Stock */}
                                        <div className="flex items-end justify-between border-b dark:border-gray-800 pb-4">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase">Precio</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                        {formatPrice(selectedProduct.price)}
                                                    </span>
                                                    {selectedProduct.discount && (
                                                        <Badge variant="destructive" className="ml-1">-{selectedProduct.discount}%</Badge>
                                                    )}
                                                </div>
                                                {selectedProduct.originalPrice && (
                                                    <p className="text-sm text-gray-400 line-through">
                                                        {formatPrice(selectedProduct.originalPrice)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Stock</p>
                                                <Badge
                                                    variant={selectedProduct.stock <= (selectedProduct.minStock || 5) ? "destructive" : "outline"}
                                                    className="text-base px-3 py-1"
                                                >
                                                    {selectedProduct.stock} uds.
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Cost (Admin Only) */}
                                        {selectedProduct.cost && (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Costo Unitario:</span>
                                                <span className="font-mono font-medium dark:text-gray-300">{formatPrice(selectedProduct.cost)}</span>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {selectedProduct.description && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2 dark:text-gray-200">Descripción</h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                                    {selectedProduct.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Specifications */}
                                        {selectedProduct.attributes && Object.keys(selectedProduct.attributes).length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-3 dark:text-gray-200">Especificaciones</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {Object.entries(selectedProduct.attributes).map(([key, value]) => {
                                                        const category = PRODUCT_CATEGORIES.find(c => c.id === selectedProduct.category);
                                                        const attrName = category?.attributes.find(a => a.id === key)?.name || key;
                                                        // Safe check for value
                                                        const displayValue = value === true ? 'Sí' : value === false ? 'No' : String(value);

                                                        return (
                                                            <div key={key} className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg text-sm">
                                                                <span className="block text-xs text-gray-500 mb-0.5">{attrName}</span>
                                                                <span className="font-medium dark:text-gray-200 truncate block" title={displayValue}>
                                                                    {displayValue}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="mt-6 pt-4 border-t dark:border-gray-800 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>
                                        Cerrar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                                        onClick={() => {
                                            const prod = selectedProduct;
                                            setSelectedProduct(null);
                                            setEditingProduct(prod);
                                        }}
                                    >
                                        Editar Producto
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
