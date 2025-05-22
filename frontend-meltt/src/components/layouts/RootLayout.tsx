import { useMediaQuery } from "react-responsive";
import { Outlet, useNavigate } from "react-router-dom";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { Stack, ThemeProvider } from "@mui/material";
import { theme } from "../../theme";
import {
  TurmaContext,
  turmaInitialState,
  turmaReducer,
} from "../../providers/turmaContext";
import { useEffect, useReducer } from "react";
import { getToken } from "../../utils/token";
import toast, { Toaster } from "react-hot-toast";

import {
  FornecedorContext,
  fornecedorInitialState,
  fornecedorReducer,
} from "../../providers/fornecedorContext";
import {
  FaculdadeContext,
  faculdadeInitialState,
  faculdadeReducer,
} from "../../providers/faculdadeContext";
import { AlunoContext, alunoInitialState, alunoReducer } from "../../providers/alunoContext";
import { TarefaContext, tarefaInitialState, tarefaReducer } from "../../providers/tarefaContext";
import { AdesaoContext, adesaoInitialState, adesaoReducer } from "../../providers/adesaoContext";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const RootLayout = () => {
  const navigate = useNavigate();
  const [stateFaculdade, dispatchFaculdade] = useReducer(
    faculdadeReducer,
    faculdadeInitialState
  );
  const [stateTurma, dispatchTurma] = useReducer(
    turmaReducer,
    turmaInitialState
  );

  const [stateAdesao, dispatchAdesao] = useReducer(
    adesaoReducer,
    adesaoInitialState
  )

  const [stateAluno, dispatchAluno] = useReducer(
    alunoReducer,
    alunoInitialState
  );

  const [stateFornecedor, dispatchFornecedor] = useReducer(
    fornecedorReducer,
    fornecedorInitialState
  );

  const [stateTarefa, dispatchTarefa] = useReducer(
    tarefaReducer,
    tarefaInitialState
  )

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1280px) and (max-width: 1600px)",
  });
  const isBigScreen = useMediaQuery({ query: "(min-width: 1601px)" });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast.error("Faça Login para acessar essa página");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  }, []);

  return (
    <FaculdadeContext.Provider value={{ stateFaculdade, dispatchFaculdade }}>
      <TurmaContext.Provider value={{ stateTurma, dispatchTurma }}>
        <AdesaoContext.Provider value={{ stateAdesao, dispatchAdesao }}>
          <AlunoContext.Provider value={{ stateAluno, dispatchAluno }}>
            <FornecedorContext.Provider
              value={{ stateFornecedor, dispatchFornecedor }}
            >
              <TarefaContext.Provider value={{ stateTarefa, dispatchTarefa }}>
                <ThemeProvider theme={theme}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack
                      width={"100%"}
                      height={"100vh"}
                      bgcolor={"#F2F2F2"}
                      direction={"column"}
                    >
                      {isDesktopOrLaptop && (
                        <DesktopLayout>
                          <Outlet />
                        </DesktopLayout>
                      )}
                      {isBigScreen && (
                        <DesktopLayout>
                          <Outlet />
                        </DesktopLayout>
                      )}
                      {isTabletOrMobile && (
                        <MobileLayout>
                          <p className="text-default font-medium p-3 flex items-center justify-center h-screen w-full">
                            Ops! Versão para celulares e tablets ainda não está
                            disponível, acesse por um computador.
                          </p>
                        </MobileLayout>
                      )}
                    </Stack>
                  </LocalizationProvider>
                </ThemeProvider>
              </TarefaContext.Provider>
            </FornecedorContext.Provider>
          </AlunoContext.Provider>
        </AdesaoContext.Provider>

        <Toaster />
      </TurmaContext.Provider>
    </FaculdadeContext.Provider>
  );
};

export default RootLayout;
