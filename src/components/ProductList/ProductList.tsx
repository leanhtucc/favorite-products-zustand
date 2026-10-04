/* eslint-disable react-hooks/set-state-in-effect */
import { memo, useEffect, useMemo, useRef, useState } from "react"
import type { ProductMangers } from "../../types/product"
import { ProductCard } from "../ProductCard/ProductCard"

const ROW_HEIGHT = 176
const MIN_COLUMN_WIDTH = 340
const OVERSCAN_ROWS = 2

const ProductListComponent = ({ products }: { products: ProductMangers[] }) => {
    const viewportRef = useRef<HTMLDivElement>(null)
    const [viewportHeight, setViewportHeight] = useState(600)
    const [viewportWidth, setViewportWidth] = useState(0)
    const [firstVisibleRow, setFirstVisibleRow] = useState(0)

    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const observer = new ResizeObserver(([entry]) => {
            const { height, width } = entry.contentRect
            setViewportHeight((current) => current === height ? current : height)
            setViewportWidth((current) => current === width ? current : width)
        })

        observer.observe(viewport)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (viewportRef.current) viewportRef.current.scrollTop = 0
        setFirstVisibleRow(0)
    }, [products])

    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        let animationFrame = 0
        const handleScroll = () => {
            if (animationFrame) return

            animationFrame = requestAnimationFrame(() => {
                animationFrame = 0
                const nextRow = Math.floor(viewport.scrollTop / ROW_HEIGHT)
                setFirstVisibleRow((current) => current === nextRow ? current : nextRow)
            })
        }

        viewport.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            viewport.removeEventListener("scroll", handleScroll)
            if (animationFrame) cancelAnimationFrame(animationFrame)
        }
    }, [])

    const columnCount = Math.max(1, Math.floor((viewportWidth + 16) / MIN_COLUMN_WIDTH))
    const rowCount = Math.ceil(products.length / columnCount)
    const visibleRowCount = Math.ceil(viewportHeight / ROW_HEIGHT)
    const startRow = Math.max(0, firstVisibleRow - OVERSCAN_ROWS)
    const endRow = Math.min(rowCount, firstVisibleRow + visibleRowCount + OVERSCAN_ROWS)

    const visibleRows = useMemo(() => {
        return Array.from({ length: endRow - startRow }, (_, rowOffset) => {
            const rowIndex = startRow + rowOffset
            const rowProducts = products.slice(
                rowIndex * columnCount,
                (rowIndex + 1) * columnCount,
            )

            return { rowIndex, products: rowProducts }
        })
    }, [columnCount, endRow, products, startRow])

    return (
        <div
            className="product-list-viewport"
            ref={viewportRef}
            role="list"
            aria-label="Danh sách sản phẩm"
        >
            <div className="product-list-canvas" style={{ height: rowCount * ROW_HEIGHT }}>
                {visibleRows.map(({ rowIndex, products: rowProducts }) => (
                    <div
                        className="product-list-row"
                        key={rowIndex}
                        role="presentation"
                        style={{
                            top: rowIndex * ROW_HEIGHT,
                            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        }}
                    >
                        {rowProducts.map((product) => (
                            <div role="listitem" key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export const ProductList = memo(ProductListComponent)
