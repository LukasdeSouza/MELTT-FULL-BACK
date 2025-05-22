import { Bancos, Boletos, StreamToPromise } from "gerar-boletos";

export function calcularNossoNumero(
  cooperativa,
  posto,
  beneficiario,
  ano,
  byte,
  sequencial
) {
  const numeroBase = `${cooperativa}${posto}${beneficiario}${ano}${byte}${sequencial}`;

  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];

  let soma = 0;
  let pesoIndex = 0;

  for (let i = numeroBase.length - 1; i >= 0; i--) {
    soma += Number(numeroBase[i]) * pesos[pesoIndex];
    pesoIndex = (pesoIndex + 1) % pesos.length;
  }

  const resto = soma % 11;
  let digitoVerificador = 11 - resto;

  if (digitoVerificador === 10 || digitoVerificador === 11) {
    digitoVerificador = 0;
  }

  return `${numeroBase}${digitoVerificador}`;
}

export function gerarBoletoSicredi() {
  const boleto = {
    banco: new Bancos.Sicredi(),
    pagador: {
      nome: "José Bonifácio de Andrada",
      RegistroNacional: "12345678",
      endereco: {
        logradouro: "Rua Pedro Lessa, 15",
        bairro: "Centro",
        cidade: "Rio de Janeiro",
        estadoUF: "RJ",
        cep: "20030-030",
      },
    },
    instrucoes: [
      "Após o vencimento Mora dia R$ 1,59",
      "Após o vencimento, multa de 2%",
    ],
    beneficiario: {
      nome: "Empresa Fictícia LTDA",
      cnpj: "43576788000191",
      dadosBancarios: {
        carteira: "09",
        agencia: "0101",
        agenciaDigito: "5",
        conta: "0326446",
        contaDigito: "0",
        nossoNumero: "00000000061",
        nossoNumeroDigito: "8",
      },
      endereco: {
        logradouro: "Rua Pedro Lessa, 15",
        bairro: "Centro",
        cidade: "Rio de Janeiro",
        estadoUF: "RJ",
        cep: "20030-030",
      },
    },
    boleto: {
      numeroDocumento: "1001",
      especieDocumento: "DM",
      valor: 110.0,
      datas: {
        vencimento: "02-04-2020",
        processamento: "02-04-2019",
        documentos: "02-04-2019",
      },
    },
  };

  const novoBoleto = new Boletos(boleto);
  novoBoleto.gerarBoleto();
  novoBoleto.pdfFile().then(async ({ stream }) => {
    await StreamToPromise(stream);
  }).catch((error) => {
    return error;
  });
}
