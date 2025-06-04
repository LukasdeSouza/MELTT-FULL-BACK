import React, { createContext, useContext } from 'react';

export interface Fornecedor {
  id: string;
  nome: string;
  status: string;
  telefone: string;
  turma_id: string;
  tipo_servico: string;
  valor_cotado: string;
  [key: string]: string;
}

export interface FornecedorState {
  fornecedorSelecionado: Fornecedor | null;
  tipoInformacao: string;
}

interface FornecedorContextType {
  stateFornecedor: FornecedorState;
  dispatchFornecedor: React.Dispatch<FornecedorAction>;
}

type FornecedorAction =
  | { type: 'SET_FORNECEDOR_SELECIONADO'; payload: Fornecedor | null }
  | { type: 'SET_USER_LOGGED'; payload: boolean }; 

export const fornecedorInitialState: FornecedorState = {
  fornecedorSelecionado: null,
  tipoInformacao: 'pei',
};

export const fornecedorReducer = (state: FornecedorState, action: FornecedorAction): FornecedorState => {
  switch (action.type) {
    case 'SET_FORNECEDOR_SELECIONADO':
      return {
        ...state,
        fornecedorSelecionado: action.payload,
      };
    default:
      return state;
  }
}

export const FornecedorContext = createContext<FornecedorContextType | undefined>(undefined);

export const useFornecedorContext = (): FornecedorContextType => {
  const context = useContext(FornecedorContext);
  if (context === undefined) {
    throw new Error('useFornecedorContext must be used within an FornecedorProvider');
  }
  return context;
};