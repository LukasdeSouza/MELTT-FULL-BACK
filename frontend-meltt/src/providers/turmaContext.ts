import React, { createContext, useContext } from "react";

export interface Turma {
  id: string;
  nome: string;
  criado_em: any;
  [key: string]: string;
}

export interface TurmaState {
  turmaSelecionada: Turma | null;
}

interface TurmaContextType {
  stateTurma: TurmaState;
  dispatchTurma: React.Dispatch<TurmaAction>;
}

type TurmaAction = { type: "SET_TURMA_SELECIONADA"; payload: Turma | null };

export const turmaInitialState: TurmaState = {
  turmaSelecionada: null,
};

export const turmaReducer = (
  state: TurmaState,
  action: TurmaAction
): TurmaState => {
  switch (action.type) {
    case "SET_TURMA_SELECIONADA":
      return {
        ...state,
        turmaSelecionada: action.payload,
      };
    default:
      return state;
  }
};

export const TurmaContext = createContext<TurmaContextType | undefined>(
  undefined
);

export const useTurmaContext = (): TurmaContextType => {
  const context = useContext(TurmaContext);
  if (context === undefined) {
    throw new Error("useTurmaContext must be used within an TurmaProvider");
  }
  return context;
};
