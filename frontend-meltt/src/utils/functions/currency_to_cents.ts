export default function parseCurrencyToCents(valor: string | null | undefined): number {
  if (!valor) return 0;

  const clean = valor
    .replace(/[^\d,]/g, '')
    .replace(',', '.');

  const numero = parseFloat(clean);
  return isNaN(numero) ? 0 : Math.round(numero * 100);
}
