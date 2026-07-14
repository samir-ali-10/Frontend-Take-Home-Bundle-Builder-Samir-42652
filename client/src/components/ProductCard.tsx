import type { Product, Variant } from '../types/catalog';
import { lineKey } from '../types/catalog';
import { formatMoney } from '../lib/pricing';
import { useBundleStore } from '../store/bundleStore';
import { QuantityStepper } from './QuantityStepper';

type ProductCardProps = {
  product: Product;
};

function resolveImage(product: Product, variant: Variant | undefined): string {
  return variant?.image || product.image;
}

export function ProductCard({ product }: ProductCardProps) {
  const quantities = useBundleStore((s) => s.quantities);
  const activeVariants = useBundleStore((s) => s.activeVariants);
  const setActiveVariant = useBundleStore((s) => s.setActiveVariant);
  const setQuantity = useBundleStore((s) => s.setQuantity);

  const hasVariants = product.variants.length > 0;
  const activeVariantId = hasVariants
    ? (activeVariants[product.id] ?? product.variants[0].id)
    : null;
  const activeVariant = hasVariants
    ? product.variants.find((v) => v.id === activeVariantId)
    : undefined;

  const activeKey = lineKey(product.id, activeVariantId);
  const activeQty = quantities[activeKey] ?? 0;

  const totalSelectedQty = hasVariants
    ? product.variants.reduce(
        (sum, v) => sum + (quantities[lineKey(product.id, v.id)] ?? 0),
        0,
      )
    : activeQty;

  const isSelected = totalSelectedQty > 0;
  const isPlan = product.category === 'plan';
  const showCompare =
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price &&
    !product.isFree;

  const displayImage = resolveImage(product, activeVariant);

  function handleVariantSelect(variant: Variant) {
    setActiveVariant(product.id, variant.id);
  }

  function handleQtyChange(next: number) {
    if (isPlan) {
      setQuantity(product.id, null, next > 0 ? 1 : 0);
      return;
    }
    setQuantity(product.id, activeVariantId, next);
  }

  function priceLabel(amount: number): string {
    const base = formatMoney(amount);
    return product.billingPeriod ? `${base}/mo` : base;
  }

  return (
    <article
      className={`product-card${isSelected ? ' product-card--selected' : ''}`}
    >
      <div className="product-card__media">
        {product.badge ? (
          <span className="product-card__badge">{product.badge}</span>
        ) : null}
        <img src={displayImage} alt="" loading="lazy" />
      </div>

      <div className="product-card__main">
        <div className="product-card__content">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__desc">{product.description}</p>
          <a
            className="product-card__learn"
            href={product.learnMoreUrl}
            onClick={(e) => e.preventDefault()}
          >
            Learn More
          </a>

          {hasVariants ? (
            <div className="variant-row" role="radiogroup" aria-label="Color">
              {product.variants.map((variant) => {
                const selected = variant.id === activeVariantId;
                const thumb = resolveImage(product, variant);
                return (
                  <button
                    key={variant.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`variant-chip${selected ? ' variant-chip--active' : ''}`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    {variant.image ? (
                      <img
                        className="variant-chip__thumb"
                        src={thumb}
                        alt=""
                      />
                    ) : (
                      <span
                        className="variant-chip__swatch"
                        style={{
                          backgroundColor: variant.swatch,
                          borderColor: variant.swatchBorder ?? '#d0d5dd',
                        }}
                      />
                    )}
                    <span className="variant-chip__label">{variant.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="product-card__footer">
          <QuantityStepper
            variant="square"
            value={activeQty}
            onChange={handleQtyChange}
            max={isPlan ? 1 : 99}
            aria-label={`Quantity for ${product.name}${
              activeVariantId ? ` ${activeVariantId}` : ''
            }`}
          />

          <div className="product-card__pricing">
            {product.isFree ? (
              <>
                {product.compareAtPrice != null ? (
                  <span className="price price--compare">
                    {formatMoney(product.compareAtPrice)}
                  </span>
                ) : null}
                <span className="price price--current">FREE</span>
              </>
            ) : (
              <>
                {showCompare ? (
                  <span className="price price--compare">
                    {priceLabel(product.compareAtPrice!)}
                  </span>
                ) : null}
                <span className="price price--current">
                  {product.price === 0 ? 'FREE' : priceLabel(product.price)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
