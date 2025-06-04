import {
  Box,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiGetData } from "../../../services/api";
import BoxDashboardValues from "../../../components/box/dashboardValues";
import toast from "react-hot-toast";
import { TotalValueCard } from "../../../components/card/totalValue";
import { StatusDonutChart } from "../../../components/charts/statusDonut";
import { ContactRadarChart } from "../../../components/charts/contactRadar";
import { MdDescription } from "react-icons/md";

const DashboardPreContratosPage = () => {
  const [onLoad, setOnLoad] = useState(false);
  const [listPreContrato, setListPreContrato] = useState<any[]>([]);

  const [totalAgreedValue, setTotalAgreedValue] = useState<number>(0);
  const [statusDistribution, setStatusDistribution] = useState<Record<string, number>>({});
  const [uniqueStudents, setUniqueStudents] = useState<string[]>([]);
  const [contactMethods, setContactMethods] = useState<Record<string, number>>({});
  const [totalContracts, setTotalContracts] = useState<number>(0);


  const fetchPreContrato = async () => {
    try {
      let response = await apiGetData("academic", `/pre-contrato`);
      setListPreContrato(response.data);

      const metrics = response.data.reduce((acc: any, item: any) => {
        // Valor total acordado
        acc.totalValue += parseFloat(item.agreedValue) || 0;
        // Distribuição de status
        acc.statuses[item.status] = (acc.statuses[item.status] || 0) + 1;
        // Contato únicos
        acc.students.add(item.studentName);
        // Métodos de contato
        acc.contacts[item.contactedBy] = (acc.contacts[item.contactedBy] || 0) + 1;

        return acc;
      }, {
        totalValue: 0,
        statuses: {},
        students: new Set<string>(),
        contacts: {}
      });

      setTotalAgreedValue(metrics.totalValue);
      setStatusDistribution(metrics.statuses);
      setUniqueStudents(Array.from(metrics.students));
      setContactMethods(metrics.contacts);
      setTotalContracts(response.data.length);
    } catch (error) {
      toast.error("Erro ao buscar fornecedores");
    }
  }

  useEffect(() => {
    fetchPreContrato();
    setOnLoad(true);
  }, []);

  return (
    <Stack width={"calc(100% - 28px)"} height={"100%"}>
      <Stack
        direction={"column"}
        height={"calc(100vh - 100px)"}
        overflow={"auto"}
        gap={4}
        sx={{
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "12px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ddd",
            borderRadius: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#EFEFEF",
          },
        }}
      >
        <Slide
          direction="right"
          in={onLoad}
          mountOnEnter
          unmountOnExit
          timeout={300}
        >
          <Stack direction={"row"} gap={2} justifyContent={"space-between"}>
            <BoxDashboardValues title="Valor de Pré-Contratos" valor={totalAgreedValue} />
          </Stack>
        </Slide>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <TotalValueCard
              totalAgreedValue={totalAgreedValue}
              listPreContrato={listPreContrato}
            />
          </div>
          <StatusDonutChart statusDistribution={statusDistribution} />
          <ContactRadarChart contactMethods={contactMethods} />
        </div>
        <Stack direction={'row'} gap={2} justifyContent={"space-between"}>
          <Stack
            direction="column"
            flex={1}
            alignItems="center"
            p={2.5}
            bgcolor="background.paper"
            borderRadius={2}
            boxShadow={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdDescription
                fontSize="small"
                color="primary"
              />
              <Typography
                variant="overline"
                color="textSecondary"
                sx={{
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                }}
              >
                Total de Pré-Contratos
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                color: totalContracts > 0 ? '#444' : 'red',
                my: 1.5
              }}
            >
              {totalContracts.toLocaleString('pt-BR')}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {totalContracts > 0 ? (
                <>
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.light'
                    }}
                  />
                  Contratos registrados
                </>
              ) : (
                'Nenhum contrato cadastrado'
              )}
            </Typography>
          </Stack>
          <Stack
            direction="column"
            flex={1}
            alignItems="center"
            p={2.5}
            bgcolor="background.paper"
            borderRadius={2}
            boxShadow={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdDescription
                fontSize="small"
                color="primary"
              />
              <Typography
                variant="overline"
                color="textSecondary"
                sx={{
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                }}
              >
                Turmas Únicas
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                color: uniqueStudents.length > 0 ? '#444' : 'red',
                my: 1.5
              }}
            >
              {uniqueStudents.toLocaleString('pt-BR')}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {uniqueStudents.length > 0 ? (
                <>
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.light'
                    }}
                  />
                  Contratos registrados
                </>
              ) : (
                'Nenhum contrato cadastrado'
              )}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default DashboardPreContratosPage;
