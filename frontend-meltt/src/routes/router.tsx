import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout";
import CadastroPage from "../pages/cadastro";
import RedefinirSenhaPage from "../pages/redefinir-senha";
import AlunosPage from "../pages/alunos";
import AlunosPageEdit from "../pages/alunos/edit";
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
import AlunosPageView from "../pages/alunos/view";
import ContratosPage from "../pages/contratos";
import ContratosEnvioPage from "../pages/contratos-envio";
import SplashGetBlingInfo from "../pages/splash/blingInfo";
import PreContratoPage from "../pages/pre-contratos";
import AdesoesPage from "../pages/adesoes";
import ContratosEventosPage from "../pages/contratos-eventos";
import TurmasEditPage from "../pages/turmas/edit";
import TarefasPage from "../pages/tarefas";
import FornecedoresPage from "../pages/fornecedores";
import TarefasNewPage from "../pages/tarefas/new";
import TarefasEditPage from "../pages/tarefas/edit";
import AdesaoEditPage from "../pages/adesoes/edit";
import EventosCompradoresPage from "../pages/eventos/compradores";
import EventosParticipantesPage from "../pages/eventos/participantes";
import EventosTicketsPage from "../pages/eventos/tickets";
import EventosNewPage from "../pages/eventos/new";
import EventosCheckinsPage from "../pages/eventos/checkins";
import DashboardPagamentosPage from "../pages/dashboards";
import EstatutosPage from "../pages/estatutos";
import PlanosFormaturaPage from "../pages/planos";
import PlanosFormaturaNewPage from "../pages/planos/new";

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
        path: "/usuarios",
        element: <AlunosPage />,
      },
      {
        path: "/usuarios/edit/:id?",
        element: <AlunosPageEdit />,
      },
      {
        path: "/usuarios/view/:id?",
        element: <AlunosPageView />,
      },
      {
        path: "/adesoes",
        element: <AdesoesPage/>
      },
      {
        path: "/adesoes/edit/:id?",
        element: <AdesaoEditPage/>
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
        path: "/planos-formatura",
        element: <PlanosFormaturaPage/>
      },
      {
        path: "/planos-formatura/new",
        element: <PlanosFormaturaNewPage/>
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
        path: "/tarefas",
        element: <TarefasPage/>,
      },
      {
        path: "/tarefas/new",
        element: <TarefasNewPage/>,
      },
      {
        path: "/tarefas/edit/:id?",
        element: <TarefasEditPage/>,
      },
      {
        path: "/pre-contratos",
        element: <PreContratoPage/>,
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
        path: "/suporte",
        element: <SupportPage/>,
      }
    ],
  },
]);
