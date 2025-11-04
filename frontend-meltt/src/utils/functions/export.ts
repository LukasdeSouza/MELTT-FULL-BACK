import { TurmaComercial } from "../../stores/comercialStore";

function escapeCsvCell(cell: any): string {
  const cellStr = String(cell ?? '');
  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

export function exportToCsv(filename: string, data: TurmaComercial[]) {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const headers = [
    'ID',
    'Turma ID',
    'Nome da Turma',
    'Instituição',
    'Contato Principal',
    'Telefone',
    'Status',
    'Data do Primeiro Contato',
  ];

  const csvRows = [headers.join(',')];

  data.forEach(turma => {
    const row = [
      turma.id,
      turma.turma_id,
      turma.nome,
      turma.instituicao,
      turma.contatoPrincipal,
      turma.telefone,
      turma.status,
      new Date(turma.dataPrimeiroContato).toLocaleDateString(),
    ].map(escapeCsvCell);
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
