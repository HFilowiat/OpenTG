// decomposes to Map of Map based on the number of tuple keys provided
type MultiMap<K extends any[], V> = K extends [infer F, ...infer R] ? Map<F, MultiMap<R, V>> : V;
