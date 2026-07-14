import { create } from 'zustand';
import type { Catalog, Product } from '../types/catalog';
import { lineKey } from '../types/catalog';
import {
  defaultActiveVariants,
  indexProducts,
  selectionsToMap,
  type QuantityMap,
} from '../lib/pricing';
import {
  loadPersistedBundle,
  savePersistedBundle,
} from '../lib/persistence';

type BundleState = {
  catalog: Catalog | null;
  productsById: Map<string, Product>;
  quantities: QuantityMap;
  activeVariants: Record<string, string>;
  openStepId: string;
  hydrated: boolean;
  toast: string | null;
  checkoutOpen: boolean;
  initFromCatalog: (catalog: Catalog) => void;
  setOpenStep: (stepId: string) => void;
  setActiveVariant: (productId: string, variantId: string) => void;
  setQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  adjustQuantity: (
    productId: string,
    variantId: string | null,
    delta: number,
  ) => void;
  saveForLater: () => void;
  clearToast: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
};

function clampQty(n: number): number {
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(99, Math.floor(n));
}

export const useBundleStore = create<BundleState>((set, get) => ({
  catalog: null,
  productsById: new Map(),
  quantities: {},
  activeVariants: {},
  openStepId: 'cameras',
  hydrated: false,
  toast: null,
  checkoutOpen: false,

  initFromCatalog: (catalog) => {
    const productsById = indexProducts(catalog);
    const persisted = loadPersistedBundle();

    if (persisted) {
      set({
        catalog,
        productsById,
        quantities: persisted.quantities,
        activeVariants: {
          ...defaultActiveVariants(catalog.products, persisted.quantities),
          ...persisted.activeVariants,
        },
        openStepId: persisted.openStepId || catalog.steps[0]?.id || 'cameras',
        hydrated: true,
      });
      return;
    }

    const quantities = selectionsToMap(catalog.initialSelections);
    set({
      catalog,
      productsById,
      quantities,
      activeVariants: defaultActiveVariants(catalog.products, quantities),
      openStepId: catalog.steps[0]?.id ?? 'cameras',
      hydrated: true,
    });
  },

  setOpenStep: (stepId) => set({ openStepId: stepId }),

  setActiveVariant: (productId, variantId) =>
    set((state) => ({
      activeVariants: { ...state.activeVariants, [productId]: variantId },
    })),

  setQuantity: (productId, variantId, quantity) => {
    const product = get().productsById.get(productId);
    if (!product) return;

    const key = lineKey(productId, variantId);
    const nextQty = clampQty(quantity);

    set((state) => {
      const quantities = { ...state.quantities };

      // Plans are mutually exclusive — picking one clears the others.
      if (product.category === 'plan' && nextQty > 0) {
        for (const p of state.catalog?.products ?? []) {
          if (p.category === 'plan') {
            delete quantities[lineKey(p.id, null)];
          }
        }
        quantities[key] = 1;
      } else if (nextQty <= 0) {
        delete quantities[key];
      } else {
        quantities[key] = nextQty;
      }

      return { quantities };
    });
  },

  adjustQuantity: (productId, variantId, delta) => {
    const key = lineKey(productId, variantId);
    const current = get().quantities[key] ?? 0;
    get().setQuantity(productId, variantId, current + delta);
  },

  saveForLater: () => {
    const { quantities, activeVariants, openStepId } = get();
    savePersistedBundle({ quantities, activeVariants, openStepId });
    set({ toast: 'System saved. Come back anytime — it’ll be waiting.' });
  },

  clearToast: () => set({ toast: null }),
  openCheckout: () => set({ checkoutOpen: true }),
  closeCheckout: () => set({ checkoutOpen: false }),
}));
