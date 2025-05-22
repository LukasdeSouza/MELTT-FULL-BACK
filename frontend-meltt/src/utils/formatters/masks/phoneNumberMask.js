const formatPhoneNumber = (value) => {
    if (!value) return value;

    // Remove todos os caracteres que não sejam dígitos
    value = value.replace(/\D/g, "");

    // Limita a 11 dígitos (para evitar números muito grandes)
    value = value.slice(0, 11);

    // Aplica a máscara conforme o tamanho do número
    if (value.length > 10) {
        return value.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (value.length > 6) {
        return value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (value.length > 2) {
        return value.replace(/^(\d{2})(\d{0,4})$/, "($1) $2");
    } else if (value.length > 0) {
        return value.replace(/^(\d{0,2})$/, "($1");
    }

    return value;
};

export default formatPhoneNumber;
