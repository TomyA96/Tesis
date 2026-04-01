import DashboardLayout from "./app/layouts/DashboardLayout";
import Dashboard from "./app/features/dashboard/pages/Dashboard";
import InicioAdministracion from "./app/features/administracion/pages/InicioAdmin";
import InicioEventos from "./app/features/eventos/pages/InicioEventos";
import InicioSeg from "./app/features/seguridad/pages/InicioSeg";
import Usuarios from "./app/features/seguridad/pages/Usuarios";
import Perfiles from "./app/features/seguridad/pages/Perfiles";
import Auditorias from "./app/features/seguridad/pages/Auditorias";
import ProveedoresPage from "./app/features/administracion/pages/Proveedores";
import EventoPage from "./app/features/eventos/pages/EventoPage";
import { Routes, Route } from "react-router-dom";
import Ventas from "./app/features/eventos/pages/Ventas";
import Productos from "./app/features/administracion/pages/Productos";
import AdministrarEvento from "./app/features/administracion/pages/AdministrarEvento";



function App() {
  
  return (
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
          <Route path="ventasEvento" element={<Ventas/>} />
        </Route>
        <Route path="administracion">
          <Route index element={<InicioAdministracion />} />
          <Route path="productos" element={<Productos />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="rubros" element={<div>Rubros</div>} />
          <Route path="administrarEvento" element={<AdministrarEvento nombre="S" fecha="2024/05/21" estado="activo" />} />

        </Route>
        
        
      </Route>
    </Routes>
  )
}

export default App
