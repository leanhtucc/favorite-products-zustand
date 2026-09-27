import type { Product } from "../types/product";

import { useFavoritesStore } from "../stores/favoritesStore";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({
    product,
}: ProductCardProps) {
    const favorites = useFavoritesStore(
        (state) => state.favorites
    );

    const toggleFavorite = useFavoritesStore(
        (state) => state.toggleFavorite
    );

    const isFavorite = favorites.some(
        (item) => item.id === product.id
    );

    return (
        <article className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                />

                <button
                    type="button"
                    className={`favorite-button ${isFavorite ? "active" : ""
                        }`}
                    onClick={() =>
                        toggleFavorite(product)
                    }
                    aria-label={
                        isFavorite
                            ? "Bỏ khỏi yêu thích"
                            : "Thêm vào yêu thích"
                    }
                >
                    {isFavorite ? "♥" : "♡"}
                </button>
            </div>

            <div className="product-content">
                <h3>{product.name}</h3>

                <p className="price">
                    {product.price.toLocaleString(
                        "vi-VN"
                    )}
                    đ
                </p>

                <button
                    type="button"
                    className={
                        isFavorite
                            ? "remove-button"
                            : "add-button"
                    }
                    onClick={() =>
                        toggleFavorite(product)
                    }
                >
                    {isFavorite
                        ? "Bỏ yêu thích"
                        : "Thêm yêu thích"}
                </button>
            </div>
        </article>
    );
}