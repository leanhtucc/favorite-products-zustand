import { create } from "zustand";

import type { Product } from "../types/product";

interface FavoritesState {
  favorites: Product[];

  addFavorite: (product: Product) => void;

  removeFavorite: (productId: string) => void;

  toggleFavorite: (product: Product) => void;
}

export const useFavoritesStore = create<FavoritesState>(
  (set) => ({
    favorites: [],

    addFavorite: (product) =>
      set((state) => {
        const exists = state.favorites.some(
          (item) => item.id === product.id
        );

        if (exists) {
          return state;
        }

        return {
          favorites: [
            ...state.favorites,
            product,
          ],
        };
      }),

    removeFavorite: (productId) =>
      set((state) => ({
        favorites: state.favorites.filter(
          (item) => item.id !== productId
        ),
      })),

    toggleFavorite: (product) =>
      set((state) => {
        const exists = state.favorites.some(
          (item) => item.id === product.id
        );

        if (exists) {
          return {
            favorites: state.favorites.filter(
              (item) =>
                item.id !== product.id
            ),
          };
        }

        return {
          favorites: [
            ...state.favorites,
            product,
          ],
        };
      }),
  })
);