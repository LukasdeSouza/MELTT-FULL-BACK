import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";


type CustomizedLabelType = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: string;
};

const CustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: CustomizedLabelType) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
    >
      Nota:{value}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(data.resultado);

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{data.key}</p>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>{valorFormatado}</p>
      </div>
    );
  }
  return null;
};

type PieChartData = {
  key: string;
  resultado: number;
};

type CustomPieChartProps = {
  data: PieChartData[];
  COLORS: string[];
};

const CustomPieChart = ({ data, COLORS }: CustomPieChartProps) => {
  return (
    <PieChart width={300} height={320}>
      <Pie
        data={data}
        cx={150}
        cy={100}
        innerRadius={40}
        outerRadius={80}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="resultado"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        {data.map((entry, index) => (
          <CustomizedLabel
            key={`label-${index}`}
            cx={150}
            cy={100}
            midAngle={(index * 360) / data.length + 360 / data.length / 2}
            innerRadius={40}
            outerRadius={80}
            value={entry.key}
          />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend/>
    </PieChart>
  );
};

export default CustomPieChart;
