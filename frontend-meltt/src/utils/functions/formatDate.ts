export default function formatDateToDDMMYYYY(isoDate: string | number | Date) {
    const date = new Date(isoDate);

    // Usar métodos UTC para evitar problemas com fuso horário
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export function formatDateToDDMMYYYY_Split(isoDate: string) {
    if (typeof isoDate === 'string' && isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }
    
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}