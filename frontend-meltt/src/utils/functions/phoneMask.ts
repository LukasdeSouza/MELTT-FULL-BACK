export default function phoneMask(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const len = digits.length;

    const ddd = digits.slice(0, 2);

    if (len > 10) {
        const p1 = digits.slice(2, 3); 
        const p2 = digits.slice(3, 7); 
        const p3 = digits.slice(7, 11);
        let out = '';
        if (ddd) out = `(${ddd}`;
        if (len >= 3) out += ')';
        if (p1) out += ` ${p1}`;
        if (p2) out += ` ${p2}`;
        if (p3) out += `-${p3}`;
        return out;
    }

    const f1 = digits.slice(2, 6);
    const f2 = digits.slice(6, 10);
    let out = '';
    if (ddd) out = `(${ddd}`;
    if (len >= 3) out += ')';
    if (f1) out += ` ${f1}`;
    if (f2) out += `-${f2}`;
    return out;
}