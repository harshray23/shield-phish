'use client';

import React from 'react';
import {
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  type DocumentData,
  type Query,
} from 'firebase/firestore';

export type Where = Parameters<typeof where>;
export type OrderBy = Parameters<typeof orderBy>;

export type UseCollectionOptions = {
  where?: Where[];
  orderBy?: OrderBy[];
  limit?: number;
  startAt?: any[];
  startAfter?: any[];
  endAt?: any[];
  endBefore?: any[];
};

export function useCollection<T>(
  queryObj: Query | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!queryObj) {
      setLoading(false);
      return;
    }

    let q = query(queryObj);

    if (options) {
      if (options.where) {
        options.where.forEach((w) => (q = query(q, where(...w))));
      }
      if (options.orderBy) {
        options.orderBy.forEach((o) => (q = query(q, orderBy(...o))));
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      if (options.startAt) {
        q = query(q, startAt(...options.startAt));
      }
      if (options.startAfter) {
        q = query(q, startAfter(...options.startAfter));
      }
      if (options.endAt) {
        q = query(q, endAt(...options.endAt));
      }
      if (options.endBefore) {
        q = query(q, endBefore(...options.endBefore));
      }
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [JSON.stringify(queryObj), JSON.stringify(options)]);

  return { data, loading, error };
}
