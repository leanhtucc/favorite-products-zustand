import { create } from "zustand";

import type { Product } from "../types/product";

interface FavoritesState {
  favorites: Product[];
  favoriteIds: ReadonlySet<string | number>;

  addFavorite: (product: Product) => void;

  removeFavorite: (productId: string | number) => void;

  toggleFavorite: (product: Product) => void;
}

export const useFavoritesStore = create<FavoritesState>(
  (set) => ({
    favorites: [],
    favoriteIds: new Set(),

    addFavorite: (product) =>
      set((state) => state.favoriteIds.has(product.id)
        ? state
        : {
          favorites: [...state.favorites, product],
          favoriteIds: new Set(state.favoriteIds).add(product.id),
        }),

    removeFavorite: (productId) =>
      set((state) => {
        if (!state.favoriteIds.has(productId)) return state

        const favoriteIds = new Set(state.favoriteIds)
        favoriteIds.delete(productId)

        return {
          favorites: state.favorites.filter((item) => item.id !== productId),
          favoriteIds,
        }
      }),

    toggleFavorite: (product) =>
      set((state) => {
        const favoriteIds = new Set(state.favoriteIds)

        if (favoriteIds.has(product.id)) {
          favoriteIds.delete(product.id)
          return {
            favorites: state.favorites.filter((item) => item.id !== product.id),
            favoriteIds,
          }
        }

        favoriteIds.add(product.id)
        return {
          favorites: [...state.favorites, product],
          favoriteIds,
        }
      }),
  })
);
