import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { Header } from "../components/Header/Header"
import { ProductList } from "../components/ProductList/ProductList"
import { SearchBar } from "../components/SearchBar/SearchBar"
import type { ProductMangers } from "../types/product"

export const ProductManagement = () => {
    const [keyword, setKeyWord] = useState("")
    const [productManagers, setProductManagers] = useState<ProductMangers[]>([])
    const [loadError, setLoadError] = useState(false)
    const [workerAttempt, setWorkerAttempt] = useState(0)
    const deferredKeyword = useDeferredValue(keyword)

    useEffect(() => {
        const worker = new Worker(
            new URL("../data/productManager.worker.ts", import.meta.url),
            { type: "module" },
        )

        worker.onmessage = (event: MessageEvent<ProductMangers[]>) => {
            setProductManagers(event.data)
            setLoadError(false)
            worker.terminate()
        }

        worker.onerror = () => {
            setLoadError(true)
            worker.terminate()
        }

        return () => worker.terminate()
    }, [workerAttempt])

    const retryLoadingProducts = () => {
        setProductManagers([])
        setLoadError(false)
        setWorkerAttempt((attempt) => attempt + 1)
    }

    const filteredProducts = useMemo(() => {
        const normalizedKeyword = deferredKeyword.trim().toLowerCase()

        if (!normalizedKeyword) return productManagers

        return productManagers.filter((product) =>
            product.normalizedName.includes(normalizedKeyword)
        )
    }, [deferredKeyword, productManagers])
    return (
        <div className="container">
            <Header />
            <SearchBar
                value={keyword}
                onChange={setKeyWord}
            />
            <p>
                {loadError
                    ? "Không thể tải danh sách sản phẩm. Vui lòng thử lại."
                    : productManagers.length === 0
                      ? "Đang chuẩn bị danh sách sản phẩm..."
                      : `Tìm thấy: ${filteredProducts.length} sản phẩm`}
            </p>

            {loadError && (
                <button type="button" onClick={retryLoadingProducts}>
                    Thử tải lại
                </button>
            )}

            {!loadError && <ProductList products={filteredProducts} />}
        </div>
    )
}
