export default function formatCentavosToBRL(valorCentavos: number | null | undefined): string {
  if (valorCentavos === null || valorCentavos === undefined || isNaN(valorCentavos)) {
    return "0,00";
  }

  const valorReais = valorCentavos / 100;
  return valorReais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
