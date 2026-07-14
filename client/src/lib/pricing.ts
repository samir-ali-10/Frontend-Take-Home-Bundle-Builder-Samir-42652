import type { Catalog, Product, SelectionLine } from '../types/catalog';
import { lineKey } from '../types/catalog';

export type QuantityMap = Record<string, number>;

export function selectionsToMap(lines: SelectionLine[]): QuantityMap {
  const map: QuantityMap = {};
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    map[lineKey(line.productId, line.variantId)] = line.quantity;
  }
  return map;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function productUnitCompare(product: Product): number {
  if (product.compareAtPrice != null) return product.compareAtPrice;
  return product.price;
}

export function lineAmounts(
  product: Product,
  quantity: number,
): { current: number; compare: number } {
  return {
    current: product.price * quantity,
    compare: productUnitCompare(product) * quantity,
  };
}

export type Totals = {
  current: number;
  compare: number;
  savings: number;
};

export function computeTotals(
  quantities: QuantityMap,
  productsById: Map<string, Product>,
): Totals {
  let current = 0;
  let compare = 0;

  for (const [key, qty] of Object.entries(quantities)) {
    if (qty <= 0) continue;
    const productId = key.includes('::') ? key.slice(0, key.indexOf('::')) : key;
    const product = productsById.get(productId);
    if (!product) continue;
    const amounts = lineAmounts(product, qty);
    current += amounts.current;
    compare += amounts.compare;
  }

  return {
    current: Math.round(current * 100) / 100,
    compare: Math.round(compare * 100) / 100,
    savings: Math.round(Math.max(0, compare - current) * 100) / 100,
  };
}

export function countDistinctProductsInStep(
  productIds: string[],
  quantities: QuantityMap,
): number {
  let count = 0;
  for (const productId of productIds) {
    const hasAny = Object.entries(quantities).some(([key, qty]) => {
      if (qty <= 0) return false;
      return key === productId || key.startsWith(`${productId}::`);
    });
    if (hasAny) count += 1;
  }
  return count;
}

export function defaultActiveVariants(
  products: Product[],
  quantities: QuantityMap,
): Record<string, string> {
  const active: Record<string, string> = {};
  for (const product of products) {
    if (!product.variants.length) continue;
    const withQty = product.variants.find(
      (v) => (quantities[lineKey(product.id, v.id)] ?? 0) > 0,
    );
    active[product.id] = withQty?.id ?? product.variants[0].id;
  }
  return active;
}

export function indexProducts(catalog: Catalog): Map<string, Product> {
  return new Map(catalog.products.map((p) => [p.id, p]));
}
