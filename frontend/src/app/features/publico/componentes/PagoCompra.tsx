import Btn from "../../../ui/componentes/Btn";
import type { DatosComprador, LineaCompra } from "../compra";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";

type PagoCompraProps = {
    lineas: LineaCompra[];
    total: number;
    datos: DatosComprador;
    // La página manda la compra al backend; mientras tanto "enviando" bloquea los botones.
    enviando: boolean;
    error: string;
    onPagar: () => void;
    onVolver: () => void;
};

const PagoCompra = ({ lineas, total, datos, enviando, error, onPagar, onVolver }: PagoCompraProps) => {
    const isComplete = lineas.length > 0 && datos.email.trim() !== "";

    return (
        <div className="flex flex-col gap-4">
            {/* Último paso antes de pagar: el usuario revisa qué compra y a nombre
                de quién. El botón "Pagar" le pedirá al backend crear la orden y
                llevará al usuario a la pantalla del proveedor de pagos (tarjeta
                o QR), que no es nuestra. */}
            <section className="flex flex-col gap-3 p-4 md:p-6 border rounded-2xl border-gray-300">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tus entradas</h2>

                {lineas.length > 0 ? (
                    <>
                        <ul className="flex flex-col gap-2">
                            {lineas.map((linea) => (
                                <li key={linea.idEntrada} className="flex justify-between items-end gap-2 font-semibold">
                                    <span>
                                        {linea.descripcion}
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            {linea.cantidad} × {formatPrecioEntrada(linea.precioUnitario)}
                                        </span>
                                    </span>
                                    <span aria-hidden="true" className="flex-1 border-b-2 border-dotted border-gray-300 mb-1" />
                                    <span>{formatPrecioEntrada(linea.precioUnitario * linea.cantidad)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                            <span className="font-semibold">Total a pagar</span>
                            <span className="text-2xl font-bold text-noche">{formatPrecioEntrada(total)}</span>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">No hay entradas seleccionadas.</p>
                )}
            </section>

            <section className="flex flex-col gap-3 p-4 md:p-6 border rounded-2xl border-gray-300">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Datos del comprador</h2>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    <dt className="text-gray-500">Nombre</dt>
                    <dd className="font-semibold wrap-break-word">{datos.nombre}</dd>
                    <dt className="text-gray-500">DNI</dt>
                    <dd className="font-semibold">{datos.dni}</dd>
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-semibold wrap-break-word">{datos.email}</dd>
                    {datos.telefono.trim() !== "" && (
                        <>
                            <dt className="text-gray-500">Teléfono</dt>
                            <dd className="font-semibold">{datos.telefono}</dd>
                        </>
                    )}
                </dl>

                <p className="text-sm text-gray-500">
                    Las entradas se enviarán a este email. Revisalo bien antes de pagar.
                </p>
            </section>

            {error && <span className="text-sm text-red-600">{error}</span>}

            <div className="flex justify-end gap-4">
                <Btn type="button" variant="cancel" disabled={enviando} onClick={onVolver}>Volver</Btn>
                <Btn type="button" disabled={!isComplete || enviando} variant="success" onClick={onPagar}>
                    {enviando ? "Procesando…" : total === 0 ? "Confirmar entradas" : `Pagar ${formatPrecioEntrada(total)}`}
                </Btn>
            </div>
        </div>
    );
};

export default PagoCompra;
