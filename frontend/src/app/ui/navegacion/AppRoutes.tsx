import Dashboard from "../../features/dashboard/pages/Dashboard";
import InicioAdministracion from "../../features/administracion/pages/InicioAdmin";
import InicioEventos from "../../features/eventos/pages/InicioEventos";
import InicioSeg from "../../features/seguridad/pages/InicioSeg";
import Usuarios from "../../features/seguridad/pages/Usuarios";
import Perfiles from "../../features/seguridad/pages/Perfiles";
import Auditorias from "../../features/seguridad/pages/Auditorias";
import ProveedoresPage from "../../features/administracion/pages/Proveedores";
import EventoPage from "../../features/eventos/pages/EventoPage";
import { Routes, Route } from "react-router-dom";
import Ventas from "../../features/eventos/pages/Ventas";
import Productos from "../../features/administracion/pages/Productos";
import AdministrarEvento from "../../features/administracion/pages/AdministrarEvento";
import InformesResumenAnual from "../../features/informes/pages/InformesResumenAnual";
import InformeEntradasEvento from "../../features/informes/pages/InformeEntradasEvento";
import InformeBuffetEvento from "../../features/informes/pages/InformeBuffetEvento";
import FinanzasEvento from "../../features/informes/pages/FinanzasEvento";
import DashboardLayout from "../../layouts/DashboardLayout";

const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="seguridad">
                    <Route index element={<InicioSeg />}/>
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="perfiles" element={<Perfiles />} />
                    <Route path="auditorias" element={<Auditorias />} />
                </Route>
                <Route path="eventos">
                    <Route index element={<InicioEventos />}/>
                    <Route path="crear" element={<EventoPage modo={"crear"} estadoEvento={"finalizado"}/> } />
                    <Route path="evento" element={<EventoPage modo={"ver"} estadoEvento="finalizado"/>} />
                    <Route path=":idEvento/ventas" element={<Ventas/>} />
                    <Route path=":idEvento/administracion" element={<AdministrarEvento nombre="S" fecha="2024/05/21" estado="activo" />} />
                    <Route path=":idEvento/informes/entradas" element={<InformeEntradasEvento />} />
                    <Route path=":idEvento/informes/buffet" element={<InformeBuffetEvento />} />
                    <Route path=":idEvento/informes/finanzas" element={<FinanzasEvento />} />
                </Route>
                    <Route path="administracion">
                    <Route index element={<InicioAdministracion />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="proveedores" element={<ProveedoresPage />} />
                    <Route path="rubros" element={<div>Rubros</div>} />
                </Route>
                <Route path="informes">
                    <Route index element={<InformesResumenAnual />} />
                    <Route path="resumen-anual" element={<InformesResumenAnual />} />
                </Route>
                
                
            </Route>
        </Routes>
    )
}

export default AppRoutes;
