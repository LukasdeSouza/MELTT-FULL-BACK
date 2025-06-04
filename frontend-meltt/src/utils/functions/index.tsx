export function parseResultado(resultado: string): any {
  const parser = new DOMParser();
  const doc = parser.parseFromString(resultado, "text/html");

  const titulo = doc.querySelector("h1")?.innerText.trim() || "Sem título";
  const leitura = Array.from(doc.querySelectorAll("p"))
    .map((p) => p.innerText.trim())
    .join("\n\n");

  const questoes: any[] = [];
  const listaQuestoes = doc.querySelectorAll("ol > li");

  listaQuestoes.forEach((li) => {
    const pergunta = li.textContent?.trim() || "";

    const alternativas: string[] = [];

    if (pergunta) {
      questoes.push({ pergunta, alternativas });
    }
  });

  return { titulo, leitura, questoes };
}

export const handleDownload = (fileUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};

export const somarGruposFuncExecutiva = (
  dados: any,
  propriedades: string[]
) => {
  return propriedades.reduce((soma, prop) => soma + (dados[prop] || 0), 0);
};

export const downloadArquivo = (
  nomeArquivo: string,
  tipoMime: any,
  base64Data: any
) => {
  const blob = new Blob(
    [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
    { type: tipoMime }
  );
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revogar o URL para liberar memória
  URL.revokeObjectURL(url);
};

export const redirectToBlingURLAuth = () => {
  window.location.href =
    "https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=7e9a74126bb1db1435568436cc17923fad5b8179&state=ab8f58f4c4b589c5ff2ad4f06315f618";
};

export const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);