/*
    Transformaciones para los DTOs (con @Transform de class-transformer): se
    aplican ANTES de validar. Si el valor no es texto lo dejan igual, para que
    la regla de tipo (IsString, IsEmail...) sea la que lo rechace.
*/

// Sin espacios en los extremos: "   " queda vacío y "  ab  " queda "ab", así las reglas de largo miden lo real
export const limpiarTexto = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

// Email sin espacios y en minúsculas: "AUDIO@x.com" y "audio@x.com" son el mismo
export const normalizarEmail = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

/*
    Clave para comparar nombres: sin espacios en los extremos, sin mayúsculas
    y sin tildes, así "Choripán", "choripan" y "CHORIPAN" son el mismo
    producto. La ñ se respeta: "Piña" y "Pina" son palabras distintas.

    Cómo funciona: normalize('NFD') separa cada letra de su tilde
    ("á" pasa a ser "a" + una tilde suelta) y el replace borra esas
    tildes sueltas, salvo la virgulilla que va después de una n (la ñ).
    Al final normalize('NFC') vuelve a juntar la ñ en una sola letra.
*/
export const claveDeComparacion = (texto: string) =>
    texto
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/(?<!n)\u0303|[\u0300-\u0302\u0304-\u036f]/g, '')
        .normalize('NFC');

export const mismoNombre = (a: string, b: string) => claveDeComparacion(a) === claveDeComparacion(b);
