import type { Step } from '../types/catalog';
import { countDistinctProductsInStep } from '../lib/pricing';
import { useBundleStore } from '../store/bundleStore';
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GridIcon,
  SensorIcon,
  ShieldIcon,
} from './icons';
import { ProductCard } from './ProductCard';

const stepIcons = {
  camera: CameraIcon,
  shield: ShieldIcon,
  sensor: SensorIcon,
  grid: GridIcon,
} as const;

type BuilderAccordionProps = {
  steps: Step[];
};

export function BuilderAccordion({ steps }: BuilderAccordionProps) {
  const catalog = useBundleStore((s) => s.catalog);
  const openStepId = useBundleStore((s) => s.openStepId);
  const quantities = useBundleStore((s) => s.quantities);
  const setOpenStep = useBundleStore((s) => s.setOpenStep);
  const productsById = useBundleStore((s) => s.productsById);

  if (!catalog) return null;

  return (
    <div className="builder">
      {steps.map((step, index) => {
        const isOpen = step.id === openStepId;
        const selectedCount = countDistinctProductsInStep(
          step.productIds,
          quantities,
        );
        const Icon = stepIcons[step.icon];
        const products = step.productIds
          .map((id) => productsById.get(id))
          .filter(Boolean);

        return (
          <section
            key={step.id}
            className={`accordion-step${isOpen ? ' accordion-step--open' : ''}`}
          >
            <button
              type="button"
              className="accordion-step__header"
              aria-expanded={isOpen}
              onClick={() => setOpenStep(isOpen ? '' : step.id)}
            >
              <span className="accordion-step__label">
                Step {index + 1} of {steps.length}
              </span>

              <div className="accordion-step__row">
                <div className="accordion-step__title-row">
                  <Icon className="accordion-step__icon" size={30} />
                  <h2 className="accordion-step__title">{step.title}</h2>
                </div>

                <div className="accordion-step__state">
                  {isOpen && selectedCount > 0 ? (
                    <span className="accordion-step__count">
                      {selectedCount} selected
                    </span>
                  ) : null}
                  {isOpen ? (
                    <ChevronUpIcon className="accordion-step__chevron" />
                  ) : (
                    <ChevronDownIcon className="accordion-step__chevron" />
                  )}
                </div>
              </div>
            </button>

            {isOpen ? (
              <div className="accordion-step__panel">
                <div className="product-grid">
                  {products.map((product) =>
                    product ? (
                      <ProductCard key={product.id} product={product} />
                    ) : null,
                  )}
                </div>

                {index < steps.length - 1 ? (
                  <div className="accordion-step__actions">
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => setOpenStep(steps[index + 1].id)}
                    >
                      {step.nextLabel}
                    </button>
                  </div>
                ) : (
                  <div className="accordion-step__actions">
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => {
                        document
                          .getElementById('review-panel')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      {step.nextLabel}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
