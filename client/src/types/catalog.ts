export type CategoryId = 'cameras' | 'sensors' | 'accessories' | 'plan';

export type Variant = {
  id: string;
  label: string;
  swatch: string;
  swatchBorder?: string;
  /** Optional product photo for this color; falls back to product.image */
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  learnMoreUrl: string;
  category: CategoryId;
  image: string;
  badge: string | null;
  price: number;
  compareAtPrice: number | null;
  billingPeriod?: 'mo';
  isFree?: boolean;
  isRequired?: boolean;
  variants: Variant[];
};

export type Step = {
  id: string;
  title: string;
  nextLabel: string;
  icon: 'camera' | 'shield' | 'sensor' | 'grid';
  category: CategoryId;
  productIds: string[];
};

export type SelectionLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type ShippingInfo = {
  id: string;
  label: string;
  compareAtPrice: number;
  price: number;
  isFree: boolean;
};

export type Catalog = {
  shipping: ShippingInfo;
  financing: { monthlyAmount: number };
  steps: Step[];
  products: Product[];
  initialSelections: SelectionLine[];
  categoryLabels: Record<CategoryId, string>;
};

/** Stable line key used for cart quantity lookups. */
export function lineKey(productId: string, variantId: string | null): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function parseLineKey(key: string): {
  productId: string;
  variantId: string | null;
} {
  const sep = key.indexOf('::');
  if (sep === -1) return { productId: key, variantId: null };
  return {
    productId: key.slice(0, sep),
    variantId: key.slice(sep + 2),
  };
}
