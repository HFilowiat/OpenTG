// example usage: LooseAutoComplete<'platforms' | 'genres' | 'magazines'>
export type LooseAutoComplete<T extends string> = T | Omit<string, T>;
