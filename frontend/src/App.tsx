import Sidebar from "./app/ui/navegacion/Sidebar";
import InicioSeg from "./app/features/seguridad/pages/InicioSeg";
import Usuarios from "./app/features/seguridad/pages/Usuarios";
import Perfiles from "./app/features/seguridad/pages/Perfiles";
import Auditorias from "./app/features/seguridad/pages/Auditorias";
import EditarPerfilForm from "./app/features/seguridad/forms/EditarPerfilForm";



function App() {
  

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar/>
        <main  className="flex-1 p-6 overflow-y-auto bg-gray-100">
           
            <Perfiles/>
           
        </main>
        
      </div>
      
    </>
  )
}

export default App
