import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Lookup,
  LookupFn,
  LookupList,
  LookupResult,
} from '../utils/typeaheadLookup';

export const useTypeaheadLookups = (
  lookups: Lookup[],
  queryOrValues: string | string[] | null,
  debounce = 200,
) => {
  const [results, setResults] = useState<LookupResult[]>([]);
  const pendingRunRef = useRef<number | null>(null);
  const activeRequestsRef = useRef<number>(0);

  const queries = useMemo(
    () =>
      !queryOrValues
        ? null
        : Array.isArray(queryOrValues)
          ? queryOrValues
          : [queryOrValues],
    [queryOrValues],
  );

  useEffect(() => {
    if (!queries || !queries.length || !lookups || !lookups.length) {
      setResults([]);
      return;
    }

    if (pendingRunRef.current) {
      window.clearTimeout(pendingRunRef.current);
    }

    pendingRunRef.current = window.setTimeout(() => {
      activeRequestsRef.current += 1;
      const runId = activeRequestsRef.current;

      // start fresh for this run
      setResults([]);

      if (!queries) {
        pendingRunRef.current = null;
        return;
      }

      const mergeAndDedupe = (
        prev: LookupResult[],
        additions: LookupResult[],
      ) => {
        const map = new Map<string, LookupResult>();
        const keyFor = (it: LookupResult) => `${it.category ?? ''}::${it.text}`;
        for (const p of prev) map.set(keyFor(p), p);
        for (const a of additions) map.set(keyFor(a), a);
        const merged = Array.from(map.values());
        merged.sort((a, b) => a.score - b.score);
        return merged;
      };

      const buildListPromise = (
        list: LookupList,
        query: string,
      ): Promise<void> => {
        return new Promise(() => {
          const { category, items } = list;
          const matchedItems = items
            .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
            .map((item) => ({
              text: item,
              ...(category !== undefined && { category }),
              score: item.length - query.length,
              matchedText: query,
            }));
          setResults((prev) => mergeAndDedupe(prev, matchedItems));
        });
      };

      const createLookupPromise = (
        lookup: LookupFn,
        query: string,
      ): Promise<void> => {
        const { category, func } = lookup;
        return func(query)
          .then((arr) => {
            if (runId !== activeRequestsRef.current) return;
            if (!Array.isArray(arr) || arr.length === 0) return;
            const matchedItems = arr.map((it) => ({
              ...it,
              ...(category !== undefined && { category }),
              matchedText: query,
            }));
            setResults((prev) => mergeAndDedupe(prev, matchedItems));
          })
          .catch(() => {
            /* swallow individual lookup errors */
            return;
          });
      };

      const allPromises: Promise<void>[] = [];

      for (const q of queries) {
        for (const lookup of lookups) {
          const p =
            'items' in lookup
              ? buildListPromise(lookup, q)
              : createLookupPromise(lookup, q);
          allPromises.push(p);
        }
      }

      Promise.allSettled(allPromises).then(() => {
        /* no-op */
      });

      pendingRunRef.current = null;
    }, debounce);

    return () => {
      if (pendingRunRef.current) {
        window.clearTimeout(pendingRunRef.current);
        pendingRunRef.current = null;
      }
    };
  }, [queries, lookups, debounce]);

  return results;
};
