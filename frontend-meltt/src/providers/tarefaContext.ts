import React, { createContext, useContext } from "react";

export interface Tarefa {
  id: string;
  nome: string;
  responsavel: string;
  atribuido_por: string;
  criado_em: string;
  [key: string]: string;
}

export interface TarefaState {
  tarefaSelecionada: Tarefa | null;
}

interface TarefaContextType {
  stateTarefa: TarefaState;
  dispatchTarefa: React.Dispatch<TarefaAction>;
}

type TarefaAction = { type: "SET_TAREFA_SELECIONADA"; payload: Tarefa | null };

export const tarefaInitialState: TarefaState = {
  tarefaSelecionada: null,
};

export const tarefaReducer = (
  state: TarefaState,
  action: TarefaAction
): TarefaState => {
  switch (action.type) {
    case "SET_TAREFA_SELECIONADA":
      return {
        ...state,
        tarefaSelecionada: action.payload,
      };
    default:
      return state;
  }
};

export const TarefaContext = createContext<TarefaContextType | undefined>(
  undefined
);

export const useTarefaContext = (): TarefaContextType => {
  const context = useContext(TarefaContext);
  if (context === undefined) {
    throw new Error("useTarefaContext must be used within an TarefaProvider");
  }
  return context;
};
