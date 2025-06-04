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
import { format } from 'date-fns';

const formatKey = (key: string) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const CustomTooltip = ({ payload, label }: { payload?: any; label?: any }) => {
  if (!payload || payload.length === 0) return null;

  const formattedDate = label ? format(new Date(label), "dd/MM/yyyy") : "";

  return (
    <div className="custom-tooltip bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-100 dark:border-gray-700">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2">
        {formattedDate}
      </div>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => {
          const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(entry.value);
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {formatKey(entry.dataKey)}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {valorFormatado}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: { payload?: any }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 px-4 py-2">
      {payload.map((entry: any, index: number) => (
        <div
          className="flex items-center gap-2 text-sm"
          key={index}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {formatKey(entry.value)}
          </span>
          <span className="text-gray-400">por Dia de Vencimento</span>
        </div>
      ))}
    </div>
  );
};

const CustomLineChart = ({ data }: { data: any }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <defs>
          <linearGradient id="colorValores" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor="#DB1F8D" stopOpacity={0.4} />
            <stop offset="90%" stopColor="#DB1F8D" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          stroke="#F3F4F6"
          vertical={false}
        />

        <XAxis
          dataKey="data_valor"
          tickFormatter={(tick) => format(new Date(tick), "dd/MM/yyyy")}
          tick={{
            fontSize: 12,
            fill: "#6B7280",
            fontFamily: "Inter, sans-serif"
          }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={{ stroke: "#E5E7EB" }}
        />

        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0
            }).format(value)
          }
          tick={{
            fontSize: 12,
            fill: "#6B7280",
            fontFamily: "Inter, sans-serif"
          }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={{ stroke: "#E5E7EB" }}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: "#E5E7EB",
            strokeWidth: 1,
            strokeDasharray: "4 4"
          }}
        />

        <Legend content={<CustomLegend />} wrapperStyle={{ paddingTop: 20 }} />

        <Area
          type="monotone"
          dataKey="valor_pago"
          stroke="#DB1F8D"
          strokeWidth={2}
          fill="url(#colorValores)"
          fillOpacity={1}
          activeDot={{
            r: 6,
            fill: "#DB1F8D",
            stroke: "#FFF",
            strokeWidth: 2
          }}
          animationDuration={400}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;