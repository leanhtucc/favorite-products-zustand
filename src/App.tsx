import { FavoriteList } from "./components/FavoriteList";
import { ProductCard } from "./components/ProductCard";

import { products } from "./data/products";

function App() {
  return (
    <main className="app">
      <header className="page-header">
        <span className="eyebrow">
          PRODUCT STORE
        </span>

        <h1>Danh sách sản phẩm</h1>

        <p>
          Chọn những sản phẩm bạn yêu thích
          và quản lý chúng bằng Zustand.
        </p>
      </header>

      <section>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      <FavoriteList />
    </main>
  );
}

export default App;