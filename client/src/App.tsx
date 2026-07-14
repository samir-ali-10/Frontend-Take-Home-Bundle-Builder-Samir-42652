import { useCatalog } from './hooks/useCatalog';
import { BuilderAccordion } from './components/BuilderAccordion';
import { ReviewPanel } from './components/ReviewPanel';
import { CheckoutModal, Toast } from './components/Chrome';
import './styles/app.css';

export default function App() {
  const load = useCatalog();

  if (load.status === 'loading') {
    return (
      <div className="app-shell app-shell--center">
        <p className="loading-copy">Loading your builder…</p>
      </div>
    );
  }

  if (load.status === 'error') {
    return (
      <div className="app-shell app-shell--center">
        <p className="error-copy">Couldn&apos;t load the catalog. {load.message}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="layout">
        <BuilderAccordion steps={load.catalog.steps} />
        <ReviewPanel />
      </main>
      <CheckoutModal />
      <Toast />
    </div>
  );
}
