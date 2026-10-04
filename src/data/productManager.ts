import type { ProductMangers } from "../types/product"

const categories = ["Điện thoại", "Laptop", "Tablet", "Phụ kiện"]

export const generateProducts = (count: number): ProductMangers[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const name = `Sản phẩm ${id}`

    return {
      id,
      name,
      normalizedName: name.toLowerCase(),
      price: Math.floor(Math.random() * 2000 + 100) * 1000,
      category: categories[index % categories.length],
      status: index % 3 === 0 ? "Còn hàng" : "Hết hàng",
      image: `https://picsum.photos/100/100?random=${id}`,
    }
  })
