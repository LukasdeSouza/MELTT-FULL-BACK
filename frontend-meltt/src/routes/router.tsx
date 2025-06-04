import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout";
import CadastroPage from "../pages/cadastro";
import RedefinirSenhaPage from "../pages/redefinir-senha";
import AlunosPage from "../pages/usuarios";
import LoginPage from "../pages/login";
import EsqueciMinhaSenhaPage from "../pages/esqueci-minha-senha";
import NovaSenhaPage from "../pages/nova-senha";
import SenhaAlteradaSucessoPage from "../pages/senha-alterada-sucesso";
import SupportPage from "../pages/support";
import SplashScreen from "../pages/splash";
import TurmasPage from "../pages/turmas";
import PagamentosPage from "../pages/pagamentos";
import EventosPage from "../pages/eventos";
import FornecedoresEditPage from "../pages/fornecedores/edit";
import TurmasPageNew from "../pages/turmas/new";
import PaginaDaTurmaPage from "../pages/turmas/view/paginaDaTurma";
import PaginadaTurmaCriarTopicoPage from "../pages/turmas/view/paginaDaTurma/topico/new";
import TopicoViewPage from "../pages/turmas/view/paginaDaTurma/topico/view";
import DashboardFornecedoresPage from "../pages/dashboards/fornecedores";
import ViewPagamentoPage from "../pages/pagamentos/view";
import ContratosPage from "../pages/contratos";
import ContratosEnvioPage from "../pages/contratos-envio";
import SplashGetBlingInfo from "../pages/splash/blingInfo";
import ContratosEventosPage from "../pages/contratos-eventos";
import TurmasEditPage from "../pages/turmas/edit";
import TarefasPage from "../pages/tarefas";
import FornecedoresPage from "../pages/fornecedores";
import TarefasNewPage from "../pages/tarefas/new";
import TarefasEditPage from "../pages/tarefas/edit";
import EventosCompradoresPage from "../pages/eventos/compradores";
import EventosParticipantesPage from "../pages/eventos/participantes";
import EventosTicketsPage from "../pages/eventos/tickets";
import EventosNewPage from "../pages/eventos/new";
import EventosCheckinsPage from "../pages/eventos/checkins";
import DashboardPagamentosPage from "../pages/dashboards";
import EstatutosPage from "../pages/estatutos";
import ContatosPage from "../pages/contatos";
import PlanosFormaturaPage from "../pages/planos";
import PlanosFormaturaNewPage from "../pages/planos/new";
import AdesoesPage from "../pages/processosInternos/adesoes";
import AdesaoEditPage from "../pages/processosInternos/adesoes/edit";
import PreContratoPage from "../pages/processosInternos/pre-contratos";
import ProcessoInternosPage from "../pages/processosInternos";
import AgendaPage from "../pages/processosInternos/agenda";
import PropostasPage from "../pages/propostas";
import PropostasNewPage from "../pages/propostas/new";
import DashboardPreContratosPage from "../pages/dashboards/pre-contratos";
import DashboardAdesoesPage from "../pages/dashboards/adesoes";
import DashboardPropostasPage from "../pages/dashboards/propostas";
import UsuariosPage from "../pages/usuarios";
import UsuariosPageEdit from "../pages/usuarios/edit";
import UsuariosPageView from "../pages/usuarios/view";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/cadastro",
    element: <CadastroPage />,
  },
  {
    path: "/esqueci-minha-senha",
    element: <EsqueciMinhaSenhaPage />,
  },
  {
    path: "/nova-senha",
    element: <NovaSenhaPage />,
  },
  {
    path: "/redefinir-senha",
    element: <RedefinirSenhaPage />,
  },
  {
    path: "/senha-alterada-sucesso",
    element: <SenhaAlteradaSucessoPage />,
  },
  {
    path: "/splash",
    element: <SplashScreen />,
  },
  {
    path: "/splash-bling-info",
    element: <SplashGetBlingInfo />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/turmas" replace />,
      },
      {
        path: "/dashboard",
        element: <DashboardPagamentosPage/>,
      },
      {
        path: "/dashboard/usuarios",
        element: <DashboardPagamentosPage/>,
      },
      {
        path: "/dashboard/fornecedor",
        element: <DashboardFornecedoresPage/>,
      },
      {
        path: "/dashboard/pre-contrato",
        element: <DashboardPreContratosPage/>,
      },
      {
        path: "/dashboard/adesoes",
        element: <DashboardAdesoesPage/>,
      },
      {
        path: "/dashboard/propostas",
        element: <DashboardPropostasPage/>,
      },
      {
        path: "/usuarios",
        element: <UsuariosPage />,
      },
      {
        path: "/usuarios/edit/:id?",
        element: <UsuariosPageEdit />,
      },
      {
        path: "/usuarios/view/:id?",
        element: <UsuariosPageView />,
      },
      {
        path: "/turmas",
        element: <TurmasPage />,
      },
      {
        path: "/turmas/new",
        element: <TurmasPageNew />,
      },
      {
        path: "/turmas/edit/:id",
        element: <TurmasEditPage />,
      },
      {
        path: "/turmas/view/:id/pagina-turma",
        element: <PaginaDaTurmaPage />,
      },
      {
        path: "/turmas/view/:id/pagina-turma/topico/new",
        element: <PaginadaTurmaCriarTopicoPage />,
      },
      {
        path: "/turmas/view/:id/pagina-turma/topico/:topicoId",
        element: <TopicoViewPage />,
      },
      {
        path: "/usuarios",
        element: <AlunosPage />,
      },
      {
        path: "/pagamentos",
        element: <PagamentosPage />,
      },
      {
        path: "/pagamentos/view/:id",
        element: <ViewPagamentoPage />,
      },
      {
        path: "/contratos-eventos",
        element: <ContratosEventosPage/>
      },
      {
        path: "/fornecedores",
        element: <FornecedoresPage/>
      },
      {
        path: "/fornecedores/edit/:id?",
        element: <FornecedoresEditPage/>
      },
      {
        path: "/contratos-envio",
        element: <ContratosEnvioPage/>,
      },
      {
        path: "/eventos",
        element: <EventosPage/>,
      },
      {
        path: "eventos/new",
        element: <EventosNewPage/>
      },
      {
        path: "/eventos/participantes/:id",
        element: <EventosParticipantesPage/>,
      },
      {
        path: "/eventos/tickets/:id",
        element: <EventosTicketsPage/>,
      },
      {
        path: "/eventos/compradores/:id",
        element: <EventosCompradoresPage/>,
      },
      {
        path: "/eventos/checkins/:id",
        element: <EventosCheckinsPage/>,
      },
      {
        path: "/processos-internos",
        element: <ProcessoInternosPage/>
      },
      {
        path: "/processos-internos/adesoes",
        element: <AdesoesPage/>
      },
      {
        path: "/processos-internos/adesoes/edit/:id?",
        element: <AdesaoEditPage/>
      },
      {
        path: "/processos-internos/tarefas",
        element: <TarefasPage/>,
      },
      {
        path: "/processos-internos/tarefas/new",
        element: <TarefasNewPage/>,
      },
      {
        path: "/processos-internos/tarefas/edit/:id?",
        element: <TarefasEditPage/>,
      },
      {
        path: "/processos-internos/pre-contratos",
        element: <PreContratoPage/>,
      },
      {
        path: "/processos-internos/agenda",
        element: <AgendaPage/>,
      },
      {
        path: "/processos-internos/planos-formatura",
        element: <PlanosFormaturaPage/>
      },
      {
        path: "/processos-internos/planos-formatura/new",
        element: <PlanosFormaturaNewPage/>
      },
      {
        path: "/processos-internos/propostas",
        element: <PropostasPage/>
      },
      {
        path: "/processos-internos/propostas/new",
        element: <PropostasNewPage/>
      },
      {
        path: "/contratos",
        element: <ContratosPage/>
      },
      {
        path: "/estatuto",
        element: <EstatutosPage/>
      },
      {
        path: "/contatos",
        element: <ContatosPage/>
      },
      {
        path: "/suporte",
        element: <SupportPage/>,
      }
    ],
  },
]);
