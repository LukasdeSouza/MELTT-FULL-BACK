import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
  AreaChart,
} from "recharts";
import { format } from "date-fns";

const formatKey = (key: string) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const CustomTooltip = ({ payload, label }: { payload?: any; label?: any }) => {
  if (!payload || payload.length === 0) return null;

  const formattedDate = label ? format(new Date(label), "dd/MM/yyyy") : "";

  return (
    <div className="custom-tooltip bg-white shadow-md rounded-md p-2">
      <small style={{color: 'black'}}>{`Data: ${formattedDate}`}</small>
      <hr />
      {payload.map((entry: any, index: number) => {
        const valorFormatado = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(entry.value);
        return (
          <p key={index} style={{ color: entry.stroke }}>
            {`${formatKey(entry.dataKey)}: ${valorFormatado}`}
          </p>
        )
      })}
    </div>
  );
};

const CustomLegend = ({ payload }: { payload?: any }) => {
  return (
    <ul className="flex flex-row justify-center gap-8">
      {payload.map((entry: any, index: number) => (
        <li
          className="list-item text-sm"
          key={index}
          style={{ color: entry.color }}
        >
          R$ {formatKey(entry.value)} por Dia de Vencimento
        </li>
      ))}
    </ul>
  );
};

const CustomLineChart = ({ data }: { data: any }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValores" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DB1F8D" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#DB1F8D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
        <XAxis
          dataKey="data_valor"
          tickFormatter={(tick) => format(new Date(tick), "dd/MM/yyyy")}
          tick={{ fontSize: 12, fill: "#888", fontFamily: "Poppins" }}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Area
          type="monotone"
          dataKey="valor_pago"
          stroke="#DB1F8D"
          fillOpacity={1}
          fill="url(#colorValores)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
