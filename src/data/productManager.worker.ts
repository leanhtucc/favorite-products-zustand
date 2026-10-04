import { generateProducts } from "./productManager"

self.postMessage(generateProducts(10_000))
