import { useState } from "react";
import Btn from "../../../ui/componentes/Btn";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { RUTAS } from "../../../constantes/Rutas";
import GastoModal from "../modales/GastoModal";
import IngresoModal from "../modales/IngresoModal";
import type { Rubro } from "../../../services/rubrosService";
import type { Proveedor } from "../../../services/proveedoresService";
import type { FuenteIngreso } from "../../../services/fuentesIngresoService";

type ModalRegistrar = "nuevoGasto" | "nuevoIngreso" | null;

type AccionesCardEventoProps = {
    idEvento: number;
    rubros: Rubro[];
    proveedores: Proveedor[];
    fuentes: FuenteIngreso[];
};

/*
    Se arma desde AdministracionHomePage (que es quien tiene rubros y proveedores) y se le
    pasa a CardEvent como acciones: así CardEvent no necesita recibir datos que
    no usa solo para pasárselos a los modales.
*/
const AccionesCardEvento = ({ idEvento, rubros, proveedores, fuentes }: AccionesCardEventoProps) => {
    const [modalActivo, setModalActivo] = useState<ModalRegistrar>(null);
    const cerrarModal = () => setModalActivo(null);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <Btn variant="outline" size="sm" className="flex-1" onClick={() => setModalActivo("nuevoGasto")}>
                    Registrar Gasto
                </Btn>
                <Btn variant="outline" size="sm" className="flex-1" onClick={() => setModalActivo("nuevoIngreso")}>
                    Registrar Ingreso
                </Btn>
            </div>
            <LinkBtn variant="primary" size="sm" className="w-full" to={RUTAS.administracion.administrarEvento(idEvento)}>
                Administrar Evento
            </LinkBtn>

            <GastoModal
                isOpen={modalActivo === "nuevoGasto"}
                closeModal={cerrarModal}
                idEvento={idEvento}
                rubros={rubros}
                proveedores={proveedores}
            />
            <IngresoModal
                isOpen={modalActivo === "nuevoIngreso"}
                closeModal={cerrarModal}
                idEvento={idEvento}
                rubros={rubros}
                fuentes={fuentes}
            />
        </div>
    );
};

export default AccionesCardEvento;
