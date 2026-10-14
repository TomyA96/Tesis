import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import type { DatosComprador } from "../compra";

type DatosCompradorFormProps = {
    // Los datos viven en la página (no acá): así no se pierden al volver al resumen.
    datos: DatosComprador;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string;
    onVolver: () => void;
    onContinuar: (e: React.FormEvent) => void;
};

const DatosCompradorForm = ({ datos, onChange, error, onVolver, onContinuar }: DatosCompradorFormProps) => {
    return (
        <Formulario onSubmit={onContinuar} autoComplete="on">
            {/* Los inputs de 16 px (text-base) evitan el zoom automático de iPhone
                al tocar un campo, y autoComplete deja que el celular ofrezca los
                datos guardados. */}
            <Input label="Nombre y apellido" name="nombre" autoComplete="name" required value={datos.nombre} onChange={onChange} />
            <Input label="DNI" name="dni" inputMode="numeric" required value={datos.dni} onChange={onChange} />
            <Input label="Email" name="email" type="email" autoComplete="email" required value={datos.email} onChange={onChange} />
            <Input label="Repetir email" name="emailRepetido" type="email" required value={datos.emailRepetido} onChange={onChange} />
            <Input label="Teléfono (opcional)" name="telefono" type="tel" autoComplete="tel" value={datos.telefono} onChange={onChange} />

            {error && <span className="text-sm text-red-600">{error}</span>}

            <div className="flex gap-3 justify-end">
                <Btn type="button" variant="cancel" onClick={onVolver}>Volver</Btn>
                <Btn type="submit">Continuar al pago</Btn>
            </div>
        </Formulario>
    );
};

export default DatosCompradorForm;
