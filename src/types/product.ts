export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
}
export interface ProductMangers {
    id: number | string,
    image: string;
    name: string;
    normalizedName: string;
    category: string;
    price: number;
    status: string;
}
