import { useEffect, useState } from 'react';
import type { Catalog } from '../types/catalog';
import { useBundleStore } from '../store/bundleStore';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; catalog: Catalog };

export function useCatalog(): LoadState {
  const initFromCatalog = useBundleStore((s) => s.initFromCatalog);
  const hydrated = useBundleStore((s) => s.hydrated);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/catalog');
        if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
        const catalog = (await res.json()) as Catalog;
        if (cancelled) return;
        initFromCatalog(catalog);
        setState({ status: 'ready', catalog });
      } catch {
        try {
          const res = await fetch('/catalog.json');
          if (!res.ok) throw new Error('Static catalog missing');
          const catalog = (await res.json()) as Catalog;
          if (cancelled) return;
          initFromCatalog(catalog);
          setState({ status: 'ready', catalog });
        } catch (err) {
          try {
            const mod = await import('../data/catalog.json');
            const catalog = mod.default as Catalog;
            if (cancelled) return;
            initFromCatalog(catalog);
            setState({ status: 'ready', catalog });
          } catch {
            if (cancelled) return;
            setState({
              status: 'error',
              message:
                err instanceof Error ? err.message : 'Failed to load catalog',
            });
          }
        }
      }
    }

    if (!hydrated) {
      void load();
    } else {
      const catalog = useBundleStore.getState().catalog;
      if (catalog) setState({ status: 'ready', catalog });
    }

    return () => {
      cancelled = true;
    };
  }, [hydrated, initFromCatalog]);

  return state;
}
