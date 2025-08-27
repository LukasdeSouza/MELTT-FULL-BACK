export default function CnpjMask(value: string): string {
    // Remove tudo que não for número
    value = value.replace(/\D/g, '').slice(0, 14);

    // CNPJ: 00.000.000/0000-00
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');

    return value;
}