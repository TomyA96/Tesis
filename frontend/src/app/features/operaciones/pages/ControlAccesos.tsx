import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import Input from "../../../ui/componentes/Input";
import ScannerMock from "../componentes/ScannerMock";

const ControlAccesos = () => {
  return (
    <main className="px-6 pb-8">
      <div className="mx-auto max-w-5xl">
        <ContenedorDatos className="overflow-visible">
          <Header titulo="Control de accesos" />
          <div className="grid gap-6 p-8">
            <ScannerMock />

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <Input
                  label="Codigo manual de respaldo"
                  name="codigoManual"
                  placeholder="Ingresar codigo si el scanner no responde"
                  autoComplete="off"
                />
                <Btn size="lg" className="w-full md:w-auto">
                  Confirmar Ingreso
                </Btn>
              </div>
            </div>
          </div>
        </ContenedorDatos>
      </div>
    </main>
  );
};

export default ControlAccesos;
