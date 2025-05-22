import React, { createContext, useContext } from "react";

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  turma: string;
  tipo: string;
  ativo: boolean;
  documento: string;
  senha: string;
  [key: string]: string | boolean | number;
}

export interface AlunoState {
  alunoSelecionado: Aluno | null;
}

interface AlunoContextType {
  stateAluno: AlunoState;
  dispatchAluno: React.Dispatch<AlunoAction>;
}

type AlunoAction = { type: "SET_ALUNO_SELECIONADO"; payload: Aluno | null };

export const alunoInitialState: AlunoState = {
  alunoSelecionado: null,
};

export const alunoReducer = (
  state: AlunoState,
  action: AlunoAction
): AlunoState => {
  switch (action.type) {
    case "SET_ALUNO_SELECIONADO":
      return {
        ...state,
        alunoSelecionado: action.payload,
      };
    default:
      return state;
  }
};

export const AlunoContext = createContext<AlunoContextType | undefined>(
  undefined
);

export const useAlunoContext = (): AlunoContextType => {
  const context = useContext(AlunoContext);
  if (context === undefined) {
    throw new Error("useAlunoContext must be used within an AlunoProvider");
  }
  return context;
};
