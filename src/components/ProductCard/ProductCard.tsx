import { memo } from "react"
import type { ProductMangers } from "../../types/product"
import { useFavoritesStore } from "../../stores/favoritesStore"

const ProductCardComponent = ({ product }: { product: ProductMangers }) => {
    const isFavorite = useFavoritesStore((state) => state.favoriteIds.has(product.id))
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

    return (
        <article className="product-card product-card--catalog">
            <div className="product-card__media">
            <img
                src={product.image}
                alt={product.name}
                width="96"
                height="128"
                loading="lazy"
                decoding="async"
            />
                <span className="product-card__category">{product.category}</span>
            </div>

            <div className="product-card__content">
                <div className="product-card__heading">
                    <div>
                        <span className="product-card__eyebrow">Sản phẩm</span>
                        <h3>{product.name}</h3>
                    </div>
                    <button
                        type="button"
                        className={`product-card__favorite${isFavorite ? " is-active" : ""}`}
                        onClick={() => toggleFavorite(product)}
                        aria-label={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                        aria-pressed={isFavorite}
                    >
                        {isFavorite ? "♥" : "♡"}
                    </button>
                </div>

                <div className="product-card__footer">
                    <div>
                        <p className="product-card__price-label">Giá bán</p>
                        <p className="product-card__price">
                            {product.price.toLocaleString("vi-VN")} <span>₫</span>
                        </p>
                    </div>
                    <span className={`product-card__status${product.status === "Còn hàng" ? " is-in-stock" : ""}`}>
                        <span aria-hidden="true" />
                        {product.status}
                    </span>
                </div>

                <button
                    type="button"
                    className={`product-card__action${isFavorite ? " is-active" : ""}`}
                    onClick={() => toggleFavorite(product)}
                >
                    {isFavorite ? "Đã thêm yêu thích" : "Thêm vào yêu thích"}
                </button>
            </div>
        </article>
    )
}

export const ProductCard = memo(ProductCardComponent)
