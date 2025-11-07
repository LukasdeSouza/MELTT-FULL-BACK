import { create } from 'zustand';
import { getComercialTurmas, addTurmaToPipeline, updateComercialTurmaStatus, getComercialStats, apiPostData } from '../services/api';
import toast from 'react-hot-toast';

export interface TurmaComercial {
  id: number;
  turma_id: number;
  nome: string;
  instituicao: string;
  contatoPrincipal: string;
  telefone: string;
  status: 'contato' | 'reuniao' | 'proposta' | 'negociacao' | 'fechada' | 'perdida';
  timeline: { data: string; acao: string; tipo: string }[];
  estatisticas: {
    propostas: number;
    reunioes: { agendadas: number; realizadas: number; remarcadas: number };
  };
  dataPrimeiroContato: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStats {
  stats: Record<string, number>;
  conversionRates: Record<string, number>;
}

interface ComercialState {
  turmas: TurmaComercial[];
  stats: PipelineStats | null;
  loading: boolean;
  loadingStats: boolean;
  error: string | null;
  fetchTurmas: (status?: string) => Promise<void>;
  addTurma: (data: { turma_id: number; contatoPrincipal: string; telefone?: string; status?: string; createdBy: string }) => Promise<void>;
  updateStatus: (id: string, status: string, acao: string) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useComercialStore = create<ComercialState>((set, get) => ({
  turmas: [],
  stats: null,
  loading: false,
  loadingStats: false,
  error: null,

  fetchTurmas: async (status) => {
    set({ loading: true, error: null });
    try {
      const params = status ? { status } : {};
      const response = await getComercialTurmas(params);
      set({ turmas: response, loading: false });
    } catch (err) {
      const message = 'Falha ao buscar turmas do pipeline.';
      toast.error(message);
      set({ loading: false, error: message });
    }
  },

  addTurma: async (data) => {
    set({ loading: true, error: null });

    try {
      const { nome, instituicao, contatoPrincipal, telefone, status } = data;

      const turmaResponse = await apiPostData('academic', '/turmas', {
        nome,
        instituicao,
      });

      const turmaId = turmaResponse.id;

      await addTurmaToPipeline({
        turma_id: turmaId,
        contatoPrincipal,
        telefone,
        status,
      });

      await get().fetchTurmas();
      await get().fetchStats();

      toast.success('Turma adicionada ao pipeline com sucesso!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Falha ao adicionar turma.';
      console.error('Erro ao criar turma:', err);
      toast.error(message);
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status, acao) => {
    set({ loading: true, error: null });
    try {
      await updateComercialTurmaStatus(id, { status, acao });
      toast.success('Status da turma atualizado!');
      await get().fetchTurmas();
    } catch (err) {
      const message = 'Falha ao atualizar status da turma.';
      toast.error(message);
      set({ loading: false, error: message });
    }
  },

  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const response = await getComercialStats();
      set({ stats: response, loadingStats: false });
      return response;
    } catch (err) {
      const message = 'Falha ao buscar estatísticas.';
      toast.error(message);
      set({ loadingStats: false, error: message });
    }
  },
}));