import { Typography, useTheme } from '@mui/material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const ContactRadarChart = ({ contactMethods }: { contactMethods: Record<string, number> }) => {
  const theme = useTheme();
  const data = Object.entries(contactMethods).map(([method, count]) => ({
    subject: method.charAt(0).toUpperCase() + method.slice(1).toLowerCase(),
    count: count,
    max: Math.max(...Object.values(contactMethods))
  }));

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
        sx={{ display: 'block', mb: 2, letterSpacing: '0.5px' }}
      >
        Métodos de Contato
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="70%"
          data={data}
          margin={{ top: 0, right: 20, bottom: 20, left: 20 }}
        >
          <PolarGrid 
            stroke={theme.palette.divider}
            strokeDasharray="3 3" 
          />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{
              fill: theme.palette.text.secondary,
              fontSize: 12
            }}
          />
          <PolarRadiusAxis 
            angle={30}
            domain={[0, 'dataMax + 2']}
            tick={{
              fill: theme.palette.text.secondary,
              fontSize: 10
            }}
          />
          <Radar
            name="Contatos"
            dataKey="count"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.2}
            strokeWidth={1.5}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              boxShadow: theme.shadows[2],
              color: theme.palette.text.primary
            }}
            formatter={(value: number, name: string) => [
              value,
              `Contatos via ${name.charAt(0).toUpperCase() + name.slice(1)}`
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};