import ptBrLocale from '@fullcalendar/core/locales/pt-br';

export const calendarOptions = {
  locales: [ptBrLocale],
  locale: 'pt-br',
  buttonText: {
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia'
  },
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }
};