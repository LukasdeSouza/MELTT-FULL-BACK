import React, { createContext, useContext } from "react";

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  plano: string;
  faculdade: string;
  turma: string;
  [key: string]: string;
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
