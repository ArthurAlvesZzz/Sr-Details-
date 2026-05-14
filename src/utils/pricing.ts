import { PriceOption } from '../types';

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value) || value === 0) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function getActivePriceOptions(options: PriceOption[]): PriceOption[] {
  if (!options) return [];
  return options.filter(opt => opt.active);
}

export function getLowestPrice(options: PriceOption[]): number | null {
  const activeOpts = getActivePriceOptions(options);
  if (activeOpts.length === 0) return null;
  return activeOpts.reduce((min, opt) => (opt.price < min ? opt.price : min), activeOpts[0].price);
}

export function getPriceDisplay(options: PriceOption[]): string {
  const activeOpts = getActivePriceOptions(options);
  if (activeOpts.length === 0) return 'Sob consulta';
  
  if (activeOpts.length === 1) {
    return formatCurrency(activeOpts[0].price);
  }

  const lowest = getLowestPrice(activeOpts);
  if (lowest === null) return 'Sob consulta';

  return `A partir de ${formatCurrency(lowest)}`;
}
