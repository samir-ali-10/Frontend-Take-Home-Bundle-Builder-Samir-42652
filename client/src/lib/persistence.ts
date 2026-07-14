const STORAGE_KEY = 'wyze-bundle-builder:v1';

export type PersistedBundle = {
  version: 1;
  quantities: Record<string, number>;
  activeVariants: Record<string, string>;
  openStepId: string;
  savedAt: string;
};

export function loadPersistedBundle(): PersistedBundle | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBundle;
    if (parsed?.version !== 1 || !parsed.quantities) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedBundle(
  data: Omit<PersistedBundle, 'version' | 'savedAt'>,
): void {
  const payload: PersistedBundle = {
    version: 1,
    ...data,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedBundle(): void {
  localStorage.removeItem(STORAGE_KEY);
}
