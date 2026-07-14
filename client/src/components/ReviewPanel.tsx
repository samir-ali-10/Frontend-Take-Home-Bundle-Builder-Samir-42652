import { useMemo } from 'react';
import type { CategoryId, Product } from '../types/catalog';
import { parseLineKey } from '../types/catalog';
import {
  computeTotals,
  formatMoney,
  lineAmounts,
} from '../lib/pricing';
import { useBundleStore } from '../store/bundleStore';
import { QuantityStepper } from './QuantityStepper';
import { ShieldIcon, TruckIcon } from './icons';

const CATEGORY_ORDER: CategoryId[] = [
  'cameras',
  'sensors',
  'accessories',
  'plan',
];

type ReviewLine = {
  key: string;
  product: Product;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
};

export function ReviewPanel() {
  const catalog = useBundleStore((s) => s.catalog);
  const quantities = useBundleStore((s) => s.quantities);
  const productsById = useBundleStore((s) => s.productsById);
  const setQuantity = useBundleStore((s) => s.setQuantity);
  const saveForLater = useBundleStore((s) => s.saveForLater);
  const openCheckout = useBundleStore((s) => s.openCheckout);

  const lines = useMemo(() => {
    const result: ReviewLine[] = [];
    for (const [key, quantity] of Object.entries(quantities)) {
      if (quantity <= 0) continue;
      const { productId, variantId } = parseLineKey(key);
      const product = productsById.get(productId);
      if (!product) continue;
      const variant = variantId
        ? product.variants.find((v) => v.id === variantId)
        : null;
      result.push({
        key,
        product,
        variantId,
        variantLabel: variant?.label ?? null,
        quantity,
      });
    }
    return result;
  }, [quantities, productsById]);

  const grouped = useMemo(() => {
    const map = new Map<CategoryId, ReviewLine[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const line of lines) {
      map.get(line.product.category)?.push(line);
    }
    return map;
  }, [lines]);

  const totals = useMemo(
    () => computeTotals(quantities, productsById),
    [quantities, productsById],
  );

  if (!catalog) return null;

  const hasDiscount = totals.savings > 0.009;

  return (
    <aside className="review" id="review-panel">
      <header className="review__header">
        <p className="review__eyebrow">Review</p>
        <h2 className="review__title">Your security system</h2>
        <p className="review__subtitle">
          Review your personalized protection system designed to keep what
          matters most safe.
        </p>
      </header>

      <div className="review__body">
        <div className="review__lines">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped.get(category) ?? [];
            if (!items.length) return null;
            return (
              <section key={category} className="review-group">
                <h3 className="review-group__label">
                  {catalog.categoryLabels[category]}
                </h3>
                <ul className="review-group__list">
                  {items.map((line) => {
                    const amounts = lineAmounts(line.product, line.quantity);
                    const name = line.variantLabel
                      ? `${line.product.name} · ${line.variantLabel}`
                      : line.product.name;
                    const displayName = line.product.isRequired
                      ? `${line.product.name} (Required)`
                      : name;
                    const isPlan = line.product.category === 'plan';
                    const nameParts = line.product.name.split(' ');
                    const planFirst = nameParts[0] ?? line.product.name;
                    const planRest = nameParts.slice(1).join(' ');

                    return (
                      <li
                        key={line.key}
                        className={`review-line${isPlan ? ' review-line--plan' : ''}`}
                      >
                        {isPlan ? (
                          <span className="review-line__plan-icon" aria-hidden="true">
                            <ShieldIcon size={28} />
                          </span>
                        ) : (
                          <img
                            className="review-line__thumb"
                            src={
                              line.variantId
                                ? line.product.variants.find(
                                    (v) => v.id === line.variantId,
                                  )?.image || line.product.image
                                : line.product.image
                            }
                            alt=""
                          />
                        )}
                        <p className="review-line__name">
                          {isPlan ? (
                            <>
                              <span className="review-line__plan-name-plain">
                                {planFirst}
                              </span>
                              {planRest ? (
                                <>
                                  {' '}
                                  <span className="review-line__plan-name-accent">
                                    {planRest}
                                  </span>
                                </>
                              ) : null}
                            </>
                          ) : (
                            displayName
                          )}
                        </p>
                        {!isPlan ? (
                          <QuantityStepper
                            variant="square"
                            size="sm"
                            value={line.quantity}
                            onChange={(next) =>
                              setQuantity(
                                line.product.id,
                                line.variantId,
                                next,
                              )
                            }
                            aria-label={`Quantity for ${displayName}`}
                          />
                        ) : null}
                        <div className="review-line__price">
                          {line.product.isFree ||
                          (line.product.price === 0 &&
                            !line.product.billingPeriod) ? (
                            <>
                              {line.product.compareAtPrice != null ? (
                                <span className="price price--compare-muted">
                                  {formatMoney(
                                    line.product.compareAtPrice *
                                      line.quantity,
                                  )}
                                </span>
                              ) : null}
                              <span className="price price--accent">FREE</span>
                            </>
                          ) : (
                            <>
                              {amounts.compare > amounts.current ? (
                                <span className="price price--compare-muted">
                                  {formatMoney(amounts.compare)}
                                  {line.product.billingPeriod ? '/mo' : ''}
                                </span>
                              ) : null}
                              <span className="price price--accent">
                                {formatMoney(amounts.current)}
                                {line.product.billingPeriod ? '/mo' : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <div className="review-shipping">
            <div className="review-shipping__left">
              <TruckIcon className="review-shipping__icon" />
              <span>{catalog.shipping.label}</span>
            </div>
            <div className="review-line__price">
              <span className="price price--compare-muted">
                {formatMoney(catalog.shipping.compareAtPrice)}
              </span>
              <span className="price price--accent">FREE</span>
            </div>
          </div>
        </div>

        <div className="review__summary">
          <div className="review__trust">
            <img
              className="guarantee-seal"
              src="/images/guarantee-seal.png"
              alt="100% Wyze satisfaction guarantee"
            />
            <div className="review__returns">
              <strong>30-day hassle-free returns</strong>
              <p>Change your mind? Send it back — no questions asked.</p>
            </div>
          </div>

          <div className="review__totals">
            <span className="financing-pill">
              as low as {formatMoney(catalog.financing.monthlyAmount)}/mo
            </span>

            <div className="review__total-row">
              {hasDiscount ? (
                <span className="price price--compare-muted review__compare-total">
                  {formatMoney(totals.compare)}
                </span>
              ) : null}
              <span className="review__grand-total">
                {formatMoney(totals.current)}
              </span>
            </div>

            {hasDiscount ? (
              <p className="review__savings">
                Congrats! You&apos;re saving {formatMoney(totals.savings)} on
                your security bundle!
              </p>
            ) : null}

            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={openCheckout}
            >
              Checkout
            </button>

            <button
              type="button"
              className="review__save-link"
              onClick={saveForLater}
            >
              Save my system for later
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
