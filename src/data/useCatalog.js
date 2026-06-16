import { useEffect, useState } from 'react';
import { loadCatalogFromFirestore, loadProductBySlug } from './firestoreCatalog.js';
import { COLLECTIONS as STATIC_COLLECTIONS, PRODUCTS as STATIC_PRODUCTS, findProduct as findStaticProduct } from './catalog.js';

/**
 * Returns { collections, products, source, loading, error }.
 * source = 'firestore' | 'static' so the UI can show a small "demo data"
 * hint while the database is empty.
 */
export function useCatalog() {
  const [state, setState] = useState({
    collections: STATIC_COLLECTIONS,
    products:    STATIC_PRODUCTS,
    source: 'static',
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fs = await loadCatalogFromFirestore();
        if (cancelled) return;
        if (fs && fs.products.length > 0) {
          setState({ ...fs, source: 'firestore', loading: false, error: null });
        } else {
          setState(s => ({ ...s, loading: false }));
        }
      } catch (e) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: e?.message ?? String(e) }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

/** Single-product variant of the same hook. */
export function useProduct(slug) {
  const [state, setState] = useState(() => ({
    product: findStaticProduct(slug) ?? null,
    source: findStaticProduct(slug) ? 'static' : null,
    loading: true,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await loadProductBySlug(slug);
        if (cancelled) return;
        if (p) {
          setState({ product: p, source: 'firestore', loading: false, error: null });
        } else {
          setState(s => ({ ...s, loading: false }));
        }
      } catch (e) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: e?.message ?? String(e) }));
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}
