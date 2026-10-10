import type { IdItem } from './itens';

// Peixes do rio. O peso é a chance relativa de cada um morder a isca
// (só contam os peixes que aparecem naquela hora).
export const PEIXES: { item: IdItem; peso: number; quando: 'dia' | 'noite' | 'sempre' }[] = [
  { item: 'lambari', peso: 50, quando: 'dia' },
  { item: 'tilapia', peso: 30, quando: 'sempre' },
  { item: 'traira', peso: 25, quando: 'noite' },
  { item: 'bagre', peso: 8, quando: 'sempre' },
];
