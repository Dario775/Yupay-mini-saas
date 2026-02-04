
import { useState } from 'react';
import { Package, Search, Plus, Download, MoreHorizontal, AlertTriangle, Upload } from 'lucide-react';
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
import type { Product } from '@/types';
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

    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', stock: '', category: '',
        discount: '', isOnSale: false, cost: '', sku: '', minStock: ''
    });

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
            storeId: 'store1', // Should ideally come from context or props
            name: newProduct.name,
            description: newProduct.description,
            price: finalPrice,
            originalPrice: originalPrice,
            stock: parseInt(newProduct.stock),
            category: newProduct.category || 'General',
            images: [],
            isActive: true,
            discount: discount || undefined,
            isOnSale: newProduct.isOnSale,
            cost: newProduct.cost ? parseFloat(newProduct.cost) : undefined,
            sku: newProduct.sku || undefined,
            minStock: newProduct.minStock ? parseInt(newProduct.minStock) : undefined,
        });
        toast.success('Producto agregado exitosamente');
        setNewProduct({
            name: '', description: '', price: '', stock: '', category: '',
            discount: '', isOnSale: false, cost: '', sku: '', minStock: ''
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

    return (
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                        <Package className="h-4 w-4 text-violet-500" />
                        Catálogo
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{filteredProducts.length} productos</p>
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
                            <tr className="border-b dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3">Categoría</th>
                                <th className="px-6 py-3">Precio</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors text-sm">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 overflow-hidden border dark:border-gray-700">
                                                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : product.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white leading-tight">{product.name}</p>
                                                <p className="text-[10px] text-gray-500 line-clamp-1">{product.sku || 'Sin SKU'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                                            {product.discount && <span className="text-[10px] text-green-600">-{product.discount}% OFF</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 ${product.stock <= (product.minStock || 5) ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {product.stock}
                                            {product.stock <= (product.minStock || 5) && <AlertTriangle className="h-3 w-3" />}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} className="scale-75 origin-left" />
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
                                </tr>
                            ))}
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
                <DialogContent className="max-w-lg dark:bg-gray-800">
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
                            <div className="space-y-2"><Label>Categoría</Label><Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Categoría" className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>% Descuento</Label><Input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })} placeholder="0" className="dark:bg-gray-700" /></div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Switch checked={newProduct.isOnSale} onCheckedChange={(checked) => setNewProduct({ ...newProduct, isOnSale: checked })} />
                            <Label>Marcar como Oferta Especial</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Imágenes</Label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Subir imágenes</p>
                            </div>
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
                <DialogContent className="max-w-lg dark:bg-gray-800">
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
                                <div className="space-y-2"><Label>Categoría</Label><Input value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>% Descuento</Label><Input type="number" value={editingProduct.discount || ''} onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Switch checked={editingProduct.isOnSale || false} onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isOnSale: checked })} />
                                <Label>Marcar como Oferta Especial</Label>
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
                <DialogContent className="max-w-lg dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">{selectedProduct?.name}</DialogTitle><DialogDescription>{selectedProduct?.description}</DialogDescription></DialogHeader>
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center text-6xl font-bold text-gray-500 dark:text-gray-400 overflow-hidden">
                                {selectedProduct.images?.[0] ? <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" /> : selectedProduct.name.charAt(0)}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-500 dark:text-gray-400">Categoría</label><p className="font-medium dark:text-white">{selectedProduct.category}</p></div>
                                <div><label className="text-sm text-gray-500 dark:text-gray-400">Precio</label><p className="font-medium text-xl dark:text-white">{formatPrice(selectedProduct.price)}</p></div>
                                <div><label className="text-sm text-gray-500 dark:text-gray-400">Stock</label><p className="font-medium dark:text-white">{selectedProduct.stock} unidades</p></div>
                                <div><label className="text-sm text-gray-500 dark:text-gray-400">Estado</label><p><Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>{selectedProduct.isActive ? 'Activo' : 'Inactivo'}</Badge></p></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
