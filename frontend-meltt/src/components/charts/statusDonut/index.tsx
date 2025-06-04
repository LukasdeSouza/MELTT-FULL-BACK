import { Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface StatusDonutChartProps {
  statusDistribution: Record<string, number>;
  chartTitle?: string;
}

export const StatusDonutChart = ({ 
  statusDistribution,
  chartTitle = "Distribuição por Responsável" 
}: StatusDonutChartProps) => {
  const theme = useTheme();
  const data = Object.entries(statusDistribution).map(([name, value]) => ({ name, value }));
  
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      height: '100%'
    }}>
      <Typography 
        variant="overline" 
        color="textSecondary"
        sx={{ display: 'block', mb: 1, letterSpacing: '0.5px' }}
      >
        {chartTitle}
      </Typography>
      
      <ResponsiveContainer width="100%" height={300}>
        {/* Restante do código permanece igual */}
        <PieChart>
          <Pie
            data={data}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            stroke={theme.palette.background.paper}
            strokeWidth={2}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              boxShadow: theme.shadows[2]
            }}
            formatter={(value: number, name: string) => [
              value, 
              name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
            ]}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}>
                {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};