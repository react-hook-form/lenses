import type { LensCore } from './LensCore';

export interface LensesCache {
  primitives: Map<string, LensCore>;
  complex: WeakMap<(...args: any[]) => any, { lens: LensCore }>;
}

export function createLensesCache(): LensesCache {
  const cache: LensesCache = {
    primitives: new Map(),
    complex: new WeakMap(),
  };

  return cache;
}
