
import { Heart } from 'lucide-react';
import { ProductCard } from './components/ProductCard';
import type { Product } from '@/types';

interface FavoritesViewProps {
    favoriteProducts: Product[];
    addToCart: (product: Product) => void;
    isFavorite: (id: string) => boolean;
    onToggleFavorite: (id: string) => void;
    setSelectedProduct: (product: Product | null) => void;
}

export function FavoritesView({
    favoriteProducts,
    addToCart,
    isFavorite,
    onToggleFavorite,
    setSelectedProduct
}: FavoritesViewProps) {
    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Mis Favoritos</h2>
                <p className="text-gray-600 dark:text-gray-400">Productos que te gustan</p>
            </div>

            {favoriteProducts.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes favoritos</h3>
                    <p className="text-gray-500 dark:text-gray-400">Guarda productos que te gusten para verlos aquí</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favoriteProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            isFavorite={isFavorite(product.id)}
                            onToggleFavorite={onToggleFavorite}
                            onView={setSelectedProduct}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
