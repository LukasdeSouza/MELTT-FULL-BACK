const resetPhoneNumber = (value) => {
    if (!value) return value;

    // Remove todos os caracteres que não sejam dígitos
    return value.replace(/\D/g, "");
}

export default resetPhoneNumber;