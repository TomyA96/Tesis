import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import HomePage from "../../features/publico/pages/HomePage";
import EventoDetallePage from "../../features/publico/pages/EventoDetallePage";
import PublicLayout from "../../layouts/PublicLayout";
import CompraPage from "../../features/publico/pages/CompraPage";
import RequierePermiso from "./RequierePermiso";
import ResultadoCompraPage from "../../features/publico/pages/ResultadoCompraPage";

/*
    Todo lo de /admin se carga con lazy() en vez de import estático: así
    un visitante de la home pública nunca descarga el código del panel de
    administración, solo el de las rutas que realmente visita. LoginPage y
    HomePage quedan como imports normales porque son lo primero que
    cualquiera necesita, sin sentido en retrasarlas con una carga aparte.
*/
const DashboardLayout = lazy(() => import("../../layouts/DashboardLayout"));
const Dashboard = lazy(() => import("../../features/dashboard/pages/Dashboard"));
const AdministracionHomePage = lazy(() => import("../../features/administracion/pages/AdministracionHomePage"));
const EventosHomePage = lazy(() => import("../../features/eventos/pages/EventosHomePage"));
const SeguridadHomePage = lazy(() => import("../../features/seguridad/dashboard/pages/SeguridadHomePage"));
const UsuariosPage = lazy(() => import("../../features/seguridad/usuarios/pages/UsuariosPage"));
const PerfilesPage = lazy(() => import("../../features/seguridad/perfiles/pages/PerfilesPage"));
const AuditoriasPage = lazy(() => import("../../features/seguridad/auditorias/pages/AuditoriasPage"));
const ProveedoresPage = lazy(() => import("../../features/administracion/pages/ProveedoresPage"));
const FuentesIngresoPage = lazy(() => import("../../features/administracion/pages/FuentesIngresoPage"));
const PuntosVentaPage = lazy(() => import("../../features/eventos/pages/PuntosVentaPage"));
const TicketsPage = lazy(() => import("../../features/eventos/pages/TicketsPage"));
const RendicionesPage = lazy(() => import("../../features/eventos/pages/RendicionesPage"));
const EventoPage = lazy(() => import("../../features/eventos/pages/EventoPage"));
const JornadaPage = lazy(() => import("../../features/eventos/pages/JornadaPage"));
const VentasPage = lazy(() => import("../../features/eventos/pages/VentasPage"));
const ProductosPage = lazy(() => import("../../features/administracion/pages/ProductosPage"));
const RubrosPage = lazy(() => import("../../features/administracion/pages/RubrosPage"));
const AdministrarEventoPage = lazy(() => import("../../features/administracion/pages/AdministrarEventoPage"));
const InformesHomePage = lazy(() => import("../../features/informes/pages/InformesHomePage"));
const InformeEntradasEventoPage = lazy(() => import("../../features/informes/pages/InformeEntradasEventoPage"));
const InformeBuffetEventoPage = lazy(() => import("../../features/informes/pages/InformeBuffetEventoPage"));
const FinanzasEventoPage = lazy(() => import("../../features/informes/pages/FinanzasEventoPage"));
const OperacionesHomePage = lazy(() => import("../../features/operaciones/pages/OperacionesHomePage"));
const OperacionesJornadaLayout = lazy(() => import("../../features/operaciones/pages/OperacionesJornadaLayout"));
const ControlAccesos = lazy(() => import("../../features/operaciones/pages/ControlAccesos"));
const VentaEntradas = lazy(() => import("../../features/operaciones/pages/VentaEntradas"));
const PanelVentas = lazy(() => import("../../features/operaciones/pages/PanelVentas"));

const AppRoutes = () => {
    return(
        <Routes>

            <Route element={<PublicLayout/>}>
                <Route path="/" element={<HomePage/>} />
                <Route path="/eventos/:idEvento" element={<EventoDetallePage/>} />
                <Route path="/eventos/:idEvento/comprar" element={<CompraPage/>} />
                <Route path="/compra/resultado" element={<ResultadoCompraPage/>} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute/>}>
                <Route
                    path="/admin"
                    element={
                        <Suspense fallback={<div className="p-8 text-sm text-gray-500">Cargando…</div>}>
                            <DashboardLayout />
                        </Suspense>
                    }
                >
                        <Route index element={<Dashboard />} />
                        <Route path="seguridad">
                        <Route index element={<SeguridadHomePage />}/>
                        <Route path="usuarios" element={<UsuariosPage />} />
                        <Route path="perfiles" element={<PerfilesPage />} />
                        <Route path="auditorias" element={<AuditoriasPage />} />
                    </Route>
                    <Route path="eventos">
                        <Route index element={<EventosHomePage />}/>
                        <Route path="crear" element={<EventoPage/> } />
                        <Route path="puntos-venta" element={<PuntosVentaPage />} />
                        <Route path=":idEvento" element={<EventoPage/>} />
                        <Route path=":idEvento/jornadas/:idJornada" element={<JornadaPage/>} />
                        <Route path=":idEvento/ventas" element={<VentasPage/>} />
                        <Route path=":idEvento/tickets" element={<TicketsPage />} />
                        <Route path=":idEvento/rendiciones" element={<RendicionesPage />} />
                        <Route path=":idEvento/administracion" element={<AdministrarEventoPage />} />
                        <Route path=":idEvento/informes/entradas" element={<InformeEntradasEventoPage />} />
                        <Route path=":idEvento/informes/buffet" element={<InformeBuffetEventoPage />} />
                        <Route path=":idEvento/informes/finanzas" element={<FinanzasEventoPage />} />
                    </Route>
                        <Route path="administracion">
                        <Route index element={<AdministracionHomePage />} />
                        <Route path="productos" element={<ProductosPage />} />
                        <Route path="proveedores" element={<ProveedoresPage />} />
                        <Route path="fuentes-ingreso" element={<FuentesIngresoPage />} />
                        <Route path="rubros" element={<RubrosPage />} />
                    </Route>
                    <Route path="informes">
                        <Route index element={<InformesHomePage />} />
                        <Route path="resumen-anual" element={<InformesHomePage />} />
                    </Route>
                    <Route path="operaciones">
                        <Route index element={<OperacionesHomePage />} />
                        <Route path="jornadas/:idJornada" element={<OperacionesJornadaLayout />}>
                            <Route path="accesos" element={<RequierePermiso permiso="accesos.registrar"><ControlAccesos /></RequierePermiso>} />
                            <Route path="venta-entradas" element={<RequierePermiso permiso="entradas.vender"><VentaEntradas /></RequierePermiso>} />
                            <Route path="buffet" element={<RequierePermiso permiso="buffet.vender"><PanelVentas /></RequierePermiso>} />
                        </Route>
                    </Route>


                </Route>
            </Route>
        </Routes>
    )
}

export default AppRoutes;
