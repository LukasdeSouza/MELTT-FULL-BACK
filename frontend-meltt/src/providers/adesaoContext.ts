import React, { createContext, useContext } from "react";

export interface Adesao {
  id: string;
  aluno_id: string;
  turma_id: string;
  status: string;
  data_assinatura: string;
  observacoes: string;
  [key: string]: string;
}

export interface AdesaoState {
  adesaoSelecionada: Adesao | null;
}

interface AdesaoContextType {
  stateAdesao: AdesaoState;
  dispatchAdesao: React.Dispatch<AdesaoAction>;
}

type AdesaoAction = { type: "SET_ADESAO_SELECIONADO"; payload: Adesao | null };

export const adesaoInitialState: AdesaoState = {
  adesaoSelecionada: null,
};

export const adesaoReducer = (
  state: AdesaoState,
  action: AdesaoAction
): AdesaoState => {
  switch (action.type) {
    case "SET_ADESAO_SELECIONADO":
      return {
        ...state,
        adesaoSelecionada: action.payload,
      };
    default:
      return state;
  }
};

export const AdesaoContext = createContext<AdesaoContextType | undefined>(
  undefined
);

export const useAdesaoContext = (): AdesaoContextType => {
  const context = useContext(AdesaoContext);
  if (context === undefined) {
    throw new Error("useAdesaoContext must be used within an AdesaoProvider");
  }
  return context;
};
