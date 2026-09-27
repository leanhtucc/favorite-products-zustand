import { useFavoritesStore } from "../stores/favoritesStore";

export function FavoriteList() {
    const favorites = useFavoritesStore(
        (state) => state.favorites
    );

    const removeFavorite = useFavoritesStore(
        (state) => state.removeFavorite
    );

    return (
        <section className="favorite-section">
            <div className="section-heading">
                <div>
                    <span className="eyebrow">
                        FAVORITES
                    </span>

                    <h2>Sản phẩm yêu thích</h2>
                </div>

                <span className="favorite-count">
                    {favorites.length}
                </span>
            </div>

            {favorites.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-heart">
                        ♡
                    </span>

                    <h3>Chưa có sản phẩm yêu thích</h3>

                    <p>
                        Hãy chọn sản phẩm bạn quan tâm
                        ở danh sách phía trên.
                    </p>
                </div>
            ) : (
                <div className="favorite-list">
                    {favorites.map((product) => (
                        <div
                            key={product.id}
                            className="favorite-item"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                            />

                            <div className="favorite-info">
                                <strong>
                                    {product.name}
                                </strong>

                                <span>
                                    {product.price.toLocaleString(
                                        "vi-VN"
                                    )}
                                    đ
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    removeFavorite(product.id)
                                }
                            >
                                Bỏ
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}