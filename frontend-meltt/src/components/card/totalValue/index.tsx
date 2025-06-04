import { Typography } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const TotalValueCard = ({ totalAgreedValue, listPreContrato }: { 
  totalAgreedValue: number, 
  listPreContrato: any[] 
}) => {
  // Formata dados para histórico mensal
  const monthlyData = listPreContrato.reduce((acc, item) => {
    const month = new Date(item.created_at).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + parseFloat(item.agreedValue);
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitaliza o mês
    value 
  }));

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: 200,
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Título e valor sobreposto */}
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        zIndex: 1,
        pointerEvents: 'none' // Permite interação com o gráfico
      }}>
        <Typography 
          variant='overline' 
          color='textSecondary'
          sx={{ letterSpacing: '0.5px' }}
        >
          Valor Total Acordado
        </Typography>
        <Typography 
          variant='h5' 
          color='textPrimary'
          sx={{ 
            fontWeight: 700,
            lineHeight: 1.2,
            mt: 0.5
          }}
        >
          {totalAgreedValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </Typography>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f5f5f5" 
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1976d2" // Usa a cor primary do MUI
            fill="#90caf9"   // Tonalidade mais clara do primary
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <YAxis 
            hide 
            domain={[0, 'auto']} 
          />
          <XAxis 
            dataKey="name" 
            axisLine={{ stroke: '#e0e0e0' }}
            tick={{ fill: '#616161', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [
              value.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }),
              'Valor'
            ]}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};