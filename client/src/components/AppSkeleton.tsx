export function AppSkeleton() {
  return (
    <div className="app-shell" aria-busy="true" aria-label="Loading builder">
      <main className="layout">
        <div className="skeleton-builder">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton-step">
              <div className="skeleton-line skeleton-line--xs" />
              <div className="skeleton-step__row">
                <div className="skeleton-step__left">
                  <div className="skeleton-block skeleton-block--icon" />
                  <div className="skeleton-line skeleton-line--title" />
                </div>
                <div className="skeleton-block skeleton-block--chevron" />
              </div>
              {i === 0 ? (
                <div className="skeleton-cards">
                  {[0, 1].map((c) => (
                    <div key={c} className="skeleton-card">
                      <div className="skeleton-block skeleton-block--media" />
                      <div className="skeleton-card__main">
                        <div className="skeleton-line skeleton-line--md" />
                        <div className="skeleton-line skeleton-line--lg" />
                        <div className="skeleton-line skeleton-line--sm" />
                        <div className="skeleton-chips">
                          <div className="skeleton-block skeleton-block--chip" />
                          <div className="skeleton-block skeleton-block--chip" />
                        </div>
                        <div className="skeleton-card__footer">
                          <div className="skeleton-block skeleton-block--stepper" />
                          <div className="skeleton-block skeleton-block--price" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <aside className="skeleton-review">
          <div className="skeleton-line skeleton-line--xs" />
          <div className="skeleton-line skeleton-line--title skeleton-line--wide" />
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-review__group">
            <div className="skeleton-line skeleton-line--xs" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-review-row">
                <div className="skeleton-block skeleton-block--thumb" />
                <div className="skeleton-line skeleton-line--md" />
                <div className="skeleton-block skeleton-block--mini-stepper" />
                <div className="skeleton-block skeleton-block--price-sm" />
              </div>
            ))}
          </div>
          <div className="skeleton-review__footer">
            <div className="skeleton-block skeleton-block--seal" />
            <div className="skeleton-review__totals">
              <div className="skeleton-block skeleton-block--pill" />
              <div className="skeleton-line skeleton-line--total" />
              <div className="skeleton-block skeleton-block--btn" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
