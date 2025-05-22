import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Bar,
    BarChart,
    Legend,
  } from "recharts";
  import { cnpj } from 'cpf-cnpj-validator';
  
  interface FornecedorData {
    id: number;
    nome: string;
    cnpj: string;
    valor_cotado: string;
  }
  
  const CustomTooltip = ({ payload }: { payload?: any }) => {
    if (!payload || payload.length === 0) return null;
  
    const registro = payload[0]?.payload as FornecedorData;
    const formattedCNPJ = registro?.cnpj ? cnpj.format(registro.cnpj) : 'CNPJ Inválido';
  
    return (
      <div className="custom-tooltip bg-white shadow-md rounded-md p-2">
        <div className="mb-2">
          <small style={{ color: 'black' }}>{`Fornecedor: ${registro?.nome}`}</small><br/>
          <small style={{ color: 'black' }}>{`CNPJ: ${formattedCNPJ}`}</small>
        </div>
        <hr />
        {payload.map((entry: any, index: number) => {
          const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(parseFloat(entry.value));
  
          return (
            <p key={index} style={{ color: entry.fill }}>
              {`Valor Cotado: ${valorFormatado}`}
            </p>
          )
        })}
      </div>
    );
  };
  
  const CustomBarChart = ({ data }: { data: FornecedorData[] }) => {
    const processedData = data.map(item => ({
      ...item,
      valor_cotado: parseFloat(item.valor_cotado) || 0
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="cnpj"
            tickFormatter={(tick) => `${tick.substring(0, 8)}...`}
            angle={-45}
            textAnchor="end"
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            tickFormatter={(value) => 
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={() => 'Valores Cotados por Fornecedor'}
            wrapperStyle={{ paddingTop: 20 }}
          />
          <Bar
            dataKey="valor_cotado"
            name="Valor Cotado"
            fill="#DB1F8D"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  export default CustomBarChart;