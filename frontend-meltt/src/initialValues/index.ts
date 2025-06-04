export const initialValuesFornecedor = {
  nome: "",
  tipo_servico: "",
  telefone: "",
  cnpj: "",
  responsavel: "",
  turma_id: '',
  valor_cotado: "",
  status: "Pagamento não efetuado",
};

export const initialValuesTurma = {
  nome: "",
  ano_formatura: "",
  identificador: "",
  regras_adesao: "",
  regras_rescisao: "",
  regras_renegociacao: "",
  planos_formatura: [],
};

export const initialValuesAdesao = {
  aluno_id: "",
  turma_id: "",
  status: "",
  data_assinatura: "",
  faculdade: "",
  observacoes: "",
}

export const initialValuesProposta = {
  nome_proposta: "",
  turma_id: "",
  enviado_por: "",
  valor_proposta: "",
}

export const initialValuesTarefa = {
  nome: "",
  responsaveis: [],
  atribuido_por: "",
  prazo_tarefa: ""
}

export const initialValuesPlano = {
  nome: "",
  valor: "",
  incluso: ""
}

export const initialValuesAluno = {
  nome: "",
  email: "",
  documento: "",
  senha: "",
  confirmar_senha: "",
  telefone: "",
  turma_id: null,
  tipo: "",
  faculdade: "",
  ativo: true,
}

export const initialValuesFaculdade = {
  nome: "",
  endereco: "",
  telefone: "",
}

export const initialValuesEvento = {
  nome_evento: "",
  descricao_evento: "",
  valor_ingresso: 0,
}

