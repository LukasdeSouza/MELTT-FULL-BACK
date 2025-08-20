export default function formatDateToDDMMYYYY(isoDate: string | number | Date) {
    const date = new Date(isoDate);

    // Pega dia, mês e ano
    const day = String(date.getDate()).padStart(2, "0");      // garante dois dígitos
    const month = String(date.getMonth() + 1).padStart(2, "0"); // meses começam do 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}