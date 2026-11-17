import { useLocation, useParams } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import TabsInforme from "./TabsInforme";

/*
    Las pestañas del informe de un evento. Cada una es una ruta del mismo
    evento (el idEvento sale de la URL) y la activa se deduce de la URL
    actual, así quien las dibuja no tiene que avisar en cuál está.
*/
const TabsInformeEvento = () => {
  const { idEvento = "" } = useParams();
  const { pathname } = useLocation();
  const activa = ["entradas", "buffet", "finanzas"].find((tab) => pathname.endsWith(`/${tab}`)) ?? "general";

  return (
    <TabsInforme
      activeTab={activa}
      tabs={[
        { id: "general", label: "General", to: RUTAS.informes.general(idEvento) },
        { id: "entradas", label: "Entradas", to: RUTAS.informes.entradas(idEvento) },
        { id: "buffet", label: "Buffet", to: RUTAS.informes.buffet(idEvento) },
        { id: "finanzas", label: "Finanzas", to: RUTAS.informes.finanzas(idEvento) },
      ]}
    />
  );
};

export default TabsInformeEvento;
