import { useEffect } from 'react';
import { useBundleStore } from '../store/bundleStore';
import { formatMoney, computeTotals } from '../lib/pricing';

export function CheckoutModal() {
  const open = useBundleStore((s) => s.checkoutOpen);
  const close = useBundleStore((s) => s.closeCheckout);
  const quantities = useBundleStore((s) => s.quantities);
  const productsById = useBundleStore((s) => s.productsById);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const totals = computeTotals(quantities, productsById);

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="checkout-title">Ready to check out</h2>
        <p>
          This is a prototype — there&apos;s no payment flow here. Your configured
          system totals{' '}
          <strong>{formatMoney(totals.current)}</strong>.
        </p>
        <button type="button" className="btn btn--primary" onClick={close}>
          Got it
        </button>
      </div>
    </div>
  );
}

export function Toast() {
  const toast = useBundleStore((s) => s.toast);
  const clearToast = useBundleStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clearToast, 3200);
    return () => window.clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="toast" role="status">
      {toast}
    </div>
  );
}
