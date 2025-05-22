export type TableColumnsType = {
  label: string;
  key: string;
};

export type DrawerMenuListType = {
  title: string;
  route: string;
  icon: React.ReactElement;
  subRoutes?: { title: string; route: string; icon?: React.ReactElement }[];
};

export type MateriaType = {
  title: string;
  value: string;
};

export type StudentInfo = {
  educacao_basica: string | undefined;
  deficit_geral: string | undefined;
  tipo_aprendizagem: string | undefined;
};

export type StudentInitialValuesFn = (
  id: string | undefined,
  stateAluno: any,
  initialStudentValues: Record<string, any>
) => typeof initialStudentValues;

export type AlunoListType = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  plano: boolean;
  formatura_paga: boolean;
};

export type Aluno = {
  id: number;
  nome: string;
  email: string;
  turma_id: number;
}

export type Turma = {
  nome: string;
  id: number;
  identificador: string;
};

export type Topico = {
  id: number;
  aluno_id: number;
  titulo: string;
  descricao: string;
};

export type Resposta = {
  id: number;
  resposta: string;
  data_criacao: any;
};


export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo: "reuniao" | "degustacao" | "cotacao" | "outro";
  participantes: string[];
  local: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  contato: string;
  produtos: string[];
  valorPedido: number;
  personalizados: string[];
}

export interface Contrato {
  id: string;
  titulo: string;
  descricao: string;
  eventos: Evento[];
  fornecedores: Fornecedor[];
  status: "pendente" | "em_andamento" | "concluido";
}
